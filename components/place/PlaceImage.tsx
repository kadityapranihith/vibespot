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

// Curated high-fidelity category photography for WhyStayIn (Option A: Clean Minimalist)
const CATEGORY_IMAGES: Record<string, string[]> = {
  cafes: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
  ],
  bakeries: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
  ],
  tiffin: [
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  ],
  street: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
  ],
  dining: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  ],
  tea: [
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  ],
};

function getCategoryPhoto(name: string, category: string): string {
  const c = (category || '').toLowerCase();
  let list = CATEGORY_IMAGES.street;

  if (c.includes('caf')) {
    list = CATEGORY_IMAGES.cafes;
  } else if (c.includes('baker') || c.includes('sweet') || c.includes('dessert')) {
    list = CATEGORY_IMAGES.bakeries;
  } else if (c.includes('tiffin') || c.includes('breakfast')) {
    list = CATEGORY_IMAGES.tiffin;
  } else if (c.includes('tea') || c.includes('juice') || c.includes('beverage')) {
    list = CATEGORY_IMAGES.tea;
  } else if (c.includes('family') || c.includes('dining') || c.includes('restaurant')) {
    list = CATEGORY_IMAGES.dining;
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}

interface PlaceImageProps {
  name: string;
  category: string;
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
  showName?: boolean;
}

export function PlaceImage({
  name,
  category,
  imageUrl,
  className = '',
  priority = false,
  showName = false,
}: PlaceImageProps) {
  const [imgError, setImgError] = useState(false);

  // Check if image is an actual custom valid image
  const isCustomImage =
    Boolean(imageUrl) &&
    imageUrl !== '/images/placeholder-restaurant.jpg' &&
    imageUrl !== '/images/placeholder-restaurant.png';

  // Use custom image or high-quality curated category photo
  const finalImage = isCustomImage ? (imageUrl as string) : getCategoryPhoto(name, category);

  const getCategoryIcon = () => {
    const c = (category || '').toLowerCase();
    if (c.includes('caf')) return Coffee;
    if (c.includes('baker') || c.includes('sweet')) return Cake;
    if (c.includes('tiffin') || c.includes('breakfast')) return Flame;
    if (c.includes('tea') || c.includes('juice')) return CupSoda;
    if (c.includes('family') || c.includes('dining')) return Soup;
    return UtensilsCrossed;
  };

  const Icon = getCategoryIcon();

  if (!imgError && finalImage) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={finalImage}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setImgError(true)}
        />
        {/* Very subtle bottom vignette only for badge readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }

  // Modern Clean Studio Fallback Graphic (light, minimal, no black blocks)
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 flex flex-col items-center justify-center p-5 text-stone-500 select-none ${className}`}
    >
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #64748B 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/80 shadow-xs border border-stone-200/80 flex items-center justify-center text-[#FF5A36]">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <span className="relative z-10 text-[11px] font-semibold text-stone-500 mt-2 tracking-wide uppercase">
        {category}
      </span>
    </div>
  );
}

