'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, Mail, MapPin, Compass, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/account');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to discovery
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-850 p-8 text-center text-white relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-3xl font-black flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 border-2 border-white/20 mb-3">
            {initial}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {user.displayName || user.email?.split('@')[0]}
          </h1>
          <p className="text-stone-400 text-xs flex items-center justify-center gap-1.5 mt-1 font-mono">
            <Mail size={13} className="text-orange-400" />
            {user.email}
          </p>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-orange-200 text-[11px] font-semibold mt-3 backdrop-blur-xs">
            <ShieldCheck size={12} className="text-emerald-400" />
            Verified Firebase Account
          </div>
        </div>

        {/* Details and Actions */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Primary City
              </span>
              <span className="text-base font-bold text-stone-900 block mt-1">
                Kakinada, AP
              </span>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Membership
              </span>
              <span className="text-base font-bold text-orange-600 block mt-1">
                Foodie Explorer
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Compass size={15} />
              Explore Kakinada Spots
            </Link>

            <button
              onClick={async () => {
                await signOutUser();
                router.push('/');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
