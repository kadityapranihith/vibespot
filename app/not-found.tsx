import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center pb-24">
      <p className="text-8xl font-black text-[#ff5722] mb-3">404</p>
      <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
      <p className="text-white/60 text-sm mb-8 max-w-xs leading-relaxed">
        The restaurant or page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#ff5722]/30"
      >
        <Home size={15} /> Back to Home
      </Link>
    </div>
  );
}
