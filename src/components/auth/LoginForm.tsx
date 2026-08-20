import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Check, Car } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess: () => void;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onSuccess,
  onClose,
}) => {
  const { showToast, config, loginUser } = useApp();
  const [email, setEmail] = useState('driver@bj30e.com');
  const [password, setPassword] = useState('bj30e-hybrid-2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleQuickFillDemo = () => {
    setEmail('driver@bj30e.com');
    setPassword('bj30e-hybrid-2025');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email or Driver ID is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrors({ general: res.error || 'Failed to sign in. Please check your credentials.' });
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    const socialEmail = provider === 'Google' ? 'driver@gmail.com' : 'driver@icloud.com';
    const res = await loginUser(socialEmail, 'sso_session_verified');
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
      {/* Notice Banner */}
      {errors.general ? (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {errors.general}
        </div>
      ) : (
        <div className="p-3 rounded-2xl liquid-glass border border-slate-300/50 dark:border-white/10 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-medium">Testing with demo driver credentials?</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFillDemo}
            className="px-2.5 py-1 rounded-xl bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/15 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold transition-colors shrink-0 cursor-pointer text-[11px]"
          >
            Auto-fill Demo
          </button>
        </div>
      )}

      {/* Email / Driver ID Input */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Email or Driver Call-Sign
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            id="login-email-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="driver@baic-auto.com"
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'ring-2 ring-red-500 border-red-500/50'
                : 'focus:ring-slate-500 dark:focus:ring-white'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.email}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="login-password-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••••••"
            className={`w-full pl-10 pr-10 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? 'ring-2 ring-red-500 border-red-500/50'
                : 'focus:ring-slate-500 dark:focus:ring-white'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.password}</p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
              rememberMe
                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xs'
                : 'border-slate-300 dark:border-slate-600 bg-black/5 dark:bg-white/5'
            }`}
          >
            {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Remember this device for 30 days
          </span>
        </label>
      </div>

      {/* Primary Submit Button */}
      <motion.button
        type="submit"
        id="login-submit-button"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold shadow-md shadow-slate-950/10 dark:shadow-white/10 border border-slate-700/50 dark:border-white/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Sign In to Telemetry Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Social SSO Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            Or quick connect with
          </span>
        </div>
      </div>

      {/* Social SSO Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSocialLogin('Google')}
          className="py-2.5 px-3 rounded-2xl liquid-glass hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-black/5 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {/* Google Color G */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Google SSO</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSocialLogin('Apple')}
          className="py-2.5 px-3 rounded-2xl liquid-glass hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-black/5 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {/* Apple Icon */}
          <svg className="w-4 h-4 fill-current text-slate-900 dark:text-white" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.77-12-14.18-6.19-9.13-10.88-19.3-14.07-30.5-3.19-11.2-4.79-21.84-4.79-31.92 0-14.78 3.8-26.79 11.4-36.03 7.6-9.24 16.9-13.97 27.9-14.2 4.79 0 10.15 1.25 16.08 3.75 5.92 2.5 9.77 3.8 11.53 3.9 1.77 0 5.86-1.42 12.3-4.25 6.44-2.83 12.01-4.08 16.71-3.75 12.75.87 22.84 5.76 30.26 14.67-11.08 6.74-16.51 16.08-16.3 28.04.22 9.57 3.81 17.61 10.76 24.13 6.96 6.52 15.11 10.22 24.46 11.08-2.18 6.74-4.89 13.04-8.15 18.91zM119.22 31.85c0-7.17 2.61-13.91 7.82-20.21 5.22-6.3 11.74-10.22 19.56-11.74.22 1.09.33 2.07.33 2.93 0 7.17-2.67 14.02-8.04 20.54-5.36 6.52-11.96 10.38-19.78 11.59-.22-1.09-.33-2.09-.33-3.11z" />
          </svg>
          <span>Apple ID</span>
        </motion.button>
      </div>

      {/* Guest Demo Mode & Switch to Sign Up */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          Continue in Guest / Offline Mode
        </button>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Don't have a vehicle account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer ml-1"
          >
            Create an Account
          </button>
        </p>
      </div>
    </form>
  );
};
