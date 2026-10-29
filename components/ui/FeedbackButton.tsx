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
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 inline-flex items-center gap-2 bg-stone-900/90 hover:bg-stone-950 text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-lg shadow-black/20 backdrop-blur-md border border-stone-700/60 transition-all hover:scale-105 active:scale-95 group"
        title="Send feedback or report a bug"
        aria-label="Feedback and suggestions"
      >
        <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
          <MessageSquarePlus size={13} />
        </span>
        <span className="hidden sm:inline">Feedback / Ideas</span>
        <span className="sm:hidden">Feedback</span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
