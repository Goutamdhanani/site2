import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for cinematic scene components.
 * Provides local scroll progress within a scene range,
 * activity states, and a GSAP context for cleanup.
 *
 * @param {Object} options
 * @param {number} options.sceneStart - Start of scene in vh units (e.g., 0)
 * @param {number} options.sceneEnd - End of scene in vh units (e.g., 150)
 * @param {string} options.triggerSelector - CSS selector for the scene trigger element
 * @param {boolean} options.ready - Whether the scene is ready to animate
 */
export function useSceneAnimation({ sceneStart = 0, sceneEnd = 100, triggerSelector, ready = true }) {
  const ctxRef = useRef(null);
  const timelineRef = useRef(null);

  const sceneRange = useMemo(() => ({
    start: sceneStart,
    end: sceneEnd,
    duration: sceneEnd - sceneStart,
  }), [sceneStart, sceneEnd]);

  useEffect(() => {
    if (!ready) return;

    // Small delay for DOM to settle
    const timer = setTimeout(() => {
      ctxRef.current = gsap.context(() => {});
    }, 50);

    return () => {
      clearTimeout(timer);
      if (ctxRef.current) ctxRef.current.revert();
    };
  }, [ready]);

  /**
   * Create a GSAP timeline pinned to scroll progress within this scene.
   */
  const createScrollTimeline = (trigger, options = {}) => {
    return gsap.timeline({
      scrollTrigger: {
        trigger,
        start: options.start || 'top bottom',
        end: options.end || 'bottom top',
        scrub: options.scrub ?? 1.5,
        ...options,
      },
    });
  };

  return {
    sceneRange,
    createScrollTimeline,
    ctxRef,
  };
}
