'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-triggered entrance. Deliberately restrained: 12px rise, one pass,
 * `once: true` so nothing re-animates on scroll-back.
 *
 * `useReducedMotion` is checked here as well as in the global CSS kill switch,
 * because Framer animates via inline transform styles that CSS
 * `transition-duration: 0.01ms` does not fully neutralise.
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}> = ({ children, delay = 0, className, as = 'div' }) => {
  const reduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduced) {
    const Plain = as as React.ElementType;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </Tag>
  );
};

const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/** Wrap a grid or list; direct children animate in sequence. */
export const RevealGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={staggerChild}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
