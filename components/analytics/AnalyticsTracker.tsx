'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // 1. Skip tracking if current user is an admin or browsing admin portal
    if (isAdmin || pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
      return;
    }

    // 2. Prevent duplicate triggers on same path within same render cycle
    if (lastTrackedPath.current === pathname) {
      return;
    }
    lastTrackedPath.current = pathname;

    // 3. Get or create persistent session ID for the browser tab
    let sessionId: string | null = null;
    try {
      sessionId = sessionStorage.getItem('vb_session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('vb_session_id', sessionId);
      }
    } catch {
      // sessionStorage might fail in strict private mode
    }

    // 4. Detect basic device category
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const deviceType = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

    // 5. Fire non-blocking beacon or fetch
    const payload = JSON.stringify({
      path: pathname,
      sessionId,
      deviceType,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
    });

    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/analytics/visit', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Fire-and-forget
    }
  }, [pathname, isAdmin]);

  return null;
}

