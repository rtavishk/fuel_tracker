import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Car, Shield, Sparkles, Fuel, Zap, Lock, Gauge } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type AuthViewMode = 'login' | 'signup' | 'forgot-password';

export const AuthScreen: React.FC = () => {
  const { config } = useApp();
  const [mode, setMode] = useState<AuthViewMode>('login');

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f5f7fa] dark:bg-[#090d15] text-slate-900 dark:text-slate-100 antialiased font-sans select-none overflow-y-auto">
      {/* Background Refraction Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-white/50 via-slate-300/30 to-transparent dark:from-slate-700/20 dark:via-slate-800/10 dark:to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/2 -right-28 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-slate-400/25 via-slate-300/15 to-transparent dark:from-slate-800/20 dark:via-slate-900/15 dark:to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-28 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-slate-300/30 via-slate-200/20 to-transparent dark:from-slate-800/15 dark:via-slate-900/10 dark:to-transparent blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="liquid-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-300/60 dark:border-white/15 space-y-6"
        >
          {/* Brand Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg border border-black/10 dark:border-white/20">
                <Car className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white text-[11px] font-extrabold border border-slate-300/50 dark:border-white/15 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-500 fill-current" />
                Dynamic Telemetry
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Hybrid Telemetry System
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dynamic fuel economy, DTE range clusters, daily trip logger, and cost analytics for any hybrid, PHEV, or ICE vehicle.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot-password' && (
            <div className="p-1 rounded-2xl liquid-glass flex items-center gap-1">
              <button
                type="button"
                id="auth-screen-tab-login"
                onClick={() => setMode('login')}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="auth-screen-pill"
                    className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                id="auth-screen-tab-signup"
                onClick={() => setMode('signup')}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  mode === 'signup'
                    ? 'text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div
                    layoutId="auth-screen-pill"
                    className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Register Vehicle</span>
              </button>
            </div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <LoginForm
                  onSwitchToSignup={() => setMode('signup')}
                  onSwitchToForgotPassword={() => setMode('forgot-password')}
                  onSuccess={() => {}}
                  onClose={() => {}}
                />
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div
                key="signup-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SignupForm
                  onSwitchToLogin={() => setMode('login')}
                  onSuccess={() => {}}
                  onClose={() => {}}
                />
              </motion.div>
            )}

            {mode === 'forgot-password' && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <ForgotPasswordForm
                  onSwitchToLogin={() => setMode('login')}
                  onClose={() => setMode('login')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          Hybrid Telemetry System · Universal Multi-Vehicle Driver Portal
        </p>
      </div>
    </div>
  );
};
