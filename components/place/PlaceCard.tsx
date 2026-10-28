'use client';

import Link from 'next/link';
import { MapPin, Navigation, Star, ArrowUpRight, Sparkles } from 'lucide-react';
import type { Place } from '@/types';
import {
  extractAreaFromAddress,
  formatPrice,
  formatRating,
  formatDistance,
  getOverallRating,
} from '@/lib/utils';
import { PlaceImage } from './PlaceImage';

interface PlaceCardProps {
  place: Place;
  userCoords?: { latitude: number; longitude: number } | null;
  returnQuery?: string;
}

export function PlaceCard({ place, userCoords, returnQuery }: PlaceCardProps) {
  const area = extractAreaFromAddress(place.address);
  const overallRating = getOverallRating(
    place.avg_price_rating,
    place.avg_ambience,
    place.avg_food_quality
  );

  const displayTags = (place.tags || []).slice(0, 3);
  const remainingTagsCount = (place.tags || []).length - displayTags.length;

  const distanceText = formatDistance(place.distanceKm);

  const href = `/place/${place.id}${returnQuery ? `?${returnQuery}` : ''}`;

  return (
    <article className="group relative bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden">
      <Link href={href} className="flex-1 flex flex-col">
        {/* Cover / Category Visual */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <PlaceImage
            name={place.name}
            category={place.category}
            imageUrl={place.image_url}
            className="w-full h-full"
          />

          {/* Genuine Rating Badge (only if genuine ratings exist) */}
          {overallRating !== null && place.rating_count && place.rating_count > 0 ? (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-emerald-600/95 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
              <Star size={12} className="fill-white" />
              <span>{formatRating(overallRating)}</span>
              <span className="text-[10px] text-emerald-100 font-normal">
                ({place.rating_count})
              </span>
            </div>
          ) : null}

          {/* Distance Badge (when location is enabled & coordinates valid) */}
          {distanceText && (
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/75 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-md backdrop-blur-sm">
              <Navigation size={11} className="text-orange-400 rotate-45" />
              <span>{distanceText}</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Category & Open Affordance */}
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                {place.category}
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-stone-400 text-[11px] font-medium">
                View spot <ArrowUpRight size={13} />
              </span>
            </div>

            {/* Place Name */}
            <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1 leading-snug">
              {place.name}
            </h3>

            {/* Address / Area */}
            <p className="mt-1 text-xs text-stone-500 flex items-center gap-1 line-clamp-1">
              <MapPin size={12} className="text-stone-400 shrink-0" />
              <span>{area}</span>
            </p>

            {/* Tags preview */}
            {displayTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {remainingTagsCount > 0 && (
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md text-stone-400 bg-stone-50">
                    +{remainingTagsCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Price For Two */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold tracking-wider">
                Price for two
              </span>
              <span className="font-bold text-stone-900 text-sm">
                {place.price_per_two ? (
                  <>
                    {formatPrice(place.price_per_two)}
                    <span className="text-stone-400 font-normal text-xs"> approx.</span>
                  </>
                ) : (
                  <span className="text-stone-400 italic">Price not listed</span>
                )}
              </span>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 group-hover:bg-orange-500 group-hover:text-white transition-all text-stone-600 shadow-sm">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
