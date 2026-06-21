/**
 * Global motion constants — single source of truth for all GSAP animations
 * Import from this file in every component to maintain consistency
 */

export const EASE = {
  out: 'power2.out',
  outExpo: 'power4.out',
  inOut: 'power3.inOut',
  back: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.4)',
  none: 'none',           // for scrub animations ONLY
}

export const DUR = {
  fast: 0.3,
  mid: 0.6,
  slow: 0.9,
  hero: 1.2,
}

export const STAGGER = {
  tight: 0.04,   // characters
  normal: 0.08,   // list items, grid cards
  loose: 0.15,   // section-level reveals
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
