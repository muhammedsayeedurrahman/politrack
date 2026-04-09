/**
 * Figma-inspired Design Tokens
 *
 * Structured, token-driven design system with precise spacing,
 * consistent motion curves, and layered elevation.
 */

// --- Motion / Easing Tokens ---
export const motion = {
  /** Quick micro-interactions (hover, toggle) */
  fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const },
  /** Standard transitions (expand, slide) */
  normal: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  /** Expressive entrances (page transitions, modals) */
  expressive: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  /** Spring-like bounce for playful elements */
  spring: { type: 'spring' as const, stiffness: 300, damping: 24 },
  /** Gentle spring for layout shifts */
  gentle: { type: 'spring' as const, stiffness: 200, damping: 28 },
  /** Stagger delay between list items (seconds) */
  stagger: 0.06,
} as const;

// --- Framer Motion Variant Presets ---
export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: motion.normal },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: motion.expressive },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0, transition: motion.expressive },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: motion.expressive },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: motion.expressive },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: motion.expressive },
  },
  slideUp: {
    hidden: { y: '100%' },
    visible: { y: 0, transition: motion.expressive },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: motion.stagger, delayChildren: 0.1 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: motion.normal },
  },
} as const;

// --- Elevation / Shadow Tokens ---
export const elevation = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0,0,0,0.04)',
  sm: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
  md: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03)',
  /** Focused/active card elevation */
  focus: '0 0 0 2px var(--primary), 0 10px 15px -3px rgba(0,0,0,0.08)',
  /** Hover lift effect */
  hover: '0 14px 28px -8px rgba(0,0,0,0.12), 0 4px 8px -4px rgba(0,0,0,0.06)',
} as const;

// --- Spacing Scale (4px base) ---
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

// --- Typography Scale ---
export const typography = {
  display: { size: '3rem', lineHeight: 1.1, weight: 700, tracking: '-0.02em' },
  h1: { size: '2.25rem', lineHeight: 1.2, weight: 700, tracking: '-0.02em' },
  h2: { size: '1.875rem', lineHeight: 1.25, weight: 600, tracking: '-0.01em' },
  h3: { size: '1.5rem', lineHeight: 1.3, weight: 600, tracking: '0' },
  h4: { size: '1.25rem', lineHeight: 1.4, weight: 600, tracking: '0' },
  body: { size: '1rem', lineHeight: 1.6, weight: 400, tracking: '0' },
  bodySmall: { size: '0.875rem', lineHeight: 1.5, weight: 400, tracking: '0' },
  caption: { size: '0.75rem', lineHeight: 1.4, weight: 500, tracking: '0.02em' },
  overline: { size: '0.625rem', lineHeight: 1.6, weight: 600, tracking: '0.08em' },
} as const;

// --- Border Radius Tokens ---
export const radius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
  xl: '0.875rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// --- Z-Index Scale ---
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70,
} as const;

// --- Risk Color Palette (for programmatic use) ---
export const riskColors = {
  critical: { base: 'hsl(0,72%,51%)', bg: 'hsl(0,72%,51%,0.1)', border: 'hsl(0,72%,51%,0.3)' },
  high: { base: 'hsl(25,95%,53%)', bg: 'hsl(25,95%,53%,0.1)', border: 'hsl(25,95%,53%,0.3)' },
  medium: { base: 'hsl(45,93%,47%)', bg: 'hsl(45,93%,47%,0.1)', border: 'hsl(45,93%,47%,0.3)' },
  low: { base: 'hsl(142,71%,45%)', bg: 'hsl(142,71%,45%,0.1)', border: 'hsl(142,71%,45%,0.3)' },
  info: { base: 'hsl(200,80%,50%)', bg: 'hsl(200,80%,50%,0.1)', border: 'hsl(200,80%,50%,0.3)' },
} as const;
