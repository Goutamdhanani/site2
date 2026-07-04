import { useEffect, useRef, useState, useMemo } from 'react';
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
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Zap,
  DollarSign,
  Clock,
  HelpCircle
} from 'lucide-react';
import { isLite } from '../utils/device';
import { trackEvent, trackCTA } from '../utils/analytics';

gsap.registerPlugin(ScrollTrigger);

const serviceCategories = [
  {
    title: 'Full Website Redesign',
    tag: 'CORE PLATFORM',
    price: 3500,
    icon: Layers,
    description: 'Custom-coded React & Next.js architectures built for SMBs, contractors, medical clinics, and professional practices. Designed for high conversion, sub-500ms load speeds, and absolute authority.',
    subServices: [
      'Full Website Redesign (from $3,500)',
      'Homepage Redesign (from $1,200)',
      'Premium Landing Page (from $650)',
      'CMS / Headless CMS ($950–$2,000)',
      'Speed & Core Web Vitals ($450–$750)'
    ]
  },
  {
    title: 'AI & Automation Systems',
    tag: 'HIGH PROFIT / INTELLIGENCE',
    price: 2000,
    icon: Cpu,
    description: 'Integrate artificial intelligence directly into your daily operations. Build autonomous customer support agents, lead qualification bots, and automated CRM workflows that save hundreds of hours.',
    subServices: [
      'AI Workflow & CRM Automation ($2,000)',
      'AI Lead Qualification Bot ($2,000)',
      'AI Customer Support Assistant ($2,500)',
      'AI Voice Receptionist ($4,500)',
      'AI Appointment Booking Assistant ($1,800)'
    ]
  },
  {
    title: 'Technical & Local SEO',
    tag: 'TRAFFIC & SEARCH',
    price: 650,
    icon: Search,
    description: 'Dominate Google local search rankings and AI search engines. Technical audits, local map pack optimization, schema architecture, and Google Business profile authority.',
    subServices: [
      'Technical SEO Setup ($650)',
      'Local SEO Setup ($550)',
      'Google Business Profile Setup ($250)',
      'Google Analytics 4 + Search Console ($200)',
      'Core Web Vitals Optimization ($750)'
    ]
  },
  {
    title: 'Brand Identity & Design',
    tag: 'VISUAL SYSTEM',
    price: 2000,
    icon: Award,
    description: 'Establish absolute trust and prestige. Editorial logo design, curated typography, brand guidelines, and complete visual systems that command premium prices.',
    subServices: [
      'Complete Brand Identity ($2,000)',
      'Logo Design ($650)',
      'Brand Guidelines ($1,000)',
      'Social Media Kit ($450)',
      'Business Card & Media ($200)'
    ]
  },
  {
    title: 'E-Commerce Store',
    tag: 'DIGITAL STOREFRONT',
    price: 3500,
    icon: Globe,
    description: 'High-converting online store built for speed and seamless checkout. Supports up to 50 initial products with integrated payment gateways and inventory management.',
    subServices: [
      'E-Commerce Store (≤50 Products) ($3,500)',
      'Every Additional 100 Products ($750)',
      'Stripe & Square Integration ($450)',
      'Payment Gateway Integration ($450)'
    ]
  },
  {
    title: 'Conversion Copywriting',
    tag: 'NARRATIVE',
    price: 600,
    icon: Edit3,
    description: 'Copywriting that commands attention. Technical storytelling, high-converting section copy, and brand voice architecture tailored for your target market.',
    subServices: [
      'High-Conversion Website Copy',
      'Technical Product Copywriting ($120/sec)',
      'SEO Authority Articles',
      'Brand Messaging & Voice Guidelines'
    ]
  },
  {
    title: 'Monthly Growth & Care Plans',
    tag: 'RECURRING CARE',
    price: 179,
    icon: TrendingUp,
    description: 'Continuous optimization, security updates, uptime surveillance, backups, and priority engineer support to keep your digital asset operating at peak performance.',
    subServices: [
      'Essential Care Plan ($79/mo)',
      'Growth Care Plan ($179/mo)',
      'Premium Care Plan ($349/mo)',
      'Security Updates & Backups',
      'Priority Engineer Support'
    ]
  }
];

