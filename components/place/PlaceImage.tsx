'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  UtensilsCrossed,
  Coffee,
  Soup,
  Flame,
  Cake,
  CupSoda,
  Sparkles,
} from 'lucide-react';

interface PlaceImageProps {
  name: string;
  category: string;
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
  /** Show the place name inside the placeholder graphic. Default: true.
   *  Set to false when the parent already renders the name as an overlay. */
  showName?: boolean;
}

export function PlaceImage({
  name,
  category,
  imageUrl,
  className = '',
  priority = false,
  showName = true,
}: PlaceImageProps) {
  const [imgError, setImgError] = useState(false);

  // Check if image is an actual custom image rather than generic placeholder
  const isCustomImage =
    Boolean(imageUrl) &&
    imageUrl !== '/images/placeholder-restaurant.jpg' &&
    imageUrl !== '/images/placeholder-restaurant.png';

  // Category visual themes
  const getTheme = () => {
    const c = category.toLowerCase();
    if (c.includes('caf')) {
      return {
        bg: 'from-amber-700 via-amber-800 to-amber-950',
        badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
        Icon: Coffee,
        accent: 'text-amber-300',
        label: 'Café & Hangout',
      };
    }
    if (c.includes('bakeries') || c.includes('sweets') || c.includes('dessert')) {
      return {
        bg: 'from-rose-600 via-pink-700 to-rose-950',
        badge: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
        Icon: Cake,
        accent: 'text-rose-300',
        label: 'Bakes & Sweets',
      };
    }
    if (c.includes('tiffin') || c.includes('breakfast')) {
      return {
        bg: 'from-amber-600 via-orange-700 to-amber-950',
        badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
        Icon: Flame,
        accent: 'text-orange-300',
        label: 'Tiffin & Breakfast',
      };
    }
    if (c.includes('tea') || c.includes('juice')) {
      return {
        bg: 'from-emerald-600 via-teal-700 to-emerald-950',
        badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
        Icon: CupSoda,
        accent: 'text-emerald-300',
        label: 'Tea & Refreshments',
      };
    }
    if (c.includes('family') || c.includes('dining')) {
      return {
        bg: 'from-orange-800 via-red-900 to-neutral-950',
        badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
        Icon: Soup,
        accent: 'text-orange-300',
        label: 'Family Dining',
      };
    }
    // Street Food & Quick Bites / default
    return {
      bg: 'from-orange-600 via-amber-700 to-stone-900',
      badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
      Icon: UtensilsCrossed,
      accent: 'text-amber-300',
      label: 'Quick Bites & Street Food',
    };
  };

  const theme = getTheme();
  const Icon = theme.Icon;

  if (isCustomImage && !imgError && imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>
    );
  }

  // Tasteful category-appropriate placeholder
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.bg} flex flex-col justify-between p-5 text-white select-none ${className}`}
    >
      {/* Subtle geometric background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top row: Sparkles accent indicator (when used as standalone placeholder) */}
      {showName && (
        <div className="relative z-10 flex items-center justify-end">
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80">
            <Sparkles size={14} className={theme.accent} />
          </div>
        </div>
      )}

      {/* Center watermark icon */}
      <div className="absolute -right-3 -bottom-3 text-white/5 pointer-events-none">
        <Icon size={140} strokeWidth={1} />
      </div>

      {/* Bottom row: Place Name & Kakinada signature */}
      {showName && (
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">
            Kakinada Food Spot
          </p>
          <p className="text-xl font-bold tracking-tight text-white line-clamp-1 group-hover:text-orange-200 transition-colors">
            {name}
          </p>
        </div>
      )}
    </div>
  );
}

