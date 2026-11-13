import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { FeedbackButton } from '@/components/ui/FeedbackButton';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'WhyStayIn — Discover Great Spots in Kakinada',
  description:
    'Find restaurants, cafés, chillout spots, and local gems in Kakinada, Andhra Pradesh. Discover by budget, distance, tags, and authentic community ratings.',
  keywords: [
    'Kakinada restaurants',
    'Kakinada cafes',
    'WhyStayIn Kakinada',
    'Andhra Pradesh food',
    'budget dining Kakinada',
    'chillout places Kakinada',
    'local spots Kakinada',
  ],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF5A36',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${dmSans.variable}`}>
      {GA_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <body className={`${dmSans.className} antialiased bg-[#FAFAFA] text-slate-900 min-h-screen flex flex-col`}>
        <AuthProvider>
          <AnalyticsTracker />
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <FeedbackButton />
        </AuthProvider>
      </body>
    </html>
  );
}
