'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft, KeyRound, CheckCircle2, X, Mail } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { getFirebaseErrorMessage } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSuccess(
        `Password reset email sent to ${forgotEmail.trim()}! Please check your inbox and spam folder.`
      );
    } catch (err: unknown) {
      console.warn('Password reset warning:', err);
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/user-not-found') {
        setForgotError('No account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setForgotError('Please enter a valid email address.');
      } else {
        setForgotError(getFirebaseErrorMessage(code));
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push(decodeURIComponent(redirect));
    } catch (err: unknown) {
      console.warn('Firebase Auth sign-in/sign-up attempt failed:', err);
      const code = (err as { code?: string })?.code || '';
      setError(getFirebaseErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push(decodeURIComponent(redirect));
    } catch (err: unknown) {
      console.warn('Firebase Auth Google attempt failed:', err);
      const code = (err as { code?: string })?.code || '';
      setError(getFirebaseErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 sm:my-14 px-6 py-8 sm:p-10 bg-white sm:rounded-3xl sm:border sm:border-stone-200/90 sm:shadow-xl sm:shadow-orange-500/5">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="text-center mb-6">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-orange-500 text-white items-center justify-center shadow-md shadow-orange-500/20 mb-3">
          <Sparkles size={24} />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          {mode === 'login' ? 'Welcome Back to Vibespot' : 'Join Vibespot Kakinada'}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          {mode === 'login'
            ? 'Sign in to rate your favourite places and save spots'
            : 'Discover, rate, and explore the best food spots in Kakinada'}
        </p>
      </div>

      {!isFirebaseConfigured() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-2xl leading-relaxed">
          <p className="font-bold text-amber-900 mb-1">Firebase Setup Note:</p>
          Add your Firebase project credentials in <code>.env.local</code> to enable live email & Google sign-in. You can browse all 54 places without signing in.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl leading-relaxed"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-stone-700 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@domain.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-stone-700">
              Password
            </label>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotEmail(email);
                  setForgotSuccess('');
                  setForgotError('');
                }}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading || !isFirebaseConfigured()}
          className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
          or
        </span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading || !isFirebaseConfigured()}
        className="w-full flex items-center justify-center gap-3 border border-stone-200 hover:bg-stone-50 py-3 px-4 rounded-xl text-xs font-bold text-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      <p className="mt-8 text-center text-xs text-stone-500 font-medium">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link
              href={`/auth/signup?redirect=${encodeURIComponent(redirect)}`}
              className="text-orange-600 font-bold hover:underline"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-orange-600 font-bold hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <KeyRound size={18} />
                </div>
                <h3 className="text-base font-black text-stone-900">
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Enter your registered email address below. We will send a secure Google Firebase link to reset your password.
            </p>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Reset Link Sent!</span>
                </div>
                <p className="leading-relaxed">{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full mt-2 py-2 bg-white text-emerald-800 border border-emerald-300 rounded-xl font-bold hover:bg-emerald-100/50 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {forgotError}
                  </div>
                )}

                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-stone-700 mb-1">
                    Your Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/25 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={13} />
                        <span>Send Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
