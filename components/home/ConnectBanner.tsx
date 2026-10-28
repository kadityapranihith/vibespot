'use client';

import { isFirebaseConfigured } from '@/lib/firebase/config';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function ConnectBanner() {
  const firebase = isFirebaseConfigured();
  const supabase = isSupabaseConfigured();
  if (firebase && supabase) return null;

  return (
    <div className="mx-5 mb-4 rounded-2xl bg-orange-50 px-4 py-3 text-[11px] font-semibold text-orange-900">
      {supabase
        ? 'Places are live from your sheet fallback. Add Firebase keys in `.env.local` to turn on sign-in.'
        : 'Browsing 54 Kakinada spots from the sheet. Add Supabase keys in `.env.local` to use your live restaurant dashboard.'}
    </div>
  );
}