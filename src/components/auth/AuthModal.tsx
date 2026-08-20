import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Fuel, Zap, Shield, Sparkles, Car } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type AuthViewMode = 'login' | 'signup' | 'forgot-password';

interface AuthModalProps {
  initialMode?: AuthViewMode;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
}) => {
  const { config } = useApp();
  const [mode, setMode] = useState<AuthViewMode>(initialMode);

  return (
    <div className="w-full space-y-5" id="auth-modal-content">
      {/* Brand Identity Header Banner */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white border border-white/15 shadow-xl">
        {/* Specular Ambient Sheen */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white text-slate-900 flex items-center justify-center shadow-md border border-white/20 shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">
                  BAIC Telemetry Cloud
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-extrabold border border-white/20 uppercase tracking-wide">
                  Hybrid HEV
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Real-time fuel efficiency, DTE range cluster & trip logs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Navigation Tabs (Visible on Login & Signup) */}
      {mode !== 'forgot-password' && (
        <div className="p-1 rounded-2xl liquid-glass flex items-center gap-1">
          <button
            type="button"
            id="auth-tab-login"
            onClick={() => setMode('login')}
            className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              mode === 'login'
                ? 'text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="auth-mode-pill"
                className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">Sign In</span>
          </button>

          <button
            type="button"
            id="auth-tab-signup"
            onClick={() => setMode('signup')}
            className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="auth-mode-pill"
                className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">Create Account</span>
          </button>
        </div>
      )}

      {/* Dynamic Animated Form Container */}
      <AnimatePresence mode="wait">
        {mode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <LoginForm
              onSwitchToSignup={() => setMode('signup')}
              onSwitchToForgotPassword={() => setMode('forgot-password')}
              onSuccess={onClose}
              onClose={onClose}
            />
          </motion.div>
        )}

        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SignupForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={onClose}
              onClose={onClose}
            />
          </motion.div>
        )}

        {mode === 'forgot-password' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <ForgotPasswordForm
              onSwitchToLogin={() => setMode('login')}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
