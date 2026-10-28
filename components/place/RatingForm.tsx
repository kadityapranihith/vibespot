'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Sparkles, Star } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/lib/firebase/auth-context';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RatingFormProps {
  placeId: string;
  onRatingSubmitted?: () => void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface ExistingRating {
  price_rating: number;
  ambience_rating: number;
  food_quality_rating: number;
}

export function RatingForm({ placeId, onRatingSubmitted }: RatingFormProps) {
  const { user, getIdToken } = useAuth();
  const router = useRouter();

  const [priceRating, setPriceRating] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<ExistingRating | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoadingExisting(true);

    const fetchRating = async () => {
      try {
        const { data } = await supabase
          .from('place_ratings')
          .select('price_rating, ambience_rating, food_quality_rating')
          .eq('place_id', placeId)
          .eq('firebase_uid', user.uid)
          .single();

        if (!active) return;
        if (data) {
          setExisting(data);
          setPriceRating(data.price_rating);
          setAmbienceRating(data.ambience_rating);
          setFoodRating(data.food_quality_rating);
        }
      } catch {
        // Ignore single row not found errors
      } finally {
        if (active) setLoadingExisting(false);
      }
    };

    fetchRating();

    return () => {
      active = false;
    };
  }, [user, placeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!priceRating || !ambienceRating || !foodRating) {
      setError('Please provide a rating for all 3 categories (Food, Ambience, and Value).');
      return;
    }
    setError('');
    setStatus('submitting');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication token unavailable. Please sign in again.');
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          place_id: placeId,
          price_rating: priceRating,
          ambience_rating: ambienceRating,
          food_quality_rating: foodRating,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
      setStatus('success');
      setExisting({
        price_rating: priceRating,
        ambience_rating: ambienceRating,
        food_quality_rating: foodRating,
      });
      onRatingSubmitted?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating. Please try again.');
      setStatus('error');
    }
  };

  // Unauthenticated user prompt
  if (!user) {
    return (
      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2.5">
          <Star size={18} />
        </div>
        <p className="text-stone-900 text-sm font-bold mb-1">
          Have you visited this spot?
        </p>
        <p className="text-stone-500 text-xs mb-4 max-w-xs mx-auto">
          Sign in to share your rating on food quality, ambience, and value for money with the Kakinada community.
        </p>
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(`/place/${placeId}`)}`}
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm shadow-orange-500/20 transition-all"
        >
          Sign in to Rate Spot
        </Link>
      </div>
    );
  }

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-stone-400">
        <Loader2 size={16} className="animate-spin text-orange-600" />
        <span className="text-xs font-medium">Checking your previous ratings...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center py-6 gap-2 text-center bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 mb-1">
          <CheckCircle size={24} />
        </div>
        <p className="font-bold text-stone-900 text-base">Rating Recorded!</p>
        <p className="text-xs text-stone-600 max-w-xs">
          Thank you for helping other food lovers in Kakinada discover great places.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 mt-2 underline"
        >
          Modify your rating
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {existing && (
        <div className="px-3 py-2 bg-orange-50 border-l-3 border-orange-500 text-orange-800 text-xs font-medium rounded-r-lg">
          You previously rated this spot. Updating below will overwrite your rating.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-rose-700 text-xs bg-rose-50 border-l-3 border-rose-500 p-3 rounded-r-lg"
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

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full mt-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm shadow-orange-500/20"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Saving your rating...</span>
          </>
        ) : existing ? (
          'Update My Rating'
        ) : (
          'Submit Rating'
        )}
      </button>
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
