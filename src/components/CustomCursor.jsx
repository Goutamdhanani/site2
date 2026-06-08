import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const isMobile = 'ontouchstart' in window || window.innerWidth < 768;
    if (isMobile) return;

    const dot = dotRef.current;
    const follower = followerRef.current;
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    };

    const animateFollower = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      requestAnimationFrame(animateFollower);
    };

    const onHoverEnter = () => follower.classList.add('hovering');
    const onHoverLeave = () => {
      follower.classList.remove('hovering');
      follower.classList.remove('cta-hover');
    };
    const onCTAEnter = () => follower.classList.add('cta-hover');

    document.addEventListener('mousemove', onMouseMove);
    animateFollower();

    // Add hover effect to links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .testimonial-card, .showcase-tab');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', onHoverEnter);
      el.addEventListener('mouseleave', onHoverLeave);
    });

    const ctaElements = document.querySelectorAll('.btn-primary, .cta-btn-primary, .nav-cta');
    ctaElements.forEach(el => {
      el.addEventListener('mouseenter', onCTAEnter);
      el.addEventListener('mouseleave', onHoverLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', onHoverEnter);
        el.removeEventListener('mouseleave', onHoverLeave);
      });
    };
  }, []);

  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || window.innerWidth < 768);
  if (isMobile) return null;

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-follower" ref={followerRef} />
    </>
  );
}
