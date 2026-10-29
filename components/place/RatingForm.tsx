'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/lib/firebase/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RatingFormProps {
  placeId: string;
  onRatingSubmitted?: () => void;
}

type Status = 'idle' | 'submitting' | 'deleting' | 'error';

interface ExistingRating {
  price_rating: number;
  ambience_rating: number;
  food_quality_rating: number;
  updated_at?: string;
}

export function RatingForm({ placeId, onRatingSubmitted }: RatingFormProps) {
  const { user, getIdToken } = useAuth();
  const router = useRouter();

  const [priceRating, setPriceRating] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [existing, setExisting] = useState<ExistingRating | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchExistingRating = useCallback(async () => {
    if (!user) return;
    setLoadingExisting(true);
    setError('');
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/ratings?place_id=${encodeURIComponent(placeId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.rating) {
          setExisting(json.rating);
          setPriceRating(json.rating.price_rating);
          setAmbienceRating(json.rating.ambience_rating);
          setFoodRating(json.rating.food_quality_rating);
        } else {
          setExisting(null);
        }
      }
    } catch (err) {
      console.error('Failed to load existing rating:', err);
    } finally {
      setLoadingExisting(false);
    }
  }, [user, placeId, getIdToken]);

  useEffect(() => {
    fetchExistingRating();
  }, [fetchExistingRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!priceRating || !ambienceRating || !foodRating) {
      setError('Please tap a star rating for all 3 categories (Food, Ambience, and Value).');
      return;
    }

    setError('');
    setStatus('submitting');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication token unavailable. Please sign in again.');

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          place_id: placeId,
          price_rating: priceRating,
          ambience_rating: ambienceRating,
          food_quality_rating: foodRating,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit rating');

      const updatedRating: ExistingRating = {
        price_rating: priceRating,
        ambience_rating: ambienceRating,
        food_quality_rating: foodRating,
        updated_at: new Date().toISOString(),
      };

      setExisting(updatedRating);
      setIsEditing(false);
      setStatus('idle');
      setSuccessMessage(existing ? 'Your rating has been updated!' : 'Thank you! Your rating is recorded.');
      setTimeout(() => setSuccessMessage(''), 4000);

      onRatingSubmitted?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating. Please try again.');
      setStatus('error');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setStatus('deleting');
    setError('');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication token unavailable.');

      const res = await fetch(`/api/ratings?place_id=${encodeURIComponent(placeId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove rating');
      }

      setExisting(null);
      setPriceRating(0);
      setAmbienceRating(0);
      setFoodRating(0);
      setIsEditing(false);
      setConfirmDelete(false);
      setStatus('idle');
      setSuccessMessage('Your rating has been removed.');
      setTimeout(() => setSuccessMessage(''), 4000);

      onRatingSubmitted?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rating');
      setStatus('error');
    }
  };

  const handleStartEdit = () => {
    if (existing) {
      setPriceRating(existing.price_rating);
      setAmbienceRating(existing.ambience_rating);
      setFoodRating(existing.food_quality_rating);
    }
    setError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (existing) {
      setPriceRating(existing.price_rating);
      setAmbienceRating(existing.ambience_rating);
      setFoodRating(existing.food_quality_rating);
    }
    setError('');
    setIsEditing(false);
  };

  // 1. Not logged in state
  if (!user) {
    return (
      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-6 text-center">
        <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Star size={20} className="fill-orange-500 text-orange-500" />
        </div>
        <p className="text-stone-900 text-sm font-bold mb-1">
          Have you visited this spot?
        </p>
        <p className="text-stone-500 text-xs mb-4 max-w-xs mx-auto leading-relaxed">
          Sign in to share your rating on food quality, ambience, and value. Each member gets 1 rating per spot.
        </p>
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(`/place/${placeId}`)}`}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.02]"
        >
          Sign in to Rate
        </Link>
      </div>
    );
  }

  // 2. Loading state
  if (loadingExisting) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-stone-400 bg-stone-50/50 rounded-2xl border border-stone-100">
        <Loader2 size={18} className="animate-spin text-orange-600" />
        <span className="text-xs font-medium">Checking your rating...</span>
      </div>
    );
  }

  // 3. User HAS already rated and is NOT currently in edit mode -> Show their submitted rating card
  if (existing && !isEditing) {
    const avg = ((existing.food_quality_rating + existing.ambience_rating + existing.price_rating) / 3).toFixed(1);

    return (
      <div className="space-y-4">
        {successMessage && (
          <div className="flex items-center gap-2 text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
            <CheckCircle size={15} className="shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check size={14} className="stroke-[3]" />
              </span>
              <span className="text-xs font-bold text-stone-900">Your Rating</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-700">
              <Star size={12} className="fill-orange-600 text-orange-600" />
              {avg} / 5
            </span>
          </div>

          {/* Breakdown cards */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-white rounded-xl border border-stone-100 shadow-2xs">
              <span className="text-stone-600 font-medium flex items-center gap-1.5">
                <span>🍽️</span> Food Quality
              </span>
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <StarRating value={existing.food_quality_rating} readonly size="sm" />
                <span>{existing.food_quality_rating}/5</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-white rounded-xl border border-stone-100 shadow-2xs">
              <span className="text-stone-600 font-medium flex items-center gap-1.5">
                <span>✨</span> Ambience
              </span>
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <StarRating value={existing.ambience_rating} readonly size="sm" />
                <span>{existing.ambience_rating}/5</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-white rounded-xl border border-stone-100 shadow-2xs">
              <span className="text-stone-600 font-medium flex items-center gap-1.5">
                <span>💰</span> Value for Money
              </span>
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <StarRating value={existing.price_rating} readonly size="sm" />
                <span>{existing.price_rating}/5</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 mb-4 flex items-center gap-1">
            <Sparkles size={12} className="text-orange-500" />
            1 rating per user. You can update your scores anytime.
          </p>

          {/* Action buttons: Edit or Delete */}
          {confirmDelete ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center space-y-2">
              <p className="text-xs font-semibold text-rose-800">
                Are you sure you want to remove your rating?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={status === 'deleting'}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  {status === 'deleting' ? 'Removing...' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex-1 flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs shadow-orange-500/20 active:scale-[0.98]"
              >
                <Edit3 size={14} />
                <span>Edit My Rating</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                title="Remove your rating"
                className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-stone-200 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Form state (either creating first rating OR editing existing rating)
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {successMessage && (
        <div className="flex items-center gap-2 text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
          <CheckCircle size={15} className="shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {existing && isEditing && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <Edit3 size={13} className="text-amber-700" />
            Editing your rating (updates your previous score)
          </span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            <RotateCcw size={11} /> Cancel
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-rose-700 text-xs bg-rose-50 border-l-3 border-rose-500 p-3 rounded-r-xl"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <RatingCategory
          label="Food Quality"
          description="Taste, freshness, and presentation"
          emoji="🍽️"
          value={foodRating}
          onChange={setFoodRating}
        />
        <RatingCategory
          label="Ambience"
          description="Cleanliness, seating, lighting, and vibe"
          emoji="✨"
          value={ambienceRating}
          onChange={setAmbienceRating}
        />
        <RatingCategory
          label="Value for Money"
          description="Portions and pricing"
          emoji="💰"
          value={priceRating}
          onChange={setPriceRating}
        />
      </div>

      <div className="pt-1 flex items-center gap-2">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm shadow-orange-500/20 active:scale-[0.99]"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Saving rating...</span>
            </>
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Submit Rating'
          )}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {!existing && (
        <p className="text-[11px] text-stone-400 text-center">
          1 rating per user. You can edit your rating at any time.
        </p>
      )}
    </form>
  );
}

function RatingCategory({
  label,
  description,
  emoji,
  value,
  onChange,
}: {
  label: string;
  description: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  return (
    <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{emoji}</span>
          <span className="text-xs font-bold text-stone-900">{label}</span>
        </div>
        {value > 0 && (
          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
            {labels[value]}
          </span>
        )}
      </div>
      <p className="text-[11px] text-stone-500 mb-2">{description}</p>
      <div>
        <StarRating value={value} onChange={onChange} size="md" />
      </div>
    </div>
  );
}
