import React from 'react';
import { motion } from 'motion/react';

interface AnimatedProgressBarProps {
  value: number; // 0 to 100
  colorClassName?: string;
  backgroundClassName?: string;
  className?: string;
  height?: string;
  showValueLabel?: boolean;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  colorClassName = 'bg-blue-600',
  backgroundClassName = 'bg-black/10 dark:bg-white/10',
  className = '',
  height = 'h-2.5',
  showValueLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showValueLabel && (
        <div className="flex justify-between items-center text-xs mb-1 text-neutral-500 font-medium">
          <span>Progress</span>
          <span className="font-bold">{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full ${backgroundClassName} overflow-hidden p-0.5`}>
        <motion.div
          className={`h-full rounded-full ${colorClassName}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 18,
            mass: 0.8,
          }}
        />
      </div>
    </div>
  );
};
