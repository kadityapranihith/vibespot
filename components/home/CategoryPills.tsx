'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

const categories = [
  {
    label: 'Quick Bites',
    value: 'Street Food & Quick Bites',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Dining',
    value: 'Restaurants & Family Dining',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tiffin',
    value: 'Tiffin & Breakfast',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cafés',
    value: 'Cafés',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tea & Juice',
    value: 'Tea, Coffee & Juice',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sweets',
    value: 'Bakeries, Sweets, Desserts & Ice Cream',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&auto=format&fit=crop&q=80',
  },
];

export function CategoryPills() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 gap-2.5" aria-label="Browse by food category">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => router.push(`/browse?category=${encodeURIComponent(cat.value)}`)}
          className="group relative aspect-square rounded-2xl overflow-hidden active:scale-95 transition-transform"
        >
          <Image src={cat.image} alt={cat.label} fill className="object-cover" sizes="33vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <span className="absolute bottom-2 left-1 right-1 text-white text-[11px] font-black text-center leading-tight">
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  );
}
