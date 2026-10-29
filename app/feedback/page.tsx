import Link from 'next/link';
import { ArrowLeft, MessageSquarePlus, Mail, ShieldCheck } from 'lucide-react';
import { FeedbackForm } from '@/components/ui/FeedbackForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback & Bug Reports — Vibespot Kakinada',
  description:
    'Report a bug, suggest a new food spot in Kakinada, or submit feature requests directly to the Vibespot team.',
};

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to discovery
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-8">
        {/* Banner */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 p-8 text-white relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
            <MessageSquarePlus size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Send Feedback & Report Bugs
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Spotted a wrong location, have an idea for new filters, or want to recommend a missing café in Kakinada? Let us know below.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-200 text-xs font-semibold mt-4 backdrop-blur-xs">
            <Mail size={12} className="text-orange-400" />
            Direct inbox: pranihithaditya@gmail.com
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}

