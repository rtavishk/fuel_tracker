import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  interactive?: boolean;
  hoverElevation?: boolean;
  delay?: number;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  interactive = false,
  hoverElevation = true,
  delay = 0,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay,
      }}
      whileHover={
        interactive && hoverElevation
          ? { y: -3, transition: { duration: 0.2, ease: 'easeOut' } }
          : undefined
      }
      whileTap={interactive ? { scale: 0.985 } : undefined}
      className={`rounded-3xl liquid-specular ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
