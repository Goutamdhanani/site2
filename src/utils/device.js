/**
 * Shared device-capability helper — single source of truth.
 * Import `isLite` in every component that needs to gate heavy features.
 *
 * isLite = true when ANY of:
 *   - Touch device  (ontouchstart in window)
 *   - Narrow viewport  (max-width: 900px)
 *   - User prefers reduced motion
 *
 * Evaluated once at module load time (cold-cached).
 */
export const isLite =
  typeof window !== 'undefined' &&
  (
    'ontouchstart' in window ||
    window.matchMedia('(max-width: 900px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
