'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WELCOME_KEY } from '@/lib/onboarding';

export function WelcomeGate() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem(WELCOME_KEY)) {
      router.replace('/welcome');
    }
  }, [router]);

  return null;
}
