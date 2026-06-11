import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations(ready = true) {
  useEffect(() => {
    if (!ready) return;

    // Small delay to ensure DOM is fully painted
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {

        // ─── 1. FADE UP — default entrance for all content blocks ───
        const fadeUpElements = gsap.utils.toArray('[data-animate="fade-up"]');
        fadeUpElements.forEach((el) => {
          gsap.fromTo(el,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                end: 'top 40%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });

        // ─── 2. STAGGER GROUP — for grids of cards/items ───
        const staggerGroups = gsap.utils.toArray('[data-animate="stagger"]');
        staggerGroups.forEach((group) => {
          const children = group.querySelectorAll('[data-stagger-item]');
          if (!children.length) return;
          gsap.fromTo(children,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: group,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });

        // ─── 3. SPLIT TEXT — headline words animate in individually ───
        const headlineElements = gsap.utils.toArray('[data-animate="split-text"]');
        headlineElements.forEach((el) => {
          // Don't re-split if already split
          if (el.querySelector('.word-wrap')) return;

          // Preserve HTML structure but split text nodes into words
          const html = el.innerHTML;
          const words = el.textContent.trim().split(/\s+/);
          el.innerHTML = words.map(word =>
            `<span class="word-wrap"><span class="word">${word}</span></span>`
          ).join(' ');

          const wordSpans = el.querySelectorAll('.word');
          gsap.fromTo(wordSpans,
            { y: '110%', opacity: 0 },
            {
              y: '0%',
              opacity: 1,
              duration: 0.9,
              stagger: 0.06,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
              }
            }
          );
        });

        // ─── 4. PARALLAX — background shapes/images move slower than scroll ───
        const parallaxElements = gsap.utils.toArray('[data-parallax]');
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.3;
          gsap.to(el, {
            yPercent: -30 * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('section') || el.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          });
        });

        // ─── 5. SECTION REVEAL — whole section fades with slight scale ───
        const sectionReveals = gsap.utils.toArray('[data-animate="section-reveal"]');
        sectionReveals.forEach((el) => {
          gsap.fromTo(el,
            { scale: 0.97, opacity: 0, transformOrigin: 'center 60%' },
            {
              scale: 1,
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });

        // ─── 6. COUNTER ANIMATION — numbers count up on scroll ───
        const counters = gsap.utils.toArray('[data-counter]');
        counters.forEach((el) => {
          const target = parseFloat(el.dataset.counter);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          const decimals = parseInt(el.dataset.decimals) || 0;

          gsap.fromTo({ val: 0 },
            { val: 0 },
            {
              val: target,
              duration: 2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                once: true,
              },
              onUpdate() {
                el.textContent = prefix + this.targets()[0].val.toFixed(decimals) + suffix;
              }
            }
          );
        });

        // ─── 7. HORIZONTAL SCROLL — feature strip scrolls left ───
        const hScrollSections = gsap.utils.toArray('[data-h-scroll]');
        hScrollSections.forEach((section) => {
          const track = section.querySelector('[data-h-scroll-track]');
          if (!track) return;

          const totalWidth = track.scrollWidth - window.innerWidth;
          if (totalWidth <= 0) return;

          gsap.to(track, {
            x: -totalWidth,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              pin: true,
              start: 'top top',
              end: () => `+=${totalWidth}`,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            }
          });
        });

        // ─── 8. IMAGE SCALE REVEAL — images zoom in slightly on entrance ───
        const imageReveals = gsap.utils.toArray('[data-animate="image-reveal"]');
        imageReveals.forEach((el) => {
          const inner = el.querySelector('img') || el;
          gsap.fromTo(inner,
            { scale: 1.12, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.4,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });

        // ─── 9. LINE DRAW — horizontal rule animates its width ───
        const lineDraws = gsap.utils.toArray('[data-animate="line-draw"]');
        lineDraws.forEach((el) => {
          gsap.fromTo(el,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              duration: 1.0,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });

      }); // end gsap.context

      // Store context for cleanup
      window.__scrollAnimCtx = ctx;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.__scrollAnimCtx) {
        window.__scrollAnimCtx.revert();
        window.__scrollAnimCtx = null;
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [ready]);
}
