import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Provides normalized scroll progress (0–1), velocity, and direction.
 * Designed to work with Lenis smooth scroll but falls back to native scroll.
 */
export function useScrollProgress() {
  const [state, setState] = useState({
    progress: 0,
    velocity: 0,
    direction: 0,
  });

  const rafId = useRef(null);
  const prevScroll = useRef(0);
  const smoothProgress = useRef(0);

  const update = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const rawProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
    const velocity = scrollY - prevScroll.current;
    const direction = velocity > 0 ? 1 : velocity < 0 ? -1 : 0;

    // Smooth interpolation for buttery progress
    smoothProgress.current += (rawProgress - smoothProgress.current) * 0.1;

    prevScroll.current = scrollY;

    setState({
      progress: smoothProgress.current,
      velocity,
      direction,
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial read

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [update]);

  return state;
}

/**
 * Returns a local progress (0–1) for a specific scene range.
 */
export function useSceneProgress(globalProgress, sceneStart, sceneEnd) {
  if (globalProgress < sceneStart) return 0;
  if (globalProgress > sceneEnd) return 1;
  return (globalProgress - sceneStart) / (sceneEnd - sceneStart);
}
