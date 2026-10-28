import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { Place } from '@/types';
import { getOverallRating, formatRating, extractAreaFromAddress } from '@/lib/utils';

export function PlaceCardGrid({ place }: { place: Place }) {
  const overall = getOverallRating(place.avg_price_rating, place.avg_ambience, place.avg_food_quality);
  const area = extractAreaFromAddress(place.address);
  const imageSrc = place.image_url || '/images/placeholder-restaurant.png';

  return (
    <Link href={`/place/${place.id}`} className="block group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 active:scale-[0.98] transition-transform flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <Image
            src={imageSrc}
            alt={place.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:640px) 50vw, 33vw"
          />
          {/* Category */}
          <div className="absolute top-2 left-2">
            <span className="bg-[#0a0a0a]/75 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              {place.category}
            </span>
          </div>
          {/* Rating */}
          {overall !== null && (
            <div className="absolute top-2 right-2">
              <div className="bg-[#ff5722] text-white flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                <Star size={9} className="fill-white" />
                {formatRating(overall)}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#0a0a0a] text-sm line-clamp-1 group-hover:text-[#ff5722] transition-colors">
              {place.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 line-clamp-1">{area}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between">
            {place.price_per_two ? (
              <span className="text-xs font-bold text-gray-700">
                ₹{place.price_per_two.toLocaleString('en-IN')}
                <span className="font-normal text-gray-400 text-[10px]"> for 2</span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
            {place.tags && place.tags.length > 0 && (
              <span className="text-[10px] font-bold text-[#ff5722] bg-orange-50 px-2 py-0.5 rounded-md">
                {place.tags[0]}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
