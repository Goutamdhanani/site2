import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Layers,
  Cpu,
  Globe,
  Search,
  Award,
  Edit3,
  TrendingUp,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { isLite } from '../utils/device';
import { trackEvent, trackCTA } from '../utils/analytics';

gsap.registerPlugin(ScrollTrigger);

const serviceCategories = [
  {
    title: 'Web Design & Build',
    tag: 'CORE SYSTEM',
    price: 499,
    icon: Layers,
    description: 'Crafted without compromise. High-fidelity, custom-coded web architectures inspired by Apple, Linear, and modern luxury automotive portals. Optimized for speed and premium conversion.',
    subServices: [
      'Tailored UI/UX Layouts',
      'Next.js & React Architectures',
      'Editorial Typography & Motion',
      'Conversion-Optimized Landing Pages',
      'Performance Fine-Tuning'
    ]
  },
  {
    title: 'AI & Automation',
    tag: 'INTELLIGENCE',
    price: 599,
    icon: Cpu,
    description: 'Integrate artificial intelligence directly into your daily operations. Build autonomous agent workflows, custom LLM pipelines, and intelligent automations that save hundreds of hours.',
    subServices: [
      'Custom LLM & GPT Pipelines',
      'Workflow Automations (Make, Zapier)',
      'Agentic Operations & Chatbots',
      'AI-Driven Analytics & Mining',
      'Intelligent API Connectors'
    ]
  },
  {
    title: 'Hosting & Infrastructure',
    tag: 'ENGINE ROOM',
    price: 199,
    icon: Globe,
    description: 'Sleek, secure, and always online. We design and manage global edge-hosting infrastructure with high-availability CDNs, SSL certificates, and 24/7 technical surveillance.',
    subServices: [
      'Managed Global CDN (Vercel, AWS)',
      'SSL Security & Firewalls',
      'Domain & DNS Management',
      'Automated Backups & Monitoring',
      'Infinite Scalability Tuning'
    ]
  },
  {
    title: 'Google & Local SEO',
    tag: 'TRAFFIC ENGINE',
    price: 349,
    icon: Search,
    description: 'Dominate organic search rankings and AI-driven searches. Technical audits, core vitals optimization, schema architecture, and local authority growth tailored for North America.',
    subServices: [
      'Technical SEO Auditing',
      'Schema & Structured Data Markup',
      'Core Web Vitals Optimization',
      'Keyword Mapping & Intelligence',
      'Google Profile Authority Build'
    ]
  },
  {
    title: 'Branding',
    tag: 'VISUAL SYSTEM',
    price: 299,
    icon: Award,
    description: 'Establish absolute trust and prestige. Editorial logo design, curated typography, brand books, and complete design languages that command premium prices.',
    subServices: [
      'Brand Identity & Systems',
      'Sleek Logo Mark Drafting',
      'Luxury Typography Selection',
      'Comprehensive Brand Guidelines',
      'Corporate Presentation Assets'
    ]
  },
  {
    title: 'Content & Copy',
    tag: 'NARRATIVE',
    price: 249,
    icon: Edit3,
    description: 'Copywriting that commands attention. Technical storytelling, SEO authority articles, and conversion-focused microcopy designed for sophisticated audiences.',
    subServices: [
      'High-Conversion Website Copy',
      'Technical Product Copywriting',
      'SEO Authority Blog Posts',
      'Editorial Proofreading & Voice'
    ]
  },
  {
    title: 'Ads & Marketing',
    tag: 'ACCELERATOR',
    price: 449,
    icon: TrendingUp,
    description: 'Maximize performance marketing ROI. Premium ad creatives, landing page funnels, and data-driven PPC campaigns designed to capture high-value customer acquisitions.',
    subServices: [
      'Google Search & Display PPC',
      'High-Prestige Social Campaigning',
      'Conversion Funnel Engineering',
      'Advanced Attribution Analytics'
    ]
  }
];

