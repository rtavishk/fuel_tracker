import React from 'react';
import { motion } from 'motion/react';
import { Fuel, Zap, AlertTriangle } from 'lucide-react';

interface GaugeMeterProps {
  currentRangeKm: number;
  benchmarkFullKm: number;
  unit?: string;
  subLabel?: string;
  size?: number;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  currentRangeKm,
  benchmarkFullKm,
  unit = 'km',
  subLabel = 'Distance-to-Empty',
  size = 220,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentRangeKm / (benchmarkFullKm || 680)) * 100));

  // Colors based on fuel level
  const isLow = percentage < 15;
  const isModerate = percentage >= 15 && percentage < 35;

  const strokeColor = isLow ? '#f43f5e' : isModerate ? '#f59e0b' : '#10b981';
  const glowColor = isLow ? 'rgba(244,63,94,0.3)' : isModerate ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)';

  // SVG Gauge calculations (Semi-circle arc 180 degrees)
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size * 0.72 }}>
      <svg
        width={size}
        height={size * 0.65}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Background Track */}
        <path
          d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
          fill="none"
          stroke="#1c1c1c"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Dynamic Progress Arc */}
        <motion.path
          d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#gaugeGlow)"
        />

        {/* Tick marks */}
        <text x={strokeWidth + 2} y={size / 2 + 18} fill="#737373" fontSize="10" fontWeight="600" textAnchor="middle">
          E
        </text>
        <text x={size / 2} y={16} fill="#737373" fontSize="10" fontWeight="600" textAnchor="middle">
          1/2
        </text>
        <text x={size - strokeWidth - 2} y={size / 2 + 18} fill="#737373" fontSize="10" fontWeight="600" textAnchor="middle">
          F
        </text>
      </svg>

      {/* Central Reading HUD */}
      <div className="absolute inset-x-0 top-[26%] flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1 text-neutral-400 text-xs font-medium uppercase tracking-wider mb-0.5">
          {isLow ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          ) : (
            <Fuel className="w-3.5 h-3.5 text-orange-400" />
          )}
          <span>{subLabel}</span>
        </div>

        <div className="flex items-baseline gap-1 font-mono">
          <motion.span
            key={currentRangeKm}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-extrabold tracking-tight text-white font-mono"
          >
            {Math.round(currentRangeKm)}
          </motion.span>
          <span className="text-sm font-semibold text-neutral-400">{unit}</span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#141414] border border-[#262626]">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: strokeColor }}
          />
          <span className="text-neutral-300">
            {percentage.toFixed(0)}% Tank (~{Math.round(benchmarkFullKm)} {unit} full)
          </span>
        </div>
      </div>
    </div>
  );
};
