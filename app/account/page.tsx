'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LogOut,
  Mail,
  MapPin,
  Compass,
  ArrowLeft,
  ShieldCheck,
  Star,
  Edit3,
  Loader2,
  ExternalLink,
  RotateCcw,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';

interface UserRatingItem {
  place_id: number | string;
  price_rating: number;
  ambience_rating: number;
  food_quality_rating: number;
  created_at: string;
  updated_at: string;
  places?: {
    id: number | string;
    name: string;
    category: string;
    address: string;
    price_per_two?: number | null;
  } | null;
}

export default function AccountPage() {
  const { user, isAdmin, loading, signOutUser, getIdToken, resetPassword } = useAuth();
  const router = useRouter();

  const [ratings, setRatings] = useState<UserRatingItem[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  // Password reset state
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    setResetError('');
    setResetSuccess('');
    try {
      await resetPassword(user.email);
      setResetSuccess(
        `Password reset email sent to ${user.email}! Please check your inbox and spam folder.`
      );
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setResetError('Failed to send password reset email. Please try again.');
    } finally {
      setSendingReset(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/account');
    }
  }, [user, loading, router]);

  const loadRatings = async () => {
    if (!user) return;
    setLoadingRatings(true);
    try {
      const token = await getIdToken();
      if (!token) {
        setLoadingRatings(false);
        return;
      }

      const res = await fetch('/api/ratings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.ratings)) {
          setRatings(data.ratings);
        }
      }
    } catch (err) {
      console.error('Failed to load user ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadRatings();
    } else if (!loading) {
      setLoadingRatings(false);
    }
  }, [user?.uid, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to discovery
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden mb-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-850 p-8 text-center text-white relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-3xl font-black flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 border-2 border-white/20 mb-3">
            {initial}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {user.displayName || user.email?.split('@')[0]}
          </h1>
          <p className="text-stone-400 text-xs flex items-center justify-center gap-1.5 mt-1 font-mono">
            <Mail size={13} className="text-orange-400" />
            {user.email}
          </p>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-orange-200 text-[11px] font-semibold mt-3 backdrop-blur-xs">
            <ShieldCheck size={12} className="text-emerald-400" />
            Verified Firebase Account
          </div>
        </div>

        {/* Details and Actions */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Primary City
              </span>
              <span className="text-base font-bold text-stone-900 block mt-1">
                Kakinada, AP
              </span>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Ratings Given
              </span>
              <span className="text-base font-bold text-orange-600 block mt-1">
                {loadingRatings ? '...' : `${ratings.length} ${ratings.length === 1 ? 'Spot' : 'Spots'}`}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-900">
                  <ShieldCheck size={15} className="text-orange-600" />
                  Administrator Privileges Active
                </span>
                <p className="text-[11px] text-orange-700/90 mt-0.5 leading-relaxed">
                  Manage Kakinada restaurants, edit prices, toggle live listings, and publish new spots.
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all hover:scale-[1.02] shrink-0"
              >
                <span>Admin Portal</span>
              </Link>
            </div>
          )}

          {/* Account Security & Password */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-orange-600 shrink-0 mt-0.5 shadow-2xs">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">
                    Password &amp; Security
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    Update your password. We will send a secure password reset link to your registered email (<code>{user.email}</code>).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 transition-all hover:scale-[1.02] shrink-0 shadow-2xs disabled:opacity-50"
              >
                {sendingReset ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-orange-600" />
                    <span>Sending email...</span>
                  </>
                ) : (
                  <>
                    <Mail size={13} className="text-orange-600" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>
            </div>

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
                {resetError}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Compass size={15} />
              Explore Kakinada Spots
            </Link>

            <button
              onClick={async () => {
                await signOutUser();
                router.push('/');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* User's Ratings History Section */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Star size={18} className="text-orange-500 fill-orange-500" />
              My Spot Ratings
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              1 rating per spot. You can edit any of your ratings anytime.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!loadingRatings && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200/60">
                {ratings.length} rated
              </span>
            )}
            <button
              onClick={loadRatings}
              disabled={loadingRatings}
              title="Refresh ratings"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} className={loadingRatings ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loadingRatings ? (
          <div className="flex items-center justify-center py-10 gap-2 text-stone-400">
            <Loader2 size={18} className="animate-spin text-orange-600" />
            <span className="text-xs font-medium">Loading your ratings...</span>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-2xl border border-stone-100">
            <Star size={32} className="text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-700">No ratings yet</p>
            <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto mb-4">
              Explore eateries in Kakinada and be the first to rate your favorites!
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors shadow-xs"
            >
              Browse Spots
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => {
              const placeName = r.places?.name || `Spot #${r.place_id}`;
              const category = r.places?.category;
              const avg = ((r.food_quality_rating + r.ambience_rating + r.price_rating) / 3).toFixed(1);

              return (
                <div
                  key={r.place_id}
                  className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/place/${r.place_id}`}
                        className="text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors truncate"
                      >
                        {placeName}
                      </Link>
                      {category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-200/80 text-stone-700 shrink-0">
                          {category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="font-semibold text-orange-600 flex items-center gap-1">
                        <Star size={12} className="fill-orange-600" /> {avg} / 5
                      </span>
                      <span>•</span>
                      <span>🍽️ {r.food_quality_rating}/5</span>
                      <span>✨ {r.ambience_rating}/5</span>
                      <span>💰 {r.price_rating}/5</span>
                    </div>
                  </div>

                  <Link
                    href={`/place/${r.place_id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-800 hover:text-orange-600 hover:border-orange-300 transition-all shrink-0 shadow-2xs"
                  >
                    <Edit3 size={13} />
                    <span>View / Edit Rating</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
