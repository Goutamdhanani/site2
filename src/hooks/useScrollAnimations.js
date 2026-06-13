import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations(ready = true) {
  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {

        // ═══════════════════════════════════════════════════════════
        // 1. CINEMATIC SECTION REVEALS — each section is a showpiece
        // ═══════════════════════════════════════════════════════════
        const sections = gsap.utils.toArray('section:not(#hero)');
        sections.forEach((section) => {
          // Section-level entrance: slight scale up + fade in
          gsap.fromTo(section, {
            opacity: 0,
            y: 80,
          }, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              once: true,
            }
          });

          // Add a gradient glow line at top of each section
          const glowLine = section.querySelector('.section-glow-line');
          if (glowLine) {
            gsap.fromTo(glowLine, {
              scaleX: 0,
            }, {
              scaleX: 1,
              duration: 1.5,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                once: true,
              }
            });
          }
        });

        // ═══════════════════════════════════════════════════════════
        // 2. GIANT SECTION TITLE REVEALS — like Shopify's "Sidekick"
        //    Title rises from below viewport, scales up, then settles
        // ═══════════════════════════════════════════════════════════
        const sectionTitles = gsap.utils.toArray('.section-title-reveal');
        sectionTitles.forEach((title) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: title,
              start: 'top 90%',
              end: 'top 30%',
              scrub: 1,
            }
          });

          tl.fromTo(title, {
            y: 120,
            opacity: 0,
            scale: 0.85,
            filter: 'blur(8px)',
          }, {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            ease: 'power2.out',
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 3. WORD-BY-WORD TEXT ANIMATION — Shopify-style split text
        // ═══════════════════════════════════════════════════════════
        const splitTexts = gsap.utils.toArray('[data-animate="split-text"], .heading-lg, .work-heading');
        splitTexts.forEach((el) => {
          if (el.querySelector('.word-wrap')) return;
          if (el.closest('#hero')) return; // hero has its own animation

          const text = el.textContent.trim();
          const words = text.split(/\s+/);
          el.innerHTML = words.map(word =>
            `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:top"><span class="word" style="display:inline-block;transform:translateY(110%);opacity:0">${word}</span></span>`
          ).join(' ');

          const wordSpans = el.querySelectorAll('.word');
          gsap.to(wordSpans, {
            y: '0%',
            opacity: 1,
            duration: 0.8,
            stagger: 0.04,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              once: true,
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 4. EYEBROW LABELS — slide in from left with accent line
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('.eyebrow').forEach((el) => {
          if (el.closest('#hero')) return;
          gsap.fromTo(el, {
            x: -30, opacity: 0,
          }, {
            x: 0, opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 5. FADE-UP — universal entrance for tagged elements
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
          gsap.fromTo(el, { y: 50, opacity: 0 }, {
            y: 0, opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 6. STAGGER GROUPS — grid items animate in one by one
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-animate="stagger"]').forEach((group) => {
          const children = group.querySelectorAll('[data-stagger-item]');
          if (!children.length) return;
          gsap.fromTo(children, {
            y: 60, opacity: 0, scale: 0.95,
          }, {
            y: 0, opacity: 1, scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 7. PARALLAX DEPTH — background elements move at different speeds
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-parallax]').forEach((el) => {
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

        // ═══════════════════════════════════════════════════════════
        // 8. COUNTER ANIMATION — numbers count up dramatically
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-counter]').forEach((el) => {
          const target = parseFloat(el.dataset.counter);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          const decimals = parseInt(el.dataset.decimals) || 0;

          gsap.fromTo({ val: 0 }, { val: 0 }, {
            val: target,
            duration: 2.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              once: true,
            },
            onUpdate() {
              el.textContent = prefix + this.targets()[0].val.toFixed(decimals) + suffix;
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 9. IMAGE REVEAL — clip-path reveals from center
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-animate="image-reveal"]').forEach((el) => {
          const inner = el.querySelector('img') || el;
          gsap.fromTo(el, {
            clipPath: 'inset(15% 15% 15% 15%)',
            scale: 1.15,
            opacity: 0,
          }, {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            opacity: 1,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 10. LINE DRAW — decorative dividers
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-animate="line-draw"]').forEach((el) => {
          gsap.fromTo(el, { scaleX: 0, transformOrigin: 'left center' }, {
            scaleX: 1,
            duration: 1.0,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 11. HORIZONTAL SCROLL — for feature strips
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('[data-h-scroll]').forEach((section) => {
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

        // ═══════════════════════════════════════════════════════════
        // 12. SECTION BACKGROUND PARALLAX — bg images float slower
        // ═══════════════════════════════════════════════════════════
        gsap.utils.toArray('.section-bg img').forEach((img) => {
          gsap.to(img, {
            yPercent: 25,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('section') || img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            }
          });
        });

        // ═══════════════════════════════════════════════════════════
        // 13. NAVBAR COLOR SHIFT — navbar changes on scroll depth
        // ═══════════════════════════════════════════════════════════
        const navbar = document.querySelector('.navbar');
        if (navbar) {
          ScrollTrigger.create({
            trigger: 'body',
            start: 'top top-=100',
            onUpdate: (self) => {
              if (self.direction === 1 && self.progress > 0.02) {
                navbar.classList.add('navbar--scrolled');
              } else if (self.progress < 0.01) {
                navbar.classList.remove('navbar--scrolled');
              }
            }
          });
        }

      }); // end gsap.context

      window.__scrollAnimCtx = ctx;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.__scrollAnimCtx) {
        window.__scrollAnimCtx.revert();
        window.__scrollAnimCtx = null;
      }
    };
  }, [ready]);
}
