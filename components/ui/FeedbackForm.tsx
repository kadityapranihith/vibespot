'use client';

import { useState, useEffect } from 'react';
import {
  Bug,
  Lightbulb,
  UtensilsCrossed,
  MessageSquarePlus,
  Send,
  Mail,
  X,
  Sparkles,
  CheckCircle,
  Copy,
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
  const [copied, setCopied] = useState(false);
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
      placeholderSubject: 'e.g., Add veg-only filter / WhatsApp share',
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

  const buildEmailContent = () => {
    const fullSubject = `[Vibespot ${currentTopic.label}] ${subject.trim() || 'Community Feedback'}`;
    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://vibespot.vercel.app';

    const fullBody = [
      `Hi Aditya,`,
      ``,
      `Feedback Type: ${currentTopic.label} ${currentTopic.emoji}`,
      `From: ${senderName ? `${senderName} (${senderEmail || 'No email provided'})` : senderEmail || 'Vibespot User'}`,
      ``,
      `Issue / Details:`,
      `${description.trim()}`,
      ``,
      `---------------------------------------`,
      `Sent via Vibespot Kakinada (Page: ${pageUrl})`,
    ].join('\n');

    return { fullSubject, fullBody };
  };

  const handleSendViaGmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your issue or idea before sending.');
      return;
    }
    setError('');

    const { fullSubject, fullBody } = buildEmailContent();

    // Direct Web Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      TARGET_EMAIL
    )}&su=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(fullBody)}`;

    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
    onSuccess?.();
  };

  const handleSendViaDefaultMail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your issue or idea before sending.');
      return;
    }
    setError('');

    const { fullSubject, fullBody } = buildEmailContent();
    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(
      fullSubject
    )}&body=${encodeURIComponent(fullBody)}`;

    window.location.href = mailtoUrl;
    setSubmitted(true);
    onSuccess?.();
  };

  const handleCopyDetails = () => {
    const { fullSubject, fullBody } = buildEmailContent();
    navigator.clipboard.writeText(`To: ${TARGET_EMAIL}\nSubject: ${fullSubject}\n\n${fullBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (submitted) {
    return (
      <div className="text-center py-8 px-4 bg-emerald-50/60 rounded-3xl border border-emerald-200/80">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          <CheckCircle size={28} />
        </div>
        <h3 className="text-lg font-bold text-stone-900 mb-1">
          Opening Your Email App!
        </h3>
        <p className="text-xs text-stone-600 max-w-sm mx-auto mb-4 leading-relaxed">
          Your feedback is addressed to <strong className="text-stone-900">{TARGET_EMAIL}</strong>. Simply hit <strong>Send</strong> in your mail client.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 py-2 px-4"
          >
            Send another message
          </button>
          <button
            onClick={handleCopyDetails}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 py-2 px-3.5 rounded-xl shadow-2xs"
          >
            <Copy size={13} />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Text'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendViaGmail} noValidate className="space-y-4">
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
            Your Email
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

      <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 text-[11px] text-stone-500 flex items-center gap-2">
        <Mail size={14} className="text-orange-500 shrink-0" />
        <span>
          Recipient: <strong className="text-stone-800">{TARGET_EMAIL}</strong>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
        <button
          type="submit"
          className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Send size={14} />
          <span>Send via Gmail</span>
        </button>

        <button
          type="button"
          onClick={handleSendViaDefaultMail}
          className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-3 px-4 rounded-xl border border-stone-200 flex items-center justify-center gap-1.5 transition-colors"
          title="Open your default device mail app"
        >
          <Mail size={14} />
          <span>Default Mail App</span>
        </button>
      </div>
    </form>
  );
}

