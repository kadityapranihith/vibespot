'use client';

import { useState, useEffect } from 'react';
import {
  Bug,
  Lightbulb,
  UtensilsCrossed,
  MessageSquarePlus,
  Send,
  Mail,
  Sparkles,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

interface FeedbackFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

type Topic = 'bug' | 'feature' | 'place' | 'other';

const TARGET_EMAIL = 'pranihithaditya@gmail.com';

export function FeedbackForm({ onSuccess, isModal = false }: FeedbackFormProps) {
  const { user } = useAuth();

  const [topic, setTopic] = useState<Topic>('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.displayName) setSenderName(user.displayName);
      if (user.email) setSenderEmail(user.email);
    }
  }, [user]);

  const topics = [
    {
      id: 'bug' as const,
      label: 'Report a Bug',
      emoji: '🐛',
      placeholderSubject: 'e.g., Wrong location / map issue on Bajji spot',
      placeholderDesc: 'Describe what went wrong and where you saw it...',
    },
    {
      id: 'feature' as const,
      label: 'Feature Idea',
      emoji: '💡',
      placeholderSubject: 'e.g., Add veg-only filter / price range filter',
      placeholderDesc: 'Describe the feature you would love to see on Vibespot...',
    },
    {
      id: 'place' as const,
      label: 'Suggest a Spot',
      emoji: '🍽️',
      placeholderSubject: 'e.g., Add Sri Kanya Grand or local tiffin stall',
      placeholderDesc: 'Tell us the spot name, area in Kakinada, and why it is great...',
    },
    {
      id: 'other' as const,
      label: 'General Feedback',
      emoji: '💬',
      placeholderSubject: 'e.g., Loving the app / question about reviews',
      placeholderDesc: 'Share your feedback, question, or experience...',
    },
  ];

  const currentTopic = topics.find((t) => t.id === topic)!;

  // Direct In-App Submit to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your issue or idea before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          subject: subject.trim() || null,
          description: description.trim(),
          sender_name: senderName.trim() || null,
          sender_email: senderEmail.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mailto fallback
  const handleOpenMailto = () => {
    const fullSubject = `[Vibespot ${currentTopic.label}] ${subject.trim() || 'Community Feedback'}`;
    const fullBody = `Hi Aditya,\n\nFeedback Type: ${currentTopic.label}\nFrom: ${senderName || 'User'} (${senderEmail || 'N/A'})\n\nDetails:\n${description.trim()}`;
    window.location.href = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(fullBody)}`;
  };

  if (submitted) {
    return (
      <div className="text-center py-8 px-4 bg-emerald-50/70 rounded-3xl border border-emerald-200">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
          <CheckCircle size={28} />
        </div>
        <h3 className="text-lg font-bold text-stone-900 mb-1">
          Feedback Submitted Successfully!
        </h3>
        <p className="text-xs text-stone-600 max-w-sm mx-auto mb-5 leading-relaxed">
          Thank you for helping improve Vibespot! Our team in Kakinada reviews all suggestions and bug reports.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSubject('');
            setDescription('');
          }}
          className="text-xs font-bold bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 py-2.5 px-5 rounded-xl shadow-2xs transition-colors"
        >
          Send Another Feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Topic Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          Select Topic
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {topics.map((t) => {
            const isSelected = topic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs scale-[1.02]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span>{t.emoji}</span>
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sender info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-stone-600 mb-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g., Aditya"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-stone-600 mb-1">
            Your Email (Optional)
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="your-email@gmail.com"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[11px] font-bold text-stone-600 mb-1">
          Subject <span className="text-stone-400 font-normal">(short summary)</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={currentTopic.placeholderSubject}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
        />
      </div>

      {/* Issue Details */}
      <div>
        <label className="block text-[11px] font-bold text-stone-600 mb-1">
          Issue / Details <span className="text-orange-600 font-bold">*</span>
        </label>
        <textarea
          rows={isModal ? 3 : 5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={currentTopic.placeholderDesc}
          required
          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white leading-relaxed resize-none"
        />
      </div>

      {/* Direct In-App Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {submitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Sending feedback...</span>
          </>
        ) : (
          <>
            <Send size={14} />
            <span>Submit Feedback</span>
          </>
        )}
      </button>

      {/* Direct email fallback option */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
        <span>Prefer using your device email app?</span>
        <button
          type="button"
          onClick={handleOpenMailto}
          className="text-stone-600 hover:text-orange-600 font-bold flex items-center gap-1.5 transition-colors"
        >
          <Mail size={12} /> Send via Mail App
        </button>
      </div>
    </form>
  );
}
