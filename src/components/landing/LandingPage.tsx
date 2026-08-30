import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Gauge,
  Fuel,
  ArrowRight,
  Sparkles,
  Car,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { APP_VERSION, APP_NAME } from '../../lib/version';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  // Interactive Hero Simulator state
  const [fuelPercentage, setFuelPercentage] = useState<number>(68);
  const tankCapacity = 50; // Litres
  const currentLitres = ((fuelPercentage / 100) * tankCapacity).toFixed(1);
  const efficiency = 14.8; // km/L
  const calculatedRange = Math.round(Number(currentLitres) * efficiency);
  const costToFill = (((100 - fuelPercentage) / 100) * tankCapacity * 1.65).toFixed(2);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 w-full max-w-full overflow-x-hidden relative">
      {/* Background Decorative Mesh & Radial Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Floating Animated Ambient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.28, 0.15],
          x: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-40 right-1/4 w-80 h-80 bg-teal-600/15 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Modern Floating Header Navbar (Agndex style) */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        <nav className="backdrop-blur-xl bg-[#121215]/85 border border-zinc-800 hover:border-zinc-700 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl shadow-black/60 transition-colors">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onLogin}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/25 ring-1 ring-emerald-300/40">
              <Gauge className="w-4.5 h-4.5 text-black stroke-[2.5]" />
            </div>
            <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1">
              Fuel<span className="text-emerald-400">Pulse</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLogin}
              className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 max-w-5xl mx-auto w-full z-10">
        {/* Animated Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold font-mono mb-6 backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>Next-Gen Vehicle Telemetry • PostgreSQL Live</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
        </motion.div>

        {/* Hero Headings */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]"
          >
            Track every drop.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-400 bg-clip-text text-transparent block sm:inline">
              Benchmark every mile.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-xs sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed"
          >
            A high-precision vehicle telemetry cockpit. Calculate dynamic full-tank range, log refueling sessions, and monitor real-world efficiency without clutter.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Your Garage</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#121215]/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/40 text-zinc-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Sign In to Garage</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Interactive Cockpit Preview Block (Agndex Dashboard Style) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="w-full max-w-2xl mt-10 relative"
        >
          {/* Floating Accents */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121215]/95 border border-emerald-500/30 text-emerald-300 text-xs font-mono absolute -top-4 -right-4 z-20 shadow-xl backdrop-blur-md"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Sync Active</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121215]/95 border border-lime-500/30 text-lime-300 text-xs font-mono absolute -bottom-4 -left-4 z-20 shadow-xl backdrop-blur-md"
          >
            <Activity className="w-3.5 h-3.5 text-lime-400" />
            <span>Avg Economy: 14.8 km/L</span>
          </motion.div>

          {/* Interactive Card */}
          <div className="rounded-2xl bg-[#121215]/90 border border-zinc-800 p-5 sm:p-7 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                  Live Telemetry Simulator
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Agndex Engine
              </span>
            </div>

            {/* Range & Litres Live Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider text-emerald-400">Projected Range</span>
                  <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{calculatedRange} <span className="text-xs font-sans text-zinc-400 font-normal">km</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider text-teal-400">Fuel in Tank</span>
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{currentLitres} <span className="text-xs font-sans text-zinc-400 font-normal">/ {tankCapacity}L</span></div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[#09090b] border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider text-lime-400">Cost to Top-up</span>
                  <DollarSign className="w-3.5 h-3.5 text-lime-400" />
                </div>
                <div className="text-2xl font-black text-lime-400 font-mono">${costToFill}</div>
              </div>
            </div>

            {/* Fuel Level Interactive Slider */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[#09090b] border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Adjust Fuel Gauge:</span>
                </div>
                <span className="text-emerald-400 font-bold font-mono text-sm">{fuelPercentage}% Tank</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={fuelPercentage}
                onChange={(e) => setFuelPercentage(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>Reserve (10%)</span>
                <span>Half (50%)</span>
                <span>Full Tank (100%)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minimal 3-Point Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-10 w-full max-w-3xl">
          <div className="p-4 rounded-xl bg-[#121215]/70 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Dynamic Range Engine</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Calculates real-world tank range from your actual refueling logs.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121215]/70 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Multi-Car Garage</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Track personal cars, SUVs, and commuter vehicles in one place.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121215]/70 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">PostgreSQL Persistence</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Direct Supabase database synchronization with TLS encryption.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-800/80 py-5 px-4 text-center text-[11px] text-zinc-400 font-mono bg-[#09090b]">
        <span className="inline-block text-zinc-300">{APP_NAME} v{APP_VERSION} • Built for Drivers • PostgreSQL Database Synced</span>
      </footer>
    </div>
  );
};
