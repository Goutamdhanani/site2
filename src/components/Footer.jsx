import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── FOOTER ENTRANCE ───
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: 'footer',
          start: 'top 85%',
          once: true
        }
      });

      footerTl
        .fromTo('.footer-brand', {
          opacity: 0, x: -30
        }, {
          opacity: 1, x: 0,
          duration: 0.7, ease: 'power3.out'
        })
        .fromTo('.footer-tagline', {
          opacity: 0, x: 30
        }, {
          opacity: 1, x: 0,
          duration: 0.7, ease: 'power3.out'
        }, '<')
        .fromTo('.footer-col', {
          opacity: 0, y: 30
        }, {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        }, '-=0.3')
        .fromTo('.footer-bottom', {
          opacity: 0
        }, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        }, '-=0.2');

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef}>
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="nav-logo-mark">OW</span>
            <span className="nav-logo-word">oddwebs</span>
          </div>
          <p className="footer-tagline">
            Building digital powerhouses<br />for founders and brands worldwide.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <p className="footer-col-label">Services</p>
            <ul>
              <li><a href="#">Web Development</a></li>
              <li><a href="#">Mobile Apps</a></li>
              <li><a href="#">AI &amp; Automation</a></li>
              <li><a href="#">UI/UX Design</a></li>
              <li><a href="#">Growth &amp; SEO</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-col-label">Company</p>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Our Work</a></li>
              <li><a href="#">Process</a></li>
              <li><a href="#">Insights</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-col-label">Connect</p>
            <ul>
              <li><a href="https://instagram.com/oddwebs" target="_blank" rel="noopener noreferrer">@oddwebs</a></li>
              <li><a href="https://www.oddwebs.com" target="_blank" rel="noopener noreferrer">www.oddwebs.com</a></li>
              <li><a href="mailto:hello@oddwebs.com">hello@oddwebs.com</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 oddwebs. All rights reserved.</p>
          <p>Privacy Policy · Terms</p>
        </div>
      </div>
    </footer>
  );
}