const rateCardMatrix = {
  web: [
    { service: 'Full Website Redesign', price: '$3,500', note: 'Complete custom-coded platform' },
    { service: 'Homepage Redesign', price: '$1,200', note: 'Hero, sections, CTA overhaul' },
    { service: 'Premium Landing Page', price: '$650', note: 'High-conversion campaign page' },
    { service: 'Additional Website Page', price: '$250', note: 'Per inner page' },
    { service: 'E-Commerce Store (≤50 Products)', price: '$3,500', note: 'Full catalog & checkout' },
    { service: 'Every Additional 100 Products', price: '$750', note: 'Bulk catalog ingestion' },
    { service: 'CMS Integration', price: '$950', note: 'Sanity, Strapi, or WordPress' },
    { service: 'Headless CMS Architecture', price: '$2,000', note: 'Decoupled API platform' },
    { service: 'Client Dashboard', price: '$3,000', note: 'Custom portal & telemetry' },
    { service: 'Admin Dashboard', price: '$4,000', note: 'Full CRM & control panel' },
    { service: 'Membership Portal', price: '$2,500', note: 'Gated accounts & paywalls' },
    { service: 'Booking System', price: '$600', note: 'Calendar & slot management' },
    { service: 'Payment Gateway (Stripe/Square)', price: '$450', note: 'Secure checkout integration' },
    { service: 'Website Speed Optimization', price: '$450', note: 'Sub-500ms load tuning' },
    { service: 'Core Web Vitals Optimization', price: '$750', note: '100/100 Google lighthouse audit' },
    { service: 'Technical SEO Setup', price: '$650', note: 'Schema, sitemaps, indexing' },
    { service: 'Local SEO Setup', price: '$550', note: 'Map pack & local authority' },
    { service: 'Google Analytics + Search Console', price: '$200', note: 'GA4 + GSC configuration' },
    { service: 'Google Business Profile Setup', price: '$250', note: 'Verification & optimization' },
    { service: 'Dark Mode Support', price: '$400', note: 'Custom CSS variable toggle' }
  ],
  ai: [
    { service: 'AI Voice Receptionist', price: '$4,500', note: '24/7 automated call handler' },
    { service: 'AI Sales Chatbot', price: '$3,000', note: 'Conversational sales engine' },
    { service: 'AI Customer Support Assistant', price: '$2,500', note: 'Trained on company docs' },
    { service: 'AI Lead Qualification Bot', price: '$2,000', note: 'Qualifies & routes leads' },
    { service: 'AI Appointment Booking Assistant', price: '$1,800', note: 'Auto-books calendar slots' },
    { service: 'AI FAQ Chatbot', price: '$1,200', note: 'Answers routine questions' },
    { service: 'AI Workflow & CRM Automation', price: '$2,000', note: 'Zapier, Make, custom GPTs' },
    { service: 'CRM Automation', price: '$2,500', note: 'HubSpot, ActiveCampaign sync' },
    { service: 'WhatsApp Automation', price: '$1,800', note: 'Automated messaging flows' },
    { service: 'SMS Automation', price: '$1,200', note: 'Instant appointment alerts' },
    { service: 'Email Marketing Automation', price: '$1,500', note: 'Drip campaigns & follow-ups' },
    { service: 'Internal Business Automation', price: '$2,500–$10,000', note: 'Custom enterprise engine' }
  ],
  branding: [
    { service: 'Brand Identity System', price: '$2,000', note: 'Full visual guidelines & logo' },
    { service: 'Logo Design', price: '$650', note: 'Vector marks & lockups' },
    { service: 'Brand Guidelines Document', price: '$1,000', note: 'Typography & color rules' },
    { service: 'Social Media Kit', price: '$450', note: 'Banners, templates, icons' },
    { service: 'Copywriting (Website Sections)', price: '$120/sec', note: 'High-converting copy' },
    { service: 'Business Card Design', price: '$200', note: 'Print-ready vector cards' }
  ],
  care: [
    { service: 'Essential Care Plan', price: '$79/mo', note: 'Security, backups, performance monitoring' },
    { service: 'Growth Care Plan', price: '$179/mo', note: 'Essential + speed tuning & small edits' },
    { service: 'Premium Care Plan', price: '$349/mo', note: 'Growth + priority engineer support & AI monitoring' }
  ],
  hourly: [
    { service: 'Design Rate', price: '$90/hr', note: 'UI/UX & graphic design' },
    { service: 'Development Rate', price: '$110/hr', note: 'React, Next.js, APIs' },
    { service: 'AI Consulting Rate', price: '$150/hr', note: 'Workflow & agent architecture' },
    { service: 'Emergency Work Rate', price: '$175/hr', note: 'Immediate same-day fix' },
    { service: 'Minor Text / Image Change', price: '$40', note: 'Single text/image update' },
    { service: 'Minor Layout Adjustment', price: '$90', note: 'Spacing/mobile tweaks' },
    { service: 'New Section (Homepage / Internal)', price: '$200–$300', note: 'Custom layout section' },
    { service: 'Major Layout Revision', price: '$700', note: 'Substantial structural rewrite' },
    { service: 'Emergency Same-Day Rush Fee', price: '+$150', note: 'Added to standard rate' }
  ]
};

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
    usDesc: "Option to buy out 100% of the code for a one-time fee, or keep flexible low-cost monthly care.",
    themVal: "$1,500 - $3,000/mo Retainers",
    themDesc: "Locks you into rigid monthly retainers for hosting, simple text updates, and basic support."
  },
  {
    metric: "03",
    feature: "Overhead Costing",
    usVal: "Direct Engineer Pricing",
    usDesc: "Transparent project pricing starting at $650 for landing pages and $3,500 for full custom platforms. Every dollar goes directly into design and engineering.",
    themVal: "$15,000+ - $30,000+ Agency Bloat",
    themDesc: "Bloated agency minimums to fund sales commissions, project managers, and luxury Vancouver/Toronto office overhead."
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
  const [displayedPrice, setDisplayedPrice] = useState(3500);
  
  // Rate Card Active Tab
  const [rateCardTab, setRateCardTab] = useState('web'); // 'web', 'ai', 'branding', 'care', 'hourly'

  // Sticky CTA visibility
  const [showStickyCta, setShowStickyCta] = useState(false);

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

  const originalTotal = selectedServices.reduce((sum, idx) => sum + serviceCategories[idx].price, 0);
  const hasDiscount = selectedServices.length >= 2;
  const discountAmount = hasDiscount ? Math.round(originalTotal * 0.20) : 0;
  const finalTotal = originalTotal - discountAmount;
  const displayedPriceRef = useRef(displayedPrice);
  useEffect(() => {
    displayedPriceRef.current = displayedPrice;
  }, [displayedPrice]);

  const [baseDate] = useState(Date.now);

  const estimatedDeliveryDate = useMemo(() => {
    const daysToAdd = selectedServices.length <= 1 ? 5 : selectedServices.length <= 3 ? 12 : 20;
    return new Date(baseDate + daysToAdd * 24 * 60 * 60 * 1000).toLocaleDateString('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedServices.length, baseDate]);

  // Animated Price Counter using GSAP
  useEffect(() => {
    const obj = { value: displayedPriceRef.current };
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
    
    // Tilt calculations
    const deltaX = e.pageX - lastXRef.current;
    setTiltAngle(Math.max(-8, Math.min(8, deltaX * 0.5)));
    lastXRef.current = e.pageX;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setTiltAngle(0);
  };

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const scrollAmount = carousel.clientWidth * 0.75;
    carousel.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div ref={pageRef} className="sp-wrapper">
      
      {/* Background Ambient Lighting Container */}
      <div className="sp-bg-lighting" aria-hidden="true">
        <div 
          className="sp-ambient-cursor-glow"
          style={{
            transform: `translate3d(${mousePos.x - 300}px, ${mousePos.y - 300}px, 0)`,
          }}
        />
        <div className="sp-grid-overlay" />
      </div>

      <div className="sp-container container">
        
        {/* HERO HEADER */}
        <header className="sp-header">
          <div className="sp-header-badge">
            <Sparkles size={12} className="sp-badge-icon" />
            <span>PREMIUM CANADIAN AGENCY CAPABILITIES</span>
          </div>
          <h1 className="sp-title">
            Digital Engineering & <br />
            <span className="sp-title-gradient">AI Automation Engine</span>
          </h1>
          <p className="sp-subtitle">
            Transparent pricing for growing SMBs, medical practices, law firms, and trades. Built with high-fidelity React, Next.js, and automated workflow systems.
          </p>
        </header>

        {/* HORIZONTAL CAROUSEL SHOWCASE */}
        <section className="lxs-carousel-section">
          <div className="lxs-carousel-header">
            <div>
              <span className="lxs-eyebrow">SERVICES & PLATFORMS</span>
              <h2 className="lxs-section-title">Core Capability Modules</h2>
            </div>
            
            <div className="lxs-carousel-nav">
              <button 
                onClick={() => scrollCarousel('left')} 
                className="lxs-nav-btn"
                aria-label="Previous service"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel('right')} 
                className="lxs-nav-btn"
                aria-label="Next service"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div 
            ref={carouselRef}
            className={`lxs-carousel-track ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {serviceCategories.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="lxs-carousel-slide">
                  <article 
                    className="lxs-card"
                    style={{
                      transform: isDragging ? `rotateY(${tiltAngle}deg) scale(0.99)` : 'none',
                    }}
                  >
                    <div className="lxs-card-top">
                      <span className="lxs-card-tag">{service.tag}</span>
                      <div className="lxs-card-icon-wrap">
                        <Icon size={20} strokeWidth={1.5} className="lxs-card-icon" />
                      </div>
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
                        <span className="lxs-scope-label">STARTING PRICE</span>
                        <span className="lxs-scope-price">From ${service.price} USD</span>
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

        {/* INTERACTIVE PRICING BUNDLE BUILDER (Tesla Configurator Style) */}
        <section id="configurator-section" className="lxs-configurator-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">INTERACTIVE CONFIGURATOR</span>
            <h2 className="lxs-section-title">Design Your Custom Engine</h2>
            <p className="lxs-section-subtitle">
              Select the capabilities required to accelerate your business. Combine 2 or more systems to automatically unlock a 20% bundle discount.
            </p>
          </div>

          <div className="lxs-configurator-box">
            
            {/* Left: Selector Pills */}
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
                        <span className="lxs-pill-price">From +${service.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Summary Card */}
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
                      {estimatedDeliveryDate}
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
                  *Completely custom scoped. Transparent pricing. 100% Free Live Demo.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* FULL AGENCY SERVICE RATE CARD & MATRIX */}
        <section className="lxs-ratecard-section" style={{ margin: '120px 0' }}>
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">TRANSPARENT PRICING MATRIX</span>
            <h2 className="lxs-section-title">Itemized Service Rate Card</h2>
            <p className="lxs-section-subtitle">
              Fair, upfront pricing tailored for Canadian small and medium businesses, medical clinics, trades, and professional practices.
            </p>
          </div>

          {/* Rate Card Tabs */}
          <div className="lxs-rate-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {[
              { id: 'web', label: 'Web Architecture' },
              { id: 'ai', label: 'AI & Automation (Highest ROI)' },
              { id: 'branding', label: 'Branding & Copywriting' },
              { id: 'care', label: 'Monthly Care Plans' },
              { id: 'hourly', label: 'Hourly Rates & Edits' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRateCardTab(tab.id)}
                className={`lxs-btn ${rateCardTab === tab.id ? 'lxs-btn--primary' : 'lxs-btn--ghost'}`}
                style={{ padding: '10px 18px', fontSize: '12px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rate Matrix Table Container */}
          <div className="lxs-rate-matrix-box" style={{ background: 'rgba(13, 10, 9, 0.6)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '32px', backdropFilter: 'blur(16px)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    <th style={{ padding: '12px 16px' }}>SERVICE / CAPABILITY</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>PRICE (USD)</th>
                    <th style={{ padding: '12px 16px' }}>SCOPE DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {rateCardMatrix[rateCardTab].map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s ease' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {item.service}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-gold)', fontSize: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {item.price}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                * All rates in USD. Customized enterprise scopes available upon request.
              </span>
              <button onClick={() => onViewChange('demo')} className="lxs-btn lxs-btn--primary" style={{ padding: '8px 18px', fontSize: '11px' }}>
                Request Custom Proposal ↗
              </button>
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
              We eliminate traditional agency bloat. No account managers playing telephone, no expensive office minimums. Direct software engineering flat-rates starting from $650 for landing pages and $3,500 for full custom platforms.
            </p>
          </div>
        </section>

        {/* COMPARISON MATRIX TABLE */}
        <section className="lxs-comparison-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">TRANSPARENCY</span>
            <h2 className="lxs-section-title">The OddWebs Advantage</h2>
          </div>

          <div className="lxs-comparison-grid">
            {comparisonData.map((item, idx) => (
              <div key={idx} className="lxs-comp-card">
                <div className="lxs-comp-header">
                  <span className="lxs-comp-num">{item.metric}</span>
                  <h3 className="lxs-comp-feature">{item.feature}</h3>
                </div>

                <div className="lxs-comp-body">
                  <div className="lxs-comp-side lxs-comp-side--us">
                    <div className="lxs-side-badge">ODDWEBS</div>
                    <span className="lxs-side-val">{item.usVal}</span>
                    <p className="lxs-side-desc">{item.usDesc}</p>
                  </div>

                  <div className="lxs-comp-divider" />

                  <div className="lxs-comp-side lxs-comp-side--them">
                    <div className="lxs-side-badge lxs-side-badge--them">TRADITIONAL AGENCIES</div>
                    <span className="lxs-side-val lxs-side-val--them">{item.themVal}</span>
                    <p className="lxs-side-desc">{item.themDesc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="lxs-bottom-cta">
          <div className="lxs-bottom-box">
            <span className="lxs-bottom-label">GET STARTED</span>
            <h2 className="lxs-bottom-title">Build Your Custom Engine.</h2>
            <p className="lxs-bottom-sub">
              Claim your free roadmap design. We&apos;ll map out your custom digital structure and deliver a fully custom homepage demo within days, completely free.
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
          <span className="lxs-sticky-text">Custom Growth Packages Start at $650</span>
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