const comparisonData = [
  {
    metric: "01",
    feature: "Risk Architecture",
    usVal: "100% Free Live Demo",
    usDesc: "We build your custom home page for free before you sign anything. Zero deposit. Zero risk.",
    themVal: "30% - 50% Upfront Deposit",
    themDesc: "Forces you to lock in capital and sign blind contracts before seeing a single screen of work."
  },
  {
    metric: "02",
    feature: "Lock-in & Retainers",
    usVal: "No Rigid Contracts",
    usDesc: "Option to buy out 100% of the code for a one-time fee, or keep flexible low-cost monthly management.",
    themVal: "$1,500 - $3,000/mo Chains",
    themDesc: "Locks you into rigid monthly retainers for hosting, simple text updates, and support."
  },
  {
    metric: "03",
    feature: "Overhead Costing",
    usVal: "Direct Engineer Flat-Rate",
    usDesc: "Starts at $499. Every single dollar goes directly into design and software engineering.",
    themVal: "$5,000+ Baseline Minimums",
    themDesc: "Bloated pricing to fund sales commissions, managers, and expensive luxury offices."
  },
  {
    metric: "04",
    feature: "Build Speed",
    usVal: "3 to 7 Days Delivery",
    usDesc: "Rapid, agile sprints delivering fully functional products weeks ahead of schedule.",
    themVal: "4 to 8 Weeks Timeline",
    themDesc: "Bogged down by red tape, corporate account managers, and endless briefing loops."
  }
];

