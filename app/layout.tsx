import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-logo',
});

export const metadata: Metadata = {
  title: 'Vibespot — Discover Great Food Spots in Kakinada',
  description:
    'Find restaurants, cafés, and food spots in Kakinada, Andhra Pradesh by budget, distance, tags, and authentic community ratings.',
  keywords: [
    'Kakinada restaurants',
    'Kakinada cafes',
    'Vibespot Kakinada',
    'Andhra Pradesh food',
    'budget dining Kakinada',
    'student-friendly cafes Kakinada',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ff5722',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className={`${dmSans.className} antialiased bg-[#faf8f5] text-stone-900 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
