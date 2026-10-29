'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showEmpty = true,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const px = { sm: 13, md: 17, lg: 24 }[size];
  const display = hovered ?? value ?? 0;

  if (readonly && (value === null || value === undefined)) {
    if (!showEmpty) return null;
    return <span className="text-xs text-gray-400 italic">Not yet rated</span>;
  }

  return (
    <div className="flex items-center gap-0.5" aria-label={readonly ? `Rating: ${value} out of 5` : 'Rate this place'}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
          className={
            readonly
              ? 'cursor-default'
              : 'cursor-pointer p-1.5 sm:p-1 touch-manipulation transition-transform active:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md'
          }
          aria-label={readonly ? undefined : `${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            size={px}
            className={display >= star ? 'fill-[#ff5722] text-[#ff5722]' : 'fill-gray-200 text-gray-200'}
          />
        </button>
      ))}
    </div>
  );
}
