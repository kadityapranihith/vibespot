import { Place } from '@/types';
import { formatRating, getOverallRating, getRatingLabel } from '@/lib/utils';
import { Star, Users } from 'lucide-react';

export function RatingDisplay({ place }: { place: Place }) {
  const overall = getOverallRating(place.avg_price_rating, place.avg_ambience, place.avg_food_quality);

  if (!place.rating_count) {
    return (
      <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
        <Star className="text-gray-300 mx-auto mb-2" size={36} />
        <p className="text-sm font-semibold text-gray-500">No community ratings yet</p>
        <p className="text-xs text-gray-400 mt-1">Be the first to rate this place!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Overall score */}
      <div className="bg-[#0a0a0a] p-5 flex items-center gap-4">
        <div className="text-5xl font-black text-white leading-none">
          {formatRating(overall)}
        </div>
        <div>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={(overall ?? 0) >= s ? 'fill-[#ff5722] text-[#ff5722]' : 'fill-gray-700 text-gray-700'}
              />
            ))}
          </div>
          <p className="text-[#ff5722] text-sm font-bold">{getRatingLabel(overall)}</p>
          <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
            <Users size={11} />
            {place.rating_count} {place.rating_count === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="p-4 space-y-4">
        <RatingBar label="Food Quality" emoji="🍽️" value={place.avg_food_quality} />
        <RatingBar label="Ambience" emoji="✨" value={place.avg_ambience} />
        <RatingBar label="Value for Money" emoji="💰" value={place.avg_price_rating} />
      </div>
    </div>
  );
}

function RatingBar({ label, emoji, value }: { label: string; emoji: string; value: number | null | undefined }) {
  const pct = value ? Math.round((value / 5) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <span>{emoji}</span> {label}
        </span>
        <span className="text-sm font-black text-[#0a0a0a]">{value ? formatRating(value) : '—'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ff5722] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
