'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ExternalLink,
  ArrowLeft,
  Star,
  Navigation,
  Sparkles,
  IndianRupee,
  Compass,
  Share2,
} from 'lucide-react';
import type { Place } from '@/types';
import { PlaceImage } from '@/components/place/PlaceImage';
import { PlaceMap } from '@/components/place/PlaceMap';
import { RatingDisplay } from '@/components/place/RatingDisplay';
import { RatingFormWrapper } from '@/components/place/RatingFormWrapper';
import { useUserLocation } from '@/lib/hooks/useUserLocation';
import {
  calculateDistanceKm,
  formatDistance,
  formatPrice,
  formatRating,
  getOverallRating,
  isValidCoordinate,
} from '@/lib/utils';

interface PlaceDetailClientProps {
  place: Place;
  returnQuery?: string;
}

export function PlaceDetailClient({ place, returnQuery }: PlaceDetailClientProps) {
  const { location } = useUserLocation();

  const distanceKm = useMemo(() => {
    if (
      location &&
      isValidCoordinate(place.latitude, place.longitude) &&
      isValidCoordinate(location.latitude, location.longitude)
    ) {
      return calculateDistanceKm(
        location.latitude,
        location.longitude,
        place.latitude!,
        place.longitude!
      );
    }
    return null;
  }, [location, place.latitude, place.longitude]);

  const overallRating = getOverallRating(
    place.avg_price_rating,
    place.avg_ambience,
    place.avg_food_quality
  );

  const backHref = returnQuery ? `/?${returnQuery}` : '/';

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${place.name} — Vibespot Kakinada`,
          text: `Check out ${place.name} on Vibespot Kakinada!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#faf8f5]">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-orange-600 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-full transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Discovery</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200 min-h-[240px] sm:min-h-[300px] aspect-[16/10] sm:aspect-[21/9] max-h-[460px] bg-stone-900">
          <PlaceImage
            name={place.name}
            category={place.category}
            imageUrl={place.image_url}
            className="w-full h-full"
            showName={false}
            priority
          />

          {/* Evenly distributed Overlay info */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/30 to-black/25 flex flex-col justify-between p-6 sm:p-10 text-white">
            {/* Top row: Category tag & Distance badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-600 text-white shadow-md tracking-wide">
                  {place.category}
                </span>
                {distanceKm !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-orange-200 border border-white/20">
                    <Navigation size={12} className="text-orange-400 rotate-45" />
                    {formatDistance(distanceKm)} (straight-line)
                  </span>
                )}
              </div>

              {/* Sparkles accent indicator */}
              <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles size={14} />
              </div>
            </div>

            {/* Bottom row: Place Name & Address */}
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {place.name}
              </h1>

              <p className="text-stone-300 text-xs sm:text-sm flex items-center gap-1.5 max-w-2xl leading-relaxed">
                <MapPin size={14} className="text-orange-400 shrink-0" />
                <span>{place.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Overview, Map, Tags */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Price for two */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Price for Two
                    </span>
                    <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      Estimated
                    </span>
                  </div>
                  <span className="text-2xl font-black text-orange-600 block">
                    {place.price_per_two ? formatPrice(place.price_per_two) : 'Not listed'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Estimated value (2 main courses + 1 starter + 2 beverages)
                </p>
              </div>

              {/* Category */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Food Category
                </span>
                <span className="text-base font-bold text-stone-900 block truncate">
                  {place.category}
                </span>
                <span className="text-xs text-stone-500 block mt-0.5">
                  Kakinada spot
                </span>
              </div>

              {/* Coordinates */}
              <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  GPS Coordinates
                </span>
                <span className="text-xs font-mono font-bold text-stone-700 block">
                  {place.latitude && place.longitude
                    ? `${place.latitude.toFixed(4)}°N, ${place.longitude.toFixed(4)}°E`
                    : 'Coordinates unavailable'}
                </span>
                <span className="text-xs text-stone-400 block mt-0.5">
                  Verified location
                </span>
              </div>
            </div>

            {/* All Tags Section */}
            {place.tags && place.tags.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Highlights & Vibe Tags ({place.tags.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Navigation Section */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Location & Directions
                  </h2>
                  <p className="text-sm text-stone-700 font-medium mt-1">
                    {place.address}
                  </p>
                </div>
              </div>

              {/* Map embed */}
              {place.latitude && place.longitude && (
                <div className="rounded-2xl overflow-hidden border border-stone-200">
                  <PlaceMap
                    latitude={place.latitude}
                    longitude={place.longitude}
                    name={place.name}
                  />
                </div>
              )}

              {/* Google Maps External Action Button */}
              {place.maps_url ? (
                <a
                  href={place.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-sm hover:scale-[1.01]"
                >
                  <ExternalLink size={16} className="text-orange-400" />
                  <span>Open in Google Maps for Driving Directions</span>
                </a>
              ) : (
                <p className="text-xs text-stone-400 italic text-center py-2">
                  Google Maps URL not available for this place.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Community Ratings & Rate Form */}
          <div className="space-y-6">
            {/* Community Rating Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
              <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                Community Ratings
              </h2>
              <RatingDisplay place={place} />
            </div>

            {/* Submit / Edit Rating Form */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
              <h2 className="text-base font-bold text-stone-900 mb-1">
                Rate this Spot
              </h2>
              <p className="text-xs text-stone-500 mb-5">
                Share your rating on food quality, ambience, and price value.
              </p>
              <RatingFormWrapper placeId={place.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

