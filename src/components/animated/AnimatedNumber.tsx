import React, { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (val: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatter,
}) => {
  const motionVal = useMotionValue<number>(value);
  const springVal = useSpring(motionVal, {
    stiffness: 120,
    damping: 24,
    mass: 0.8,
  });

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  const display = useTransform(springVal, (current: number) => {
    const num = typeof current === 'number' ? current : parseFloat(String(current)) || 0;
    if (isNaN(num)) return `${prefix}0${suffix}`;
    const formatted = formatter
      ? formatter(num)
      : decimals > 0
      ? num.toFixed(decimals)
      : Math.round(num).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });

  return <motion.span className={className}>{display}</motion.span>;
};
