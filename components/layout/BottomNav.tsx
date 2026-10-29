'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Compass, Coffee, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [currentQuery, setCurrentQuery] = useState('');

  // Track active query parameters client-side for 0ms reactivity
  useEffect(() => {
    setCurrentQuery(window.location.search);

    const updateQuery = (e?: Event) => {
      if (e && 'detail' in e) {
        const detailHref = (e as CustomEvent<string>).detail;
        const q = detailHref.includes('?') ? '?' + detailHref.split('?')[1] : '';
        setCurrentQuery(q);
      } else {
        setCurrentQuery(window.location.search);
      }
    };

    window.addEventListener('vibespot:shortcut', updateQuery);
    window.addEventListener('popstate', updateQuery);

    return () => {
      window.removeEventListener('vibespot:shortcut', updateQuery);
      window.removeEventListener('popstate', updateQuery);
    };
  }, []);

  // Hide on auth pages (placed AFTER all hooks to obey React Rules of Hooks)
  if (pathname.startsWith('/auth')) return null;

  const handleShortcutClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === '/' && (href.startsWith('/?') || href === '/')) {
      e.preventDefault();
      window.history.pushState(null, '', href);
      window.dispatchEvent(new CustomEvent('vibespot:shortcut', { detail: href }));
    }
  };

  const queryToUse = currentQuery || (searchParams?.toString() ? `?${searchParams.toString()}` : '');
  const isExploreActive = pathname === '/' && (!queryToUse || queryToUse === '?');
  const isNearMeActive = pathname === '/' && queryToUse.includes('sort=distance_asc');
  const isCafeActive = pathname === '/' && (queryToUse.includes('Caf') || queryToUse.includes('category=Caf%C3%A9s'));
  const isAccountActive = pathname === '/account' || pathname.startsWith('/auth');

  const links = [
    {
      href: '/',
      label: 'Explore',
      icon: Home,
      isActive: isExploreActive,
    },
    {
      href: '/?sort=distance_asc',
      label: 'Near Me',
      icon: Compass,
      isActive: isNearMeActive,
    },
    {
      href: '/?category=Caf%C3%A9s',
      label: 'Cafés',
      icon: Coffee,
      isActive: isCafeActive,
    },
    {
      href: user ? '/account' : '/auth/login',
      label: user ? 'Account' : 'Sign In',
      icon: User,
      isActive: isAccountActive,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {links.map(({ href, label, icon: Icon, isActive }) => (
          <Link
            key={label}
            href={href}
            onClick={(e) => handleShortcutClick(e, href)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-1 gap-1 select-none transition-colors',
              isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800'
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
          </Link>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}
