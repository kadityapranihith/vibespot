'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [q, setQ] = useState('');
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/browse?search=${encodeURIComponent(query)}` : '/browse');
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Kakinada spots"
        className="w-full pl-11 pr-4 py-3 bg-[#f3f4f6] rounded-full text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#ff5722]/30"
      />
    </form>
  );
}
