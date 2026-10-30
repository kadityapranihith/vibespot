'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  MapPin,
  Sparkles,
  Link as LinkIcon,
  Tag,
  DollarSign,
  Compass,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { CATEGORIES } from '@/types';

export interface AdminPlace {
  id?: number;
  name: string;
  category: string;
  address: string;
  price_per_two?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string | null;
  tags?: string[] | null;
  is_published: boolean;
  rating_count?: number | null;
  avg_food_quality?: number | null;
  avg_ambience?: number | null;
  avg_price_rating?: number | null;
}

interface PlaceEditModalProps {
  isOpen: boolean;
  place: AdminPlace | null; // null = creating new place
  onClose: () => void;
  onSave: (savedPlace: AdminPlace) => void;
  getIdToken: () => Promise<string | null>;
}

const COMMON_TAGS = [
  'Student Friendly',
  'Budget-Friendly',
  'AC',
  'Pure Veg',
  'Cozy Seating',
  'Outdoor Seating',
  'Late Night',
  'Family Friendly',
  'Quick Bite',
  'Breakfast Spot',
  'Work Friendly',
  'Free WiFi',
  'Biryani Specialist',
  'Desserts & Shakes',
];

export function PlaceEditModal({
  isOpen,
  place,
  onClose,
  onSave,
  getIdToken,
}: PlaceEditModalProps) {
  const isEditing = Boolean(place?.id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cafés');
  const [address, setAddress] = useState('');
  const [pricePerTwo, setPricePerTwo] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing or creating
  useEffect(() => {
    if (place) {
      setName(place.name || '');
      setCategory(place.category || 'Cafés');
      setAddress(place.address || '');
      setPricePerTwo(place.price_per_two ? String(place.price_per_two) : '');
      setLatitude(place.latitude !== null && place.latitude !== undefined ? String(place.latitude) : '');
      setLongitude(place.longitude !== null && place.longitude !== undefined ? String(place.longitude) : '');
      setMapsUrl(place.maps_url || '');
      setTags(Array.isArray(place.tags) ? place.tags : []);
      setIsPublished(place.is_published ?? true);
    } else {
      setName('');
      setCategory('Cafés');
      setAddress('');
      setPricePerTwo('');
      setLatitude('');
      setLongitude('');
      setMapsUrl('');
      setTags([]);
      setIsPublished(true);
    }
    setError('');
  }, [place, isOpen]);

  if (!isOpen) return null;

  // Helper to parse coordinates from Google Maps URLs automatically
  const handleParseMapsUrl = () => {
    if (!mapsUrl.trim()) return;
    try {
      // Look for coordinates pattern like @16.9890,82.2474 or !3d16.9890!4d82.2474 or ?q=16.9890,82.2474
      const atMatch = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        setLatitude(atMatch[1]);
        setLongitude(atMatch[2]);
        return;
      }
      const qMatch = mapsUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        setLatitude(qMatch[1]);
        setLongitude(qMatch[2]);
        return;
      }
      const dataMatch = mapsUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (dataMatch) {
        setLatitude(dataMatch[1]);
        setLongitude(dataMatch[2]);
        return;
      }
      setError('Could not automatically parse GPS coordinates from this link. You can enter them manually.');
    } catch {
      setError('Error reading maps URL');
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Spot name is required');
      return;
    }
    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        name: name.trim(),
        category,
        address: address.trim(),
        price_per_two: pricePerTwo ? Number(pricePerTwo) : null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        maps_url: mapsUrl.trim() || null,
        tags,
        is_published: isPublished,
      };

      const url = '/api/admin/places';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing ? { id: place!.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save spot');

      onSave(data.place);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving spot');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-850 px-6 py-5 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/30 text-orange-400 border border-orange-500/40 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {isEditing ? `Edit: ${place?.name}` : 'Add New Restaurant / Spot'}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {isEditing ? 'Update menu price, location, or tags' : 'Publish directly to Vibespot Kakinada'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Restaurant Name <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subbayya Gari Hotel"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category <span className="text-orange-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price for two & Published toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>Price for Two (₹)</span>
                <span className="text-[10px] text-stone-400 font-normal">Approximate estimate</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={pricePerTwo}
                  onChange={(e) => setPricePerTwo(e.target.value)}
                  placeholder="350"
                  className="w-full text-xs pl-7 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                />
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Listing Status</span>
                <span className="text-[11px] text-stone-500">
                  {isPublished ? 'Visible on website' : 'Hidden from discovery'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPublished
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-300 text-stone-700'
                }`}
              >
                {isPublished ? 'Live' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Address <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Road, Suryaraopeta, Kakinada, AP 533001"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
            />
          </div>

          {/* Maps URL with Auto-coordinate parser */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Google Maps Link
              </label>
              {mapsUrl && (
                <button
                  type="button"
                  onClick={handleParseMapsUrl}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Compass size={12} /> Auto-fill GPS Coordinates
                </button>
              )}
            </div>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="16.9890"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="82.2474"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-700">
              Vibe & Feature Tags ({tags.length} selected)
            </label>

            {/* Popular preset tags */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((t) => {
                const isSelected = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Custom tag input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add custom tag (e.g. Kothapet, Drive-through)..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Selected tags chip display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-orange-500 hover:text-orange-800"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white shadow-sm shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving to database...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Publish Spot'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
