'use client';

import { useState } from 'react';
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  UtensilsCrossed,
  X,
  ExternalLink,
  Sparkles,
  Heart,
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<'bug' | 'feature' | 'place' | 'other'>('bug');

  if (!isOpen) return null;

  // Google Form URL from environment variable or default
  const feedbackFormUrl =
    process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ||
    'https://docs.google.com/forms';

  const topics = [
    {
      id: 'bug' as const,
      label: 'Report a Bug',
      emoji: '🐛',
      icon: Bug,
      desc: 'Found a layout issue, broken button, or inaccurate location',
    },
    {
      id: 'feature' as const,
      label: 'Feature Idea',
      emoji: '💡',
      icon: Lightbulb,
      desc: 'Suggest new filters, bookmarking, or improvements',
    },
    {
      id: 'place' as const,
      label: 'Suggest a Spot',
      emoji: '🍽️',
      icon: UtensilsCrossed,
      desc: 'Recommend a café, tiffin center, or restaurant in Kakinada',
    },
    {
      id: 'other' as const,
      label: 'General Feedback',
      emoji: '💬',
      icon: MessageSquarePlus,
      desc: 'Share any thought, compliment, or experience with us',
    },
  ];

  const handleOpenForm = () => {
    window.open(feedbackFormUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Help Shape Vibespot</h2>
              <p className="text-xs text-orange-100 mt-0.5">
                Report issues, suggest features, or recommend eateries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            What would you like to share?
          </p>

          {/* Topic selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topics.map((t) => {
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTopic(t.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-orange-50/80 border-orange-500 shadow-xs ring-1 ring-orange-500'
                      : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{t.emoji}</span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-orange-950' : 'text-stone-900'
                      }`}
                    >
                      {t.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">{t.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs text-stone-600 leading-relaxed">
            <p className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
              <span>📋</span> We review all submissions
            </p>
            <span>
              Your feedback is connected to our team&apos;s Google Sheet and helps make food discovery in Kakinada accurate and enjoyable for everyone.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleOpenForm}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Open Google Form</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
