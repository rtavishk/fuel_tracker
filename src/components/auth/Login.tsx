import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Gauge,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Database,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured, signInWithEmail, resetPasswordForEmail } from '../../lib/supabase';

interface LoginProps {
  onSwitchToRegister: () => void;
  onBackToLanding?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onBackToLanding }) => {
  const { login } = useApp();
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('fuel_tracker_saved_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [resetEmail, setResetEmail] = useState('');

  const supabaseReady = isSupabaseConfigured();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please enter your password (minimum 6 characters).');
      return;
    }

    setIsLoading(true);

    try {
      // Try to login via API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (rememberMe) {
          localStorage.setItem('fuel_tracker_saved_email', email.trim());
        } else {
          localStorage.removeItem('fuel_tracker_saved_email');
        }

        // Store token if provided
        if (data.token) {
          localStorage.setItem('fuel_tracker_token', data.token);
        }

        const userName = data.user.name || email.split('@')[0];
        const loginSuccess = await login(email.trim(), userName, data.user.id);
        
        if (!loginSuccess) {
          setError('Login failed. Please try again.');
          setIsLoading(false);
          return;
        }
      } else {
        // API login failed - get error message
        const errorData = await response.json();
        setError(errorData.error || 'Invalid email or password.');
        setIsLoading(false);
        return; // Stop here - don't proceed with fallbacks
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Failed to authenticate. Please check your credentials.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      if (supabaseReady) {
        const { error: resetErr } = await resetPasswordForEmail(resetEmail.trim());
        if (resetErr) {
          setError(resetErr.message);
        } else {
          setSuccessMessage('Password reset link sent to your email. Check your inbox.');
          setTimeout(() => {
            setViewMode('login');
          }, 3000);
        }
      } else {
        setSuccessMessage('Database offline mode: Simulated reset email dispatched.');
        setTimeout(() => {
          setViewMode('login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] text-zinc-200 relative overflow-x-hidden w-full max-w-full selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 my-6"
      >
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing</span>
          </button>
        )}

        {/* App Branding */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-500 text-black font-black shadow-xl shadow-emerald-500/25 mb-3 ring-1 ring-emerald-300/40">
            <Gauge className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
            Fuel Pulse Telemetry
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Vehicle mileage telemetry, fuel tracking & database sync
          </p>
        </div>

        <Card className="p-6 sm:p-7 border-zinc-800 bg-[#121215]/95 shadow-2xl backdrop-blur-2xl relative shadow-black/80">
          <AnimatePresence mode="wait">
            {viewMode === 'login' ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 pb-3.5 border-b border-zinc-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Sign In</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Access your personal vehicle database
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold font-mono">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>{supabaseReady ? 'Supabase Live' : 'Database SSL'}</span>
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="driver@example.com"
                        required
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setViewMode('forgot');
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your account password"
                        required
                        autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-[#09090b] text-emerald-500 focus:ring-emerald-500/20 accent-emerald-400"
                      />
                      <span className="text-xs text-zinc-400">Remember session</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Garage</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 pb-4 border-b border-zinc-800">
                  <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Enter your email to receive recovery instructions
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="driver@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setViewMode('login');
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        'Send Recovery'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-emerald-400 font-semibold hover:underline hover:text-emerald-300 cursor-pointer"
              >
                Create new vehicle profile
              </button>
            </p>
          </div>
        </Card>

        {/* Security & Database Status */}
        <div className="mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Supabase Auth & TLS
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Encrypted Database
          </span>
        </div>
      </motion.div>
    </div>
  );
};
