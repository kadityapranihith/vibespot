'use client';

import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 inline-flex items-center gap-2 bg-white/95 hover:bg-stone-50 text-stone-800 text-xs font-bold px-3.5 py-2.5 rounded-full shadow-md border border-stone-200/90 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
        title="Send feedback or report a bug"
        aria-label="Feedback and suggestions"
      >
        <span className="w-5 h-5 rounded-full bg-[#FF5A36]/20 text-[#FF5A36] flex items-center justify-center group-hover:bg-[#FF5A36] group-hover:text-white transition-colors">
          <MessageSquarePlus size={13} />
        </span>
        <span className="hidden sm:inline">Feedback / Ideas</span>
        <span className="sm:hidden">Feedback</span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

