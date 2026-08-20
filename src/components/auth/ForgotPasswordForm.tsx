import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
  onClose,
}) => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('driver@bj30e.com');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast({
        title: 'Recovery Email Sent',
        description: `Password reset instructions sent to ${email} (UI/UX Preview)`,
        type: 'info',
      });
    }, 600);
  };

  return (
    <div className="space-y-4" id="forgot-password-form">
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl liquid-glass text-center space-y-4 border border-sky-400/30"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Instructions Dispatched
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              We've sent a secure password reset link to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 text-xs text-sky-800 dark:text-sky-300 font-medium">
            Link expires in 15 minutes. Check your junk/spam folder if it doesn't appear.
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSwitchToLogin}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md shadow-slate-950/10 dark:shadow-white/10 border border-slate-700/50 dark:border-white/40 cursor-pointer"
            >
              Return to Sign In
            </motion.button>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Didn't receive it? Try another email
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl liquid-glass border border-slate-300/40 dark:border-white/10">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/25">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Account Recovery Protocol
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Enter your registered driver email to receive an instant verification link.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                id="forgot-email-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="driver@domain.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'ring-2 ring-red-500 border-red-500/50'
                    : 'focus:ring-slate-500 dark:focus:ring-white'
                }`}
              />
            </div>
            {error && <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{error}</p>}
          </div>

          <motion.button
            type="submit"
            id="forgot-submit-button"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold shadow-md shadow-slate-950/10 dark:shadow-white/10 border border-slate-700/50 dark:border-white/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reset Instructions</span>
              </>
            )}
          </motion.button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
