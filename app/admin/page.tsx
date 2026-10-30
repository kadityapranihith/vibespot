'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ExternalLink,
  Loader2,
  ArrowLeft,
  UtensilsCrossed,
  Filter,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  MessageSquarePlus,
  BarChart3,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Bug,
  MessageCircle,
} from 'lucide-react';
import { PlaceEditModal, AdminPlace } from '@/components/admin/PlaceEditModal';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { CATEGORIES, STANDARDIZED_TAGS } from '@/types';
import { formatPrice, normalizeTags, extractUniqueTags } from '@/lib/utils';

export interface FeedbackItem {
  id: number;
  topic: 'bug' | 'feature' | 'place' | 'other';
  subject: string | null;
  description: string;
  sender_name: string | null;
  sender_email: string | null;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user, isAdmin, loading, getIdToken } = useAuth();
  const router = useRouter();

  // Active top-level Tab: 'spots', 'feedback', or 'analytics'
  const [activeTab, setActiveTab] = useState<'spots' | 'feedback' | 'analytics'>('spots');

  // Spots State
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Spots Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');

  // Spots Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AdminPlace | null>(null);

  // Spots Delete Confirmation State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [feedbackTopicFilter, setFeedbackTopicFilter] = useState<string>('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<number | null>(null);
  const [deletingFeedbackItem, setDeletingFeedbackItem] = useState<FeedbackItem | null>(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);

  // Load places from admin API
  const fetchPlaces = async () => {
    if (!user || !isAdmin) return;
    setLoadingPlaces(true);
    setError('');

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication token not available');

      const res = await fetch('/api/admin/places', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load places');

      setPlaces(data.places || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading places');
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Load feedback from admin API
  const fetchFeedback = async () => {
    if (!user || !isAdmin) return;
    setLoadingFeedback(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication token not available');

      const res = await fetch('/api/feedback', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load feedback');

      setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchPlaces();
      fetchFeedback();
    }
  }, [user, isAdmin]);

  // 1-Click Publish/Unpublish Toggle
  const handleTogglePublish = async (place: AdminPlace) => {
    const updatedStatus = !place.is_published;
    const oldPlaces = [...places];

    // Optimistic UI update
    setPlaces((prev) =>
      prev.map((p) => (p.id === place.id ? { ...p, is_published: updatedStatus } : p))
    );

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/admin/places', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: place.id,
          is_published: updatedStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setSuccessMsg(
        `"${place.name}" is now ${updatedStatus ? 'LIVE on website' : 'HIDDEN from discovery'}`
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      // Revert optimistic update
      setPlaces(oldPlaces);
      setError('Could not update status. Please try again.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Delete Place handler
  const handleDeletePlace = async (id: number) => {
    setIsDeleting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/admin/places?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setPlaces((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
      setSuccessMsg('Place deleted successfully from database');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete place');
    } finally {
      setIsDeleting(false);
    }
  };

  // Feedback Status Handler
  const handleUpdateFeedbackStatus = async (
    id: number,
    status: 'new' | 'in_progress' | 'resolved'
  ) => {
    setUpdatingFeedbackId(id);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update feedback status');

      setFeedbackList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
      setSuccessMsg(`Feedback status marked as "${status.replace('_', ' ')}"`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      setTimeout(() => setError(''), 4000);
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  // Feedback Delete Handler
  const handleDeleteFeedback = async (id: number) => {
    setIsDeletingFeedback(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete feedback');

      setFeedbackList((prev) => prev.filter((f) => f.id !== id));
      setDeletingFeedbackItem(null);
      setSuccessMsg('Feedback removed');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feedback');
      setTimeout(() => setError(''), 4000);
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  // Turn Spot Suggestion into New Restaurant
  const handleConvertFeedbackToSpot = (item: FeedbackItem) => {
    const suggestedName = item.subject || 'Suggested Restaurant Spot';
    setEditingPlace({
      name: suggestedName,
      address: 'Kakinada',
      category: 'Cafés',
      is_published: true,
      tags: ['Student Friendly'],
    });
    setIsModalOpen(true);
  };

  // Filtered places calculation
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchAddress = p.address.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const tags = normalizeTags(p.tags);
        const matchTags = tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchAddress && !matchCat && !matchTags) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'published' && !p.is_published) return false;
      if (statusFilter === 'hidden' && p.is_published) return false;

      return true;
    });
  }, [places, search, selectedCategory, statusFilter]);

  // Tags matching the discovery filter modal + any custom tags from existing places
  const availableFilterTags = useMemo(() => {
    const extracted = extractUniqueTags(
      places.map((p) => ({ ...p, id: String(p.id) } as any))
    );
    const merged = Array.from(new Set([...STANDARDIZED_TAGS, ...extracted]));
    return merged.sort((a, b) => a.localeCompare(b));
  }, [places]);

  // Filtered feedback calculation
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((f) => {
      if (feedbackStatusFilter !== 'all' && f.status !== feedbackStatusFilter) {
        return false;
      }
      if (feedbackTopicFilter !== 'all' && f.topic !== feedbackTopicFilter) {
        return false;
      }
      if (feedbackSearch.trim()) {
        const q = feedbackSearch.toLowerCase();
        const matchSub = (f.subject || '').toLowerCase().includes(q);
        const matchDesc = f.description.toLowerCase().includes(q);
        const matchSender = (f.sender_name || '').toLowerCase().includes(q);
        const matchEmail = (f.sender_email || '').toLowerCase().includes(q);
        if (!matchSub && !matchDesc && !matchSender && !matchEmail) return false;
      }
      return true;
    });
  }, [feedbackList, feedbackStatusFilter, feedbackTopicFilter, feedbackSearch]);

  // Spots summary counts
  const totalCount = places.length;
  const publishedCount = places.filter((p) => p.is_published).length;
  const hiddenCount = places.filter((p) => !p.is_published).length;

  // Feedback summary counts
  const totalFeedbackCount = feedbackList.length;
  const newFeedbackCount = feedbackList.filter((f) => f.status === 'new').length;
  const inProgressFeedbackCount = feedbackList.filter((f) => f.status === 'in_progress').length;
  const resolvedFeedbackCount = feedbackList.filter((f) => f.status === 'resolved').length;

  // Helpers for feedback cards
  const formatFeedbackDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTopicBadge = (topic: string) => {
    switch (topic) {
      case 'bug':
        return {
          label: 'Bug Report',
          emoji: '🐛',
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        };
      case 'feature':
        return {
          label: 'Feature Idea',
          emoji: '💡',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        };
      case 'place':
        return {
          label: 'Spot Suggestion',
          emoji: '🍽️',
          bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
        };
      default:
        return {
          label: 'General Feedback',
          emoji: '💬',
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'New',
          className: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          className: 'bg-sky-100 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          label: status,
          className: 'bg-stone-100 text-stone-700 border-stone-200',
          dot: 'bg-stone-400',
        };
    }
  };

  // 1. Loading auth state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-orange-600" />
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Verifying Admin Credentials...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated user
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Admin Portal Login</h1>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          You must be logged in with an authorized administrator account to access restaurant management.
        </p>
        <Link
          href="/auth/login?redirect=/admin"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm transition-all"
        >
          Sign in to Admin Portal
        </Link>
      </div>
    );
  }

  // 3. Logged-in user without Admin permissions
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Access Denied</h1>
        <p className="text-xs text-stone-500 mb-1 leading-relaxed">
          Signed in as: <strong className="text-stone-800">{user.email}</strong>
        </p>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          This account is not registered as an authorized administrator for Vibespot Kakinada.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft size={14} /> Back to Food Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <ShieldCheck size={12} /> Admin Portal
                </span>
                <span className="text-xs text-stone-400">{user.email}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Vibespot Control Center
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Manage Kakinada food spots, verify listings, and respond to community bug reports & suggestions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-white/10 hover:bg-white/15 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> View Website
              </Link>

              {activeTab === 'spots' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlace(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-500/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={15} />
                  <span>Add New Restaurant</span>
                </button>
              )}
            </div>
          </div>

          {/* Top Level Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-stone-800">
            <button
              type="button"
              onClick={() => setActiveTab('spots')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'spots'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-stone-300'
              }`}
            >
              <UtensilsCrossed size={14} />
              <span>Food Spots ({totalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-stone-300'
              }`}
            >
              <MessageSquarePlus size={14} />
              <span>Feedback & Bugs ({totalFeedbackCount})</span>
              {newFeedbackCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                  {newFeedbackCount} new
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-stone-300'
              }`}
            >
              <BarChart3 size={14} />
              <span>Analytics & Traffic</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Toast Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium shadow-xs">
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: FOOD SPOTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'spots' && (
          <>
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Total Database Spots
                </span>
                <span className="text-2xl font-black text-stone-900 block">
                  {loadingPlaces ? '...' : totalCount}
                </span>
                <span className="text-[11px] text-stone-400 mt-1 block">In Kakinada catalog</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Live on Discovery
                </span>
                <span className="text-2xl font-black text-emerald-600 block">
                  {loadingPlaces ? '...' : publishedCount}
                </span>
                <span className="text-[11px] text-emerald-600/80 mt-1 block">Visible to public</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Hidden / Drafts
                </span>
                <span className="text-2xl font-black text-amber-600 block">
                  {loadingPlaces ? '...' : hiddenCount}
                </span>
                <span className="text-[11px] text-amber-600/80 mt-1 block">Off discovery</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Food Categories
                </span>
                <span className="text-2xl font-black text-orange-600 block">
                  {CATEGORIES.length}
                </span>
                <span className="text-[11px] text-orange-600/80 mt-1 block">Organized segments</span>
              </div>
            </div>

            {/* Toolbar: Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search spots, area, or tags..."
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-stone-50/50"
                />
              </div>

              {/* Status & Category filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Status Pills */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('published')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === 'published' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Live ({publishedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('hidden')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === 'hidden' ? 'bg-amber-600 text-white shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Hidden ({hiddenCount})
                  </button>
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={fetchPlaces}
                  title="Refresh places list"
                  className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  <RotateCcw size={14} className={loadingPlaces ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Spots Table */}
            {loadingPlaces ? (
              <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="animate-spin text-orange-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Loading Kakinada spots...</span>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center">
                <UtensilsCrossed size={36} className="text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No restaurants match your filters</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto mb-4">
                  Try adjusting your search terms or filters above.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                    setStatusFilter('all');
                  }}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Restaurant / Spot</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price for 2</th>
                        <th className="py-3.5 px-4">Community Score</th>
                        <th className="py-3.5 px-4 text-center">1-Click Live Toggle</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredPlaces.map((p) => {
                        const avg = p.avg_food_quality
                          ? ((p.avg_food_quality + (p.avg_ambience || 0) + (p.avg_price_rating || 0)) / 3).toFixed(1)
                          : null;

                        return (
                          <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                            {/* Name & Address */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                <span>{p.name}</span>
                                <span className="text-[10px] text-stone-400 font-mono">#{p.id}</span>
                              </div>
                              <p className="text-[11px] text-stone-500 truncate max-w-xs mt-0.5 flex items-center gap-1">
                                <MapPin size={11} className="text-orange-500 shrink-0" />
                                {p.address}
                              </p>
                              {(() => {
                                const tags = normalizeTags(p.tags);
                                if (tags.length === 0) return null;
                                return (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {tags.slice(0, 3).map((t) => (
                                      <span
                                        key={t}
                                        className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                    {tags.length > 3 && (
                                      <span className="text-[10px] text-stone-400">
                                        +{tags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                                {p.category}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-4 px-4 font-bold text-stone-900">
                              {p.price_per_two ? formatPrice(p.price_per_two) : '—'}
                            </td>

                            {/* Ratings */}
                            <td className="py-4 px-4">
                              {avg ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-orange-600">★ {avg}</span>
                                  <span className="text-[10px] text-stone-400">
                                    ({p.rating_count} reviews)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-stone-400 italic">No ratings</span>
                              )}
                            </td>

                            {/* 1-Click Status Toggle */}
                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(p)}
                                title={p.is_published ? 'Click to hide from website' : 'Click to make live'}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                  p.is_published
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                }`}
                              >
                                {p.is_published ? (
                                  <>
                                    <Eye size={13} className="text-emerald-600" />
                                    <span>Live</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={13} className="text-stone-500" />
                                    <span>Hidden</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/place/${p.id}`}
                                  target="_blank"
                                  title="View place page"
                                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                  <ExternalLink size={14} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPlace(p);
                                    setIsModalOpen(true);
                                  }}
                                  title="Edit spot details & price"
                                  className="p-2 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeletingId(p.id!)}
                                  title="Delete spot"
                                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
                  <span>
                    Showing {filteredPlaces.length} of {totalCount} spots
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Tip: Click the green/gray status badge to publish or unpublish instantly.
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USER FEEDBACK & BUG REPORTS */}
        {/* ========================================================================= */}
        {activeTab === 'feedback' && (
          <>
            {/* Feedback KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Total Submissions
                </span>
                <span className="text-2xl font-black text-stone-900 block">
                  {loadingFeedback ? '...' : totalFeedbackCount}
                </span>
                <span className="text-[11px] text-stone-400 mt-1 block">From local visitors</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                  Needs Attention / New
                </span>
                <span className="text-2xl font-black text-rose-600 block">
                  {loadingFeedback ? '...' : newFeedbackCount}
                </span>
                <span className="text-[11px] text-rose-600/80 mt-1 block">Unreviewed reports</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block mb-1">
                  In Progress
                </span>
                <span className="text-2xl font-black text-sky-600 block">
                  {loadingFeedback ? '...' : inProgressFeedbackCount}
                </span>
                <span className="text-[11px] text-sky-600/80 mt-1 block">Being addressed</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Resolved
                </span>
                <span className="text-2xl font-black text-emerald-600 block">
                  {loadingFeedback ? '...' : resolvedFeedbackCount}
                </span>
                <span className="text-[11px] text-emerald-600/80 mt-1 block">Completed & closed</span>
              </div>
            </div>

            {/* Feedback Toolbar: Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Search subject, user, email, details..."
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-stone-50/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setFeedbackStatusFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      feedbackStatusFilter === 'all'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600'
                    }`}
                  >
                    All ({totalFeedbackCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackStatusFilter('new')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      feedbackStatusFilter === 'new'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-stone-600'
                    }`}
                  >
                    New ({newFeedbackCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackStatusFilter('in_progress')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      feedbackStatusFilter === 'in_progress'
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'text-stone-600'
                    }`}
                  >
                    In Progress ({inProgressFeedbackCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackStatusFilter('resolved')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      feedbackStatusFilter === 'resolved'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-stone-600'
                    }`}
                  >
                    Resolved ({resolvedFeedbackCount})
                  </button>
                </div>

                {/* Topic Filter */}
                <select
                  value={feedbackTopicFilter}
                  onChange={(e) => setFeedbackTopicFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 focus:outline-none"
                >
                  <option value="all">All Topics</option>
                  <option value="bug">🐛 Bugs</option>
                  <option value="feature">💡 Feature Ideas</option>
                  <option value="place">🍽️ Spot Suggestions</option>
                  <option value="other">💬 General Feedback</option>
                </select>

                <button
                  type="button"
                  onClick={fetchFeedback}
                  title="Refresh feedback"
                  className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  <RotateCcw size={14} className={loadingFeedback ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Feedback Cards List */}
            {loadingFeedback ? (
              <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="animate-spin text-orange-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Loading community feedback...</span>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center">
                <MessageSquarePlus size={36} className="text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No feedback submissions found</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto mb-4">
                  {feedbackSearch || feedbackStatusFilter !== 'all' || feedbackTopicFilter !== 'all'
                    ? 'No submissions match your active search or filters.'
                    : 'When users submit bugs or restaurant suggestions from the website or footer, they will appear here.'}
                </p>
                {(feedbackSearch || feedbackStatusFilter !== 'all' || feedbackTopicFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setFeedbackSearch('');
                      setFeedbackStatusFilter('all');
                      setFeedbackTopicFilter('all');
                    }}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    Clear all feedback filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredFeedback.map((f) => {
                  const badge = getTopicBadge(f.topic);
                  const statusBadge = getStatusBadge(f.status);

                  return (
                    <div
                      key={f.id}
                      className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all shadow-xs ${
                        f.status === 'new'
                          ? 'border-orange-300/80 ring-2 ring-orange-500/10'
                          : 'border-stone-200'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Topic Pill */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                          >
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>

                          {/* Status Pill */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>

                          <span className="text-[10px] text-stone-400 font-mono">#{f.id}</span>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Clock size={13} />
                          <span>{formatFeedbackDate(f.created_at)}</span>
                        </div>
                      </div>

                      {/* Subject */}
                      {f.subject && (
                        <h4 className="text-base font-bold text-stone-900 mb-1.5">
                          {f.subject}
                        </h4>
                      )}

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-wrap leading-relaxed mb-4">
                        {f.description}
                      </p>

                      {/* Sender and Actions footer */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2 text-stone-500">
                          <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                            <User size={13} className="text-stone-400" />
                            {f.sender_name || 'Anonymous User'}
                          </span>
                          {f.sender_email && (
                            <>
                              <span>•</span>
                              <a
                                href={`mailto:${f.sender_email}?subject=Re: [Vibespot] ${encodeURIComponent(f.subject || badge.label)}`}
                                className="inline-flex items-center gap-1 text-orange-600 hover:underline font-semibold"
                                title="Click to open email client and reply"
                              >
                                <Mail size={13} />
                                {f.sender_email}
                              </a>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* If spot suggestion: Convert to Place Button */}
                          {f.topic === 'place' && (
                            <button
                              type="button"
                              onClick={() => handleConvertFeedbackToSpot(f)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-colors"
                            >
                              <UtensilsCrossed size={13} />
                              <span>Turn into Restaurant Spot</span>
                            </button>
                          )}

                          {/* Quick status updates */}
                          {f.status !== 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateFeedbackStatus(f.id, 'in_progress')}
                              disabled={updatingFeedbackId === f.id}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            >
                              Mark In Progress
                            </button>
                          )}

                          {f.status !== 'resolved' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateFeedbackStatus(f.id, 'resolved')}
                              disabled={updatingFeedbackId === f.id}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={13} />
                              <span>Mark Resolved</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateFeedbackStatus(f.id, 'new')}
                              disabled={updatingFeedbackId === f.id}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                            >
                              Reopen as New
                            </button>
                          )}

                          {/* Delete Feedback Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingFeedbackItem(f)}
                            title="Delete this feedback submission"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ANALYTICS & TRAFFIC                                               */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard getIdToken={getIdToken} />
        )}
      </div>

      {/* Edit / Create Place Modal */}
      <PlaceEditModal
        isOpen={isModalOpen}
        place={editingPlace}
        availableTags={availableFilterTags}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlace(null);
        }}
        onSave={(savedPlace) => {
          setPlaces((prev) => {
            const exists = prev.some((p) => p.id === savedPlace.id);
            if (exists) {
              return prev.map((p) => (p.id === savedPlace.id ? { ...p, ...savedPlace } : p));
            }
            return [savedPlace, ...prev];
          });
          setSuccessMsg(
            editingPlace?.id
              ? `Updated "${savedPlace.name}" successfully`
              : `Added new spot "${savedPlace.name}" to Vibespot!`
          );
          setTimeout(() => setSuccessMsg(''), 4000);
        }}
        getIdToken={getIdToken}
      />

      {/* Delete Place Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Delete this restaurant?</h3>
              <p className="text-xs text-stone-500 mt-1">
                This will permanently delete the spot and its ratings from Supabase. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePlace(deletingId)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Feedback Confirmation Modal */}
      {deletingFeedbackItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Delete this feedback item?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Remove submission #{deletingFeedbackItem.id} ({deletingFeedbackItem.subject || 'Feedback'}) permanently?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFeedbackItem(null)}
                disabled={isDeletingFeedback}
                className="flex-1 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFeedback(deletingFeedbackItem.id)}
                disabled={isDeletingFeedback}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeletingFeedback ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
