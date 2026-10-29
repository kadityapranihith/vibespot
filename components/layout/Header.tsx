'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Search,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  Sparkles,
  SlidersHorizontal,
  MessageSquarePlus,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, signOutUser, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Track active query parameters client-side to light up the active shortcut
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

  // Instant 0ms shortcut click handler (bypasses slow Next.js RSC network fetch when already on home page)
  const handleShortcutClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === '/') {
      e.preventDefault();
      window.history.pushState(null, '', href);
      window.dispatchEvent(new CustomEvent('vibespot:shortcut', { detail: href }));
    }
  };

  const isDiscoverActive = pathname === '/' && (!currentQuery || currentQuery === '?');
  const isNearMeActive = pathname === '/' && currentQuery.includes('sort=distance_asc');
  const isStudentFriendlyActive = pathname === '/' && currentQuery.includes('maxPrice=500');
  const isCafeActive = pathname === '/' && (currentQuery.includes('Caf') || currentQuery.includes('category=Caf%C3%A9s'));

  // Hidden on dedicated full-screen auth pages if desired, or keep everywhere
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand & City */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              onClick={(e) => handleShortcutClick(e, '/')}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Sparkles size={18} className="fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="logo-script text-2xl sm:text-[28px] text-orange-600 font-bold leading-none tracking-tight">
                  Vibespot
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold -mt-0.5">
                  Kakinada
                </span>
              </div>
            </Link>

            {/* City Location indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
              <MapPin size={13} className="text-orange-500" />
              <span>Kakinada, Andhra Pradesh</span>
            </div>
          </div>

          {/* Center / Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
            <Link
              href="/"
              onClick={(e) => handleShortcutClick(e, '/')}
              className={cn(
                'hover:text-orange-600 transition-colors',
                isDiscoverActive ? 'text-orange-600 font-bold' : ''
              )}
            >
              Discover
            </Link>
            <Link
              href="/?sort=distance_asc"
              onClick={(e) => handleShortcutClick(e, '/?sort=distance_asc')}
              className={cn(
                'hover:text-orange-600 transition-colors flex items-center gap-1',
                isNearMeActive ? 'text-orange-600 font-bold' : ''
              )}
            >
              <Compass size={15} />
              Near Me
            </Link>
            <Link
              href="/?maxPrice=500"
              onClick={(e) => handleShortcutClick(e, '/?maxPrice=500')}
              className={cn(
                'hover:text-orange-600 transition-colors',
                isStudentFriendlyActive ? 'text-orange-600 font-bold' : ''
              )}
            >
              Student Friendly
            </Link>
            <Link
              href="/?category=Caf%C3%A9s"
              onClick={(e) => handleShortcutClick(e, '/?category=Caf%C3%A9s')}
              className={cn(
                'hover:text-orange-600 transition-colors',
                isCafeActive ? 'text-orange-600 font-bold' : ''
              )}
            >
              Cafés
            </Link>
          </nav>

          {/* Right: User / Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-stone-100 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors border border-stone-200"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-stone-700 max-w-[120px] truncate pr-1">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <User size={15} className="text-stone-400" />
                      My Profile & Ratings
                    </Link>
                    <Link
                      href="/feedback"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <MessageSquarePlus size={15} className="text-orange-500" />
                      Report Bug / Ideas
                    </Link>
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await signOutUser();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold text-stone-700 hover:text-orange-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full shadow-sm shadow-orange-500/20 transition-all hover:shadow"
                >
                  Join Vibespot
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-stone-50 text-stone-700 text-xs font-medium">
            <MapPin size={13} className="text-orange-500" />
            <span>Kakinada, Andhra Pradesh</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleShortcutClick(e, '/');
              }}
              className={cn(
                'p-3 rounded-xl transition-colors flex items-center gap-2',
                isDiscoverActive
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200'
                  : 'bg-stone-50 hover:bg-orange-50 hover:text-orange-600'
              )}
            >
              <Compass size={15} className="text-orange-500" />
              All Places
            </Link>
            <Link
              href="/?sort=distance_asc"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleShortcutClick(e, '/?sort=distance_asc');
              }}
              className={cn(
                'p-3 rounded-xl transition-colors flex items-center gap-2',
                isNearMeActive
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200'
                  : 'bg-stone-50 hover:bg-orange-50 hover:text-orange-600'
              )}
            >
              <MapPin size={15} className="text-orange-500" />
              Near Me
            </Link>
            <Link
              href="/?maxPrice=500"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleShortcutClick(e, '/?maxPrice=500');
              }}
              className={cn(
                'p-3 rounded-xl transition-colors flex items-center gap-2',
                isStudentFriendlyActive
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200'
                  : 'bg-stone-50 hover:bg-orange-50 hover:text-orange-600'
              )}
            >
              <Sparkles size={15} className="text-orange-500" />
              Budget Friendly
            </Link>
            <Link
              href="/?category=Caf%C3%A9s"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleShortcutClick(e, '/?category=Caf%C3%A9s');
              }}
              className={cn(
                'p-3 rounded-xl transition-colors flex items-center gap-2',
                isCafeActive
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200'
                  : 'bg-stone-50 hover:bg-orange-50 hover:text-orange-600'
              )}
            >
              <Sparkles size={15} className="text-orange-500" />
              Cafés & Hangouts
            </Link>
            <Link
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl transition-colors flex items-center gap-2 bg-stone-50 hover:bg-orange-50 hover:text-orange-600 text-stone-700"
            >
              <MessageSquarePlus size={15} className="text-orange-500" />
              Send Feedback / Report Bug
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
