import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
      {/* Error Banner */}
      {errors.general && (
        <div className="p-3 rounded-2xl liquid-glass bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold backdrop-blur-xl">
          {errors.general}
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          Email
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <input
            type="email"
            id="login-email-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="driver@example.com"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'ring-2 ring-red-500/50 border-red-500/30'
                : 'focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-300/50 dark:focus:border-blue-400/30'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.email}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Password
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            Forgot?
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="login-password-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="•••••••••"
            className={`w-full pl-10 pr-10 py-3 rounded-2xl liquid-glass text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? 'ring-2 ring-red-500/50 border-red-500/30'
                : 'focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-300/50 dark:focus:border-blue-400/30'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.password}</p>
        )}
      </div>

      {/* Primary Submit Button */}
      <motion.button
        type="submit"
        id="login-submit-button"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 border border-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Bottom Link */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          New driver? <span className="underline decoration-gray-400 dark:decoration-gray-600 underline-offset-2">Create account</span>
        </button>
      </div>
    </form>
  );
};
