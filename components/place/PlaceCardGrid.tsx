import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { Place } from '@/types';
import { getOverallRating, formatRating, extractAreaFromAddress } from '@/lib/utils';
import { PlaceImage } from './PlaceImage';

export function PlaceCardGrid({ place }: { place: Place }) {
  const overall = getOverallRating(place.avg_price_rating, place.avg_ambience, place.avg_food_quality);
  const area = extractAreaFromAddress(place.address);

  return (
    <Link href={`/place/${place.id}`} className="block group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-stone-200/80 active:scale-[0.98] transition-transform flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
          <PlaceImage
            name={place.name}
            category={place.category}
            imageUrl={place.image_url}
            className="w-full h-full"
            showName={false}
          />
          {/* Category */}
          <div className="absolute top-2 left-2">
            <span className="bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              {place.category}
            </span>
          </div>
          {/* Rating */}
          {overall !== null && (
            <div className="absolute top-2 right-2">
              <div className="bg-white/95 text-stone-900 border border-stone-200/80 shadow-xs backdrop-blur-md flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                <Star size={9} className="fill-[#FF5A36] text-[#FF5A36]" />
                {formatRating(overall)}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-[#FF5A36] transition-colors">
              {place.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-stone-400 flex-shrink-0" />
              <span className="text-xs text-stone-500 line-clamp-1">{area}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
            {place.price_per_two ? (
              <span className="text-xs font-bold text-stone-800">
                ₹{place.price_per_two.toLocaleString('en-IN')}
                <span className="font-normal text-stone-400 text-[10px]"> for 2</span>
              </span>
            ) : (
              <span className="text-xs text-stone-400">—</span>
            )}
            {place.tags && place.tags.length > 0 && (
              <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                {place.tags[0]}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
