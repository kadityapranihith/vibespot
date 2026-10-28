'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Coffee, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on auth pages
  if (pathname.startsWith('/auth')) return null;

  const links = [
    { href: '/', label: 'Explore', icon: Home },
    { href: '/?sort=distance_asc', label: 'Near Me', icon: Compass },
    { href: '/?category=Caf%C3%A9s', label: 'Cafés', icon: Coffee },
    { href: user ? '/account' : '/auth/login', label: user ? 'Account' : 'Sign In', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/' && !href.includes('?')
              : pathname === href || (pathname === '/' && href.includes('category') && typeof window !== 'undefined' && window.location.search.includes('Caf'));

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 gap-1 select-none transition-colors',
                isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
  );
}
