import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Accessible, performant Number Count-Up Component
 * Respects `prefers-reduced-motion`.
 */
export function AnimatedCounter({
  end,
  duration = 250,
  className = '',
}: {
  end: number;
  duration?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? end : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(end);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, shouldReduceMotion]);

  return <span className={className}>{count}</span>;
}

/**
 * Viewport-triggered Motion Progress Bar
 */
export function AnimatedProgressBar({
  progress,
  colorClass = 'bg-purple-600',
  heightClass = 'h-1.5',
  bgClass = 'bg-slate-200',
}: {
  progress: number;
  colorClass?: string;
  heightClass?: string;
  bgClass?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`w-full ${bgClass} rounded-full ${heightClass} overflow-hidden`}>
      <motion.div
        className={`${colorClass} ${heightClass} rounded-full`}
        initial={shouldReduceMotion ? { width: `${progress}%` } : { width: 0 }}
        whileInView={{ width: `${progress}%` }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}

/**
 * Optimized Motion Variants for Instant Zero-Downtime Page Rendering
 */
export const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.01,
    },
  },
};

export const itemFadeSlide = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

export const cardHoverProps = {
  whileHover: { y: -2, transition: { duration: 0.15, ease: 'easeOut' } },
  whileTap: { scale: 0.99 },
};

export const buttonTapProps = {
  whileHover: { y: -1, scale: 1.01, transition: { duration: 0.1 } },
  whileTap: { scale: 0.98 },
};

/**
 * Instant Page Wrapper
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