export default function ServicesPage({ onViewChange }) {
  const pageRef = useRef(null);
  const carouselRef = useRef(null);
  
  // Carousel Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(0);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastXRef = useRef(0);

  // Configurator Selection
  const [selectedServices, setSelectedServices] = useState([0]); // Web Design checked by default
  const [displayedPrice, setDisplayedPrice] = useState(499);
  
  // Sticky CTA visibility
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Timeline Scroll Animation Setup
  const timelineRef = useRef(null);
  const timelineProgressLineRef = useRef(null);

  // Floating ambient lighting mouse tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Navigation floating styling on mount
  useEffect(() => {
    const nav = document.getElementById('navbar');
    if (nav) {
      nav.classList.add('nav-floating');
    }
    return () => {
      if (nav) {
        nav.classList.remove('nav-floating');
      }
    };
  }, []);

  // Track page scroll to display sticky CTA after 40% scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (pageHeight <= 0) return;
      const scrollRatio = window.scrollY / pageHeight;
      setShowStickyCta(scrollRatio > 0.4);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ambient mouse position update
  const handleMouseMoveGlobal = (e) => {
    if (isLite) return;
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Pricing calculations
  const originalTotal = selectedServices.reduce((sum, idx) => sum + serviceCategories[idx].price, 0);
  const hasDiscount = selectedServices.length >= 2;
  const discountAmount = hasDiscount ? Math.round(originalTotal * 0.20) : 0;
  const finalTotal = originalTotal - discountAmount;

  // Animated Price Counter using GSAP
  useEffect(() => {
    const obj = { value: displayedPrice };
    const tween = gsap.to(obj, {
      value: finalTotal,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayedPrice(Math.round(obj.value));
      }
    });
    return () => tween.kill();
  }, [finalTotal]);

  // Configurator Toggles
  const toggleServiceSelection = (idx) => {
    setSelectedServices(prev => {
      let next;
      if (prev.includes(idx)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        next = prev.filter(i => i !== idx);
      } else {
        next = [...prev, idx];
      }
      
      trackEvent('growth_stack_selection_change', {
        service_name: serviceCategories[idx].title,
        action: next.includes(idx) ? 'checked' : 'unchecked',
        total_selected: next.length
      });
      return next;
    });
  };

  // Submit proposal request
  const handleClaimProposal = (e) => {
    e.preventDefault();
    const mappedServices = selectedServices.map(idx => serviceCategories[idx].title);
    sessionStorage.setItem('preferred_services', JSON.stringify(mappedServices));
    
    trackCTA('claim_proposal', 'click', {
      selected_services: mappedServices,
      total_price: finalTotal,
      discount_applied: hasDiscount
    });
    onViewChange('demo');
  };

  // Carousel Drag-to-Scroll Handlers (Desktop)
  const handleMouseDown = (e) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setIsDragging(true);
    startXRef.current = e.pageX - carousel.offsetLeft;
    scrollLeftRef.current = carousel.scrollLeft;
    lastXRef.current = e.pageX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const carousel = carouselRef.current;
    if (!carousel) return;
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    carousel.scrollLeft = scrollLeftRef.current - walk;
    
    // Tilt calculations based on mouse speed
    const diff = x - lastXRef.current;
    lastXRef.current = x;
    const targetTilt = Math.min(Math.max(diff * 0.25, -8), 8);
    setTiltAngle(targetTilt);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    // Smooth release back to 0 tilt
    gsap.to({ a: tiltAngle }, {
      a: 0,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: function() {
        setTiltAngle(this.targets()[0].a);
      }
    });
  };

  // Carousel Arrow Navigation
  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector('.lxs-card-wrapper').offsetWidth;
    const scrollAmount = direction === 'left' ? -cardWidth * 0.9 : cardWidth * 0.9;
    carousel.scrollTo({
      left: carousel.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (isLite) return;

    const ctx = gsap.context(() => {
      // 1. Hero text fade-in upward
      gsap.fromTo('.lxs-hero-label', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });
      gsap.fromTo('.lxs-hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.lxs-hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 });
      gsap.fromTo('.lxs-hero-features li', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.6 });
      gsap.fromTo('.lxs-hero-ctas', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.8 });

      // 2. Timeline vertical line drawing
      const tlSection = timelineRef.current;
      if (tlSection) {
        gsap.fromTo(timelineProgressLineRef.current, 
          { scaleY: 0 }, 
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: tlSection,
              start: 'top 40%',
              end: 'bottom 60%',
              scrub: true
            }
          }
        );

        // Highlight milestones on scroll
        gsap.utils.toArray('.lxs-timeline-step').forEach((step) => {
          gsap.fromTo(step, 
            { opacity: 0.2, filter: 'blur(3px)', scale: 0.95 },
            {
              opacity: 1,
              filter: 'blur(0px)',
              scale: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 70%',
                end: 'top 35%',
                toggleActions: 'play reverse play reverse'
              }
            }
          );
        });
      }

      // 3. Why Choose Us Alternating reveal
      gsap.utils.toArray('.lxs-why-row').forEach((row) => {
        const textCol = row.querySelector('.lxs-why-text-col');
        const imgCol = row.querySelector('.lxs-why-img-col');
        
        gsap.fromTo(textCol, 
          { opacity: 0, x: -30 }, 
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 75%',
              once: true
            }
          }
        );

        gsap.fromTo(imgCol, 
          { opacity: 0, scale: 0.92, filter: 'blur(10px)' }, 
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 70%',
              once: true
            }
          }
        );
      });

      // 4. Comparison columns reveal
      gsap.fromTo('.lxs-comp-panel--us', 
        { opacity: 0, x: -50, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.lxs-comp-grid',
            start: 'top 75%',
            once: true
          }
        }
      );
      gsap.fromTo('.lxs-comp-panel--them', 
        { opacity: 0, x: 50, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.lxs-comp-grid',
            start: 'top 75%',
            once: true
          }
        }
      );

      // 5. Pricing Philosophy Underline
      gsap.fromTo('.lxs-phil-underline', 
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: '.lxs-phil-title',
            start: 'top 80%',
            once: true
          }
        }
      );

      // 6. Configurator Card count-ups when active
      gsap.fromTo('.lxs-configurator-box', 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.lxs-configurator-box',
            start: 'top 80%',
            once: true
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="services-page" ref={pageRef} onMouseMove={handleMouseMoveGlobal} className="lxs-wrapper">
      
      {/* Cinematic Ambient Lighting (Dynamic Follower) */}
      {!isLite && (
        <div 
          className="lxs-ambient-light" 
          style={{
            transform: `translate3d(${mousePos.x - 300}px, ${mousePos.y - 300}px, 0)`,
            transition: 'transform 0.15s cubic-bezier(0.1, 0.8, 0.3, 1)'
          }}
        />
      )}
      <div className="lxs-ambient-light-static" />

      <div className="container lxs-container">
        
        {/* Floating Status Badge (Capsule watch-style) */}
        <div className="lxs-badge-container">
          <div className="lxs-status-badge">
            <span className="lxs-status-dot"></span>
            <span className="lxs-status-text">Only 2 Build Slots Left This Month</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="lxs-hero">
          <div className="lxs-hero-content">
            <span className="lxs-hero-label">TAILORED DIGITAL SYSTEMS</span>
            <h1 className="lxs-hero-title">
              Every Business Deserves <br className="desktop-break" />
              a <span className="lxs-text-gold">Custom Engine.</span>
            </h1>
            <p className="lxs-hero-desc">
              We design and code bespoke digital infrastructure that eliminates middle managers, replaces rigid retainers, and loads at peak velocities.
            </p>
            
            <ul className="lxs-hero-features">
              <li><span className="lxs-gold-check">✓</span> Free Live Demo</li>
              <li><span className="lxs-gold-check">✓</span> No Contracts</li>
              <li><span className="lxs-gold-check">✓</span> Starts at $499</li>
              <li><span className="lxs-gold-check">✓</span> Built by Engineers</li>
            </ul>

            <div className="lxs-hero-ctas">
              <a 
                href="#demo" 
                onClick={(e) => { e.preventDefault(); onViewChange('demo'); }} 
                className="lxs-btn lxs-btn--primary"
              >
                Book Free Strategy Call
                <ArrowRight size={14} className="lxs-arrow-slide" />
              </a>
              <a 
                href="#demo" 
                onClick={(e) => { e.preventDefault(); onViewChange('demo'); }} 
                className="lxs-btn lxs-btn--secondary"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </section>

        {/* SERVICES HORIZONTAL SNAP CAROUSEL */}
        <section className="lxs-carousel-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">CAPABILITIES</span>
            <h2 className="lxs-section-title">Crafted Without Compromise</h2>
            <p className="lxs-section-subtitle">
              Drag or swipe through our core capabilities. Every system is machined from clean code, fully bespoke, and hosted on premium edge networks.
            </p>
          </div>

          {/* Carousel Arrows (Desktop only) */}
          <div className="lxs-carousel-controls">
            <button className="lxs-carousel-arrow" onClick={() => scrollCarousel('left')} aria-label="Scroll left">
              <ChevronLeft size={16} />
            </button>
            <button className="lxs-carousel-arrow" onClick={() => scrollCarousel('right')} aria-label="Scroll right">
              <ChevronRight size={16} />
            </button>
          </div>

          <div 
            className={`lxs-carousel-track ${isDragging ? 'dragging' : ''}`}
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {serviceCategories.map((service, idx) => {
              const IconComponent = service.icon;
              return (
                <div key={idx} className="lxs-card-wrapper">
                  <article 
                    className="lxs-card"
                    style={{
                      transform: isDragging ? `rotateY(${tiltAngle}deg) scale(0.99)` : 'none',
                      transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease'
                    }}
                  >
                    <div className="lxs-card-noise" />
                    
                    <div className="lxs-card-header">
                      <div className="lxs-card-icon-wrap">
                        <IconComponent className="lxs-card-icon" size={28} strokeWidth={1} />
                      </div>
                      <span className="lxs-card-tag">{service.tag}</span>
                    </div>

                    <h3 className="lxs-card-title">{service.title}</h3>
                    <p className="lxs-card-desc">{service.description}</p>
                    
                    <ul className="lxs-card-bullets">
                      {service.subServices.slice(0, 3).map((sub, i) => (
                        <li key={i}>
                          <span className="lxs-bullet-dot"></span>
                          {sub}
                        </li>
                      ))}
                    </ul>

                    <div className="lxs-card-footer">
                      <div className="lxs-card-scope">
                        <span className="lxs-scope-label">PROJECT SCOPE</span>
                        <span className="lxs-scope-price">Starts from ${service.price}</span>
                      </div>
                      <button 
                        className="lxs-card-btn" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedServices([idx]); 
                          document.getElementById('configurator-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        aria-label="Configure this service"
                      >
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

          <div className="lxs-carousel-indicator-bar">
            <div className="lxs-carousel-indicator-progress" />
          </div>
        </section>

        {/* INTERACTIVE PRICING (Tesla Configurator Style) */}
        <section id="configurator-section" className="lxs-configurator-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">CONFIGURATOR</span>
            <h2 className="lxs-section-title">Design Your Custom Engine</h2>
            <p className="lxs-section-subtitle">
              Select the capabilities required to accelerate your business. Combine 2 or more systems to automatically unlock a 20% bundle discount.
            </p>
          </div>

          <div className="lxs-configurator-box">
            
            {/* Left: Tesla-style Selector Pills */}
            <div className="lxs-configurator-selector">
              <span className="lxs-config-label">BUILD OPTIONS</span>
              <div className="lxs-configurator-list">
                {serviceCategories.map((service, idx) => {
                  const Icon = service.icon;
                  const isSelected = selectedServices.includes(idx);
                  return (
                    <button
                      key={idx}
                      className={`lxs-configurator-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleServiceSelection(idx)}
                    >
                      <div className="lxs-pill-check">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <Icon size={16} strokeWidth={1.5} className="lxs-pill-icon" />
                      <div className="lxs-pill-info">
                        <span className="lxs-pill-name">{service.title}</span>
                        <span className="lxs-pill-price">+${service.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Premium Summary Card */}
            <div className="lxs-configurator-summary">
              <div className="lxs-summary-top">
                <span className="lxs-config-label">ENGINE SPECIFICATION</span>
                <h3 className="lxs-summary-title">Selected Modules</h3>
                
                <ul className="lxs-summary-list">
                  {selectedServices.map(idx => (
                    <li key={idx} className="lxs-summary-item">
                      <span className="lxs-summary-item-name">{serviceCategories[idx].title}</span>
                      <span className="lxs-summary-item-price">${serviceCategories[idx].price} USD</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lxs-summary-bottom">
                
                {/* Timeline Configurator Stats */}
                <div className="lxs-summary-meta">
                  <div className="lxs-meta-col">
                    <span className="lxs-meta-label">Timeline</span>
                    <span className="lxs-meta-val">
                      {selectedServices.length <= 1 ? '3-5 Days' : selectedServices.length <= 3 ? '1-2 Weeks' : '2-3 Weeks'}
                    </span>
                  </div>
                  <div className="lxs-meta-col">
                    <span className="lxs-meta-label">Est. Delivery</span>
                    <span className="lxs-meta-val">
                      {new Date(Date.now() + (selectedServices.length <= 1 ? 5 : selectedServices.length <= 3 ? 12 : 20) * 24 * 60 * 60 * 1000).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {hasDiscount && (
                  <div className="lxs-discount-badge">
                    <Sparkles size={11} className="lxs-sparkle-spin" />
                    <span>20% Bundle Discount Applied (-${discountAmount} USD)</span>
                  </div>
                )}

                <div className="lxs-total-section">
                  <span className="lxs-total-label">Estimated Build Total</span>
                  <div className="lxs-total-price">
                    <span className="lxs-price-currency">$</span>
                    <span className="lxs-price-val">{displayedPrice}</span>
                    <span className="lxs-price-suffix">USD / starting</span>
                  </div>
                </div>

                <button onClick={handleClaimProposal} className="lxs-btn lxs-btn--primary lxs-btn--full">
                  Get My Custom Proposal
                  <ArrowRight size={14} />
                </button>
                <span className="lxs-summary-footer-text">
                  *Completely custom scoped. No contracts. 100% money-back guarantee.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* PRICING PHILOSOPHY Centered Statement */}
        <section className="lxs-philosophy-section">
          <div className="lxs-philosophy-box">
            <h2 className="lxs-phil-title">
              "You only pay for what creates value."
              <span className="lxs-phil-underline" />
            </h2>
            <p className="lxs-phil-text">
              We eliminate bloated overhead, middle management telephone tags, and monthly retainer chains. Premium software engineering, flat-rates, direct access, complete transparency.
            </p>
          </div>
        </section>

        {/* COMPARISON SECTION (OddWebs vs Traditional Agency) */}
        <section className="lxs-comparison-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">SMART CONTRAST</span>
            <h2 className="lxs-section-title">OD Model vs Traditional Agencies</h2>
            <p className="lxs-section-subtitle">
              We engineered a production model that favors builders over managers. No upfront risk. No retainer chains. Just pure velocity.
            </p>
          </div>

          <div className="lxs-comp-grid">
            
            {/* Left: OddWebs (Emerald Panel) */}
            <div className="lxs-comp-panel lxs-comp-panel--us">
              <div className="lxs-comp-panel-glow" />
              <div className="lxs-comp-panel-header">
                <span className="lxs-comp-panel-label">ODDWEBS WORKFLOW</span>
                <h3 className="lxs-comp-panel-title">Crafted Architecture</h3>
              </div>
              <ul className="lxs-comp-list">
                {comparisonData.map((data, idx) => (
                  <li key={idx} className="lxs-comp-item">
                    <div className="lxs-comp-item-header">
                      <span className="lxs-comp-num">{data.metric}</span>
                      <div className="lxs-comp-check-icon success">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="lxs-comp-feature-name">{data.feature}</span>
                    </div>
                    <div className="lxs-comp-item-content">
                      <span className="lxs-comp-highlight success">{data.usVal}</span>
                      <p className="lxs-comp-desc" dangerouslySetInnerHTML={{ __html: data.usDesc }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Traditional Agency (Crimson Panel) */}
            <div className="lxs-comp-panel lxs-comp-panel--them">
              <div className="lxs-comp-panel-header">
                <span className="lxs-comp-panel-label">TRADITIONAL AGENCY</span>
                <h3 className="lxs-comp-panel-title">Legacy Bureaucracy</h3>
              </div>
              <ul className="lxs-comp-list">
                {comparisonData.map((data, idx) => (
                  <li key={idx} className="lxs-comp-item">
                    <div className="lxs-comp-item-header">
                      <span className="lxs-comp-num">{data.metric}</span>
                      <div className="lxs-comp-check-icon failure">
                        <AlertCircle size={10} strokeWidth={2.5} />
                      </div>
                      <span className="lxs-comp-feature-name">{data.feature}</span>
                    </div>
                    <div className="lxs-comp-item-content">
                      <span className="lxs-comp-highlight failure">{data.themVal}</span>
                      <p className="lxs-comp-desc" dangerouslySetInnerHTML={{ __html: data.themDesc }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* TIMELINE SECTION (Vertical Roadmap) */}
        <section ref={timelineRef} className="lxs-timeline-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">ROADMAP</span>
            <h2 className="lxs-section-title">The Engineering Cycle</h2>
            <p className="lxs-section-subtitle">
              How we take your system from conception to deployment. A modular timeline designed to avoid red tape and optimize velocity.
            </p>
          </div>

          <div className="lxs-timeline-wrapper">
            {/* Connected glowing vertical line */}
            <div className="lxs-timeline-line">
              <div className="lxs-timeline-line-background" />
              <div ref={timelineProgressLineRef} className="lxs-timeline-line-progress" />
            </div>

            <div className="lxs-timeline-steps">
              
              <div className="lxs-timeline-step">
                <div className="lxs-timeline-step-indicator">
                  <div className="lxs-timeline-step-dot" />
                  <span className="lxs-timeline-step-num">01</span>
                </div>
                <div className="lxs-timeline-step-content">
                  <h3 className="lxs-timeline-step-title">Discovery & Strategy</h3>
                  <p className="lxs-timeline-step-desc">
                    We hop on a 20-minute strategy call to align on your technical specifications. No sales pitches, just developers assessing your architecture.
                  </p>
                </div>
              </div>

              <div className="lxs-timeline-step">
                <div className="lxs-timeline-step-indicator">
                  <div className="lxs-timeline-step-dot" />
                  <span className="lxs-timeline-step-num">02</span>
                </div>
                <div className="lxs-timeline-step-content">
                  <h3 className="lxs-timeline-step-title">Free Custom Homepage Demo</h3>
                  <p className="lxs-timeline-step-desc">
                    We design and develop a fully functioning, custom homepage mockup completely free of charge. Experience your layout before committing a single cent.
                  </p>
                </div>
              </div>

              <div className="lxs-timeline-step">
                <div className="lxs-timeline-step-indicator">
                  <div className="lxs-timeline-step-dot" />
                  <span className="lxs-timeline-step-num">03</span>
                </div>
                <div className="lxs-timeline-step-content">
                  <h3 className="lxs-timeline-step-title">Refinements & Feedback</h3>
                  <p className="lxs-timeline-step-desc">
                    We jump in a shared channel (Slack/WhatsApp) to rapidly tune details, typography, colors, and layout animations to absolute perfection.
                  </p>
                </div>
              </div>

              <div className="lxs-timeline-step">
                <div className="lxs-timeline-step-indicator">
                  <div className="lxs-timeline-step-dot" />
                  <span className="lxs-timeline-step-num">04</span>
                </div>
                <div className="lxs-timeline-step-content">
                  <h3 className="lxs-timeline-step-title">Custom Development</h3>
                  <p className="lxs-timeline-step-desc">
                    Our team custom-codes the rest of your system page-by-page. Zero templates, pure responsive component architecture, optimized for SEO speed metrics.
                  </p>
                </div>
              </div>

              <div className="lxs-timeline-step">
                <div className="lxs-timeline-step-indicator">
                  <div className="lxs-timeline-step-dot" />
                  <span className="lxs-timeline-step-num">05</span>
                </div>
                <div className="lxs-timeline-step-content">
                  <h3 className="lxs-timeline-step-title">Launch & Handover</h3>
                  <p className="lxs-timeline-step-desc">
                    We deploy your custom engine onto high-speed edge environments. 100% code buyout option completes. Secure, lightning fast, and built to rank.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WHY CHOOSE US (Alternating Timeline with Luxury Images) */}
        <section className="lxs-why-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">OUR ETHOS</span>
            <h2 className="lxs-section-title">Built for the Details</h2>
            <p className="lxs-section-subtitle">
              We construct digital systems for brands who demand perfection. If you obsess over design, performance, and clear communication—we are your partners.
            </p>
          </div>

          <div className="lxs-why-rows">
            
            {/* Alternating Row 1 */}
            <div className="lxs-why-row">
              <div className="lxs-why-text-col">
                <span className="lxs-why-num">01</span>
                <h3 className="lxs-why-title">High-End Engineering</h3>
                <p className="lxs-why-desc">
                  Every pixel is placed intentionally. Our digital designs marry editorial serif typography with ultra-fast modern JS architectures. The result is a custom engine that feels as heavy, premium, and refined as a luxury watch dial.
                </p>
              </div>
              <div className="lxs-why-img-col">
                <div className="lxs-img-frame">
                  <img src="/custom_engine_concept.jpg" alt="Luxury Technology Cybernetic Engine Concept" className="lxs-why-img" loading="lazy" />
                  <div className="lxs-img-reflection" />
                  <div className="lxs-img-border" />
                </div>
              </div>
            </div>

            {/* Alternating Row 2 */}
            <div className="lxs-why-row lxs-why-row--reverse">
              <div className="lxs-why-text-col">
                <span className="lxs-why-num">02</span>
                <h3 className="lxs-why-title">Mobile-First Obsession</h3>
                <p className="lxs-why-desc">
                  We optimize every element for premium, one-handed mobile layouts. Comfortable touch zones, generous breathing margins, and 60fps physics-based animations ensure a smooth, tactile experience across any screen.
                </p>
              </div>
              <div className="lxs-why-img-col">
                <div className="lxs-img-frame">
                  <img src="/luxury_mobile_ui.jpg" alt="Premium Mobile Dashboard Interface Concept" className="lxs-why-img" loading="lazy" />
                  <div className="lxs-img-reflection" />
                  <div className="lxs-img-border" />
                </div>
              </div>
            </div>

            {/* Alternating Row 3 */}
            <div className="lxs-why-row">
              <div className="lxs-why-text-col">
                <span className="lxs-why-num">03</span>
                <h3 className="lxs-why-title">Radical Transparency</h3>
                <p className="lxs-why-desc">
                  No account managers playing telephone. No hidden markup fees. You collaborate directly in private Slack channels with the software engineers writing your code, keeping project updates instantaneous and accurate.
                </p>
              </div>
              <div className="lxs-why-img-col">
                <div className="lxs-img-frame">
                  <img src="/luxury_analytics_ui.jpg" alt="Premium Custom Analytics Interface Panel" className="lxs-why-img" loading="lazy" />
                  <div className="lxs-img-reflection" />
                  <div className="lxs-img-border" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="lxs-bottom-cta">
          <div className="lxs-bottom-box">
            <span className="lxs-bottom-label">GET STARTED</span>
            <h2 className="lxs-bottom-title">Build Your Custom Engine.</h2>
            <p className="lxs-bottom-sub">
              Claim your free roadmap design. We'll map out your custom digital structure and deliver a fully custom homepage demo within days, completely free.
            </p>
            <div className="lxs-bottom-ctas">
              <button 
                onClick={() => onViewChange('demo')} 
                className="lxs-btn lxs-btn--primary magnetic"
                style={{ padding: '16px 36px', fontSize: '0.95rem' }}
              >
                Book Free Strategy Call
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* STICKY BOTTOM CALL TO ACTION (Fades in after 40% scroll depth) */}
      <div className={`lxs-sticky-cta ${showStickyCta ? 'visible' : ''}`}>
        <div className="lxs-sticky-content">
          <span className="lxs-sticky-dot" />
          <span className="lxs-sticky-text">Custom Roadmap Starts at $499</span>
          <button 
            onClick={() => onViewChange('demo')} 
            className="lxs-sticky-btn"
          >
            Claim Free Demo
            <ArrowRight size={11} />
          </button>
        </div>
      </div>

    </div>
  );
}
