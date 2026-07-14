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

export default function ServicesPage({ onViewChange }) {
  const pageRef = useRef(null);
  const carouselRef = useRef(null);
  
  // Region Selector State: 'us_ca' (US/Canada) or 'in' (India)
  const [region, setRegion] = useState('us_ca');
  const [detectedRegion, setDetectedRegion] = useState('us_ca');

  // Auto-detect visitor's region
  useEffect(() => {
    // 1. Lightweight detection using browser timezone (fast, offline, no latency)
    let inferredRegion = 'us_ca';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India'))) {
        inferredRegion = 'in';
      }
    } catch (e) {
      console.warn("Timezone region detection failed, defaulting to us_ca:", e);
    }
    setRegion(inferredRegion);
    setDetectedRegion(inferredRegion);

    // 2. Double-check with free geo-IP api to confirm country code
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          if (data.country_code === 'IN') {
            setRegion('in');
            setDetectedRegion('in');
          } else {
            setRegion('us_ca');
            setDetectedRegion('us_ca');
          }
        }
      })
      .catch(err => {
        console.warn("Geo-IP detection failed, using timezone fallback:", err);
      });
  }, []);

  // Carousel Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(0);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastXRef = useRef(0);

  // Configurator Selection
  const [selectedServices, setSelectedServices] = useState([1]); // Business Website selected by default (index 1)
  const [displayedPrice, setDisplayedPrice] = useState(1199);
  
  // Rate Card Active Tab
  const [rateCardTab, setRateCardTab] = useState('web'); // 'web', 'ai', 'branding', 'care', 'hourly'

  // Sticky CTA visibility
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Floating ambient lighting mouse tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Dynamic Service Categories based on active region
  const serviceCategories = useMemo(() => {
    if (region === 'us_ca') {
      return [
        {
          title: 'Starter Landing Page',
          tag: 'LANDING PAGE',
          price: 500,
          oldPrice: 1500,
          icon: Layers,
          description: 'One page. Hero, about, services, contact form, mobile optimised. Live in 5 days. Perfect for trades, solo practices, new businesses.',
          subServices: [
            'Starter Landing Page — $500',
            'Mobile optimised layout',
            'Contact form setup',
            'Live in 5 days'
          ]
        },
        {
          title: 'Business Website',
          tag: 'MOST POPULAR',
          price: 1199,
          oldPrice: 3500,
          icon: Globe,
          isPopular: true,
          description: 'Up to 5 pages. Custom designed, fast-loaded, SEO-ready. The last website you\'ll need for the next 3 years. Live in 7 days.',
          subServices: [
            'Business Website — $1,199',
            'Up to 5 pages custom design',
            'SEO-ready structure',
            'Live in 7 days'
          ]
        },
        {
          title: 'Growth Website',
          tag: 'SCALE UP',
          price: 2200,
          oldPrice: 5500,
          icon: TrendingUp,
          description: 'Up to 10 pages plus a blog, booking system, and contact automation. Built for businesses ready to scale. Live in 10 days.',
          subServices: [
            'Growth Website — $2,200',
            'Up to 10 pages + blog',
            'Booking & Contact automation',
            'Live in 10 days'
          ]
        },
        {
          title: 'E-Commerce Store',
          tag: 'DIGITAL STORE',
          price: 2500,
          oldPrice: 6500,
          icon: Award,
          description: 'Up to 50 products, Stripe or Square checkout, inventory ready. One-time fee, no monthly Shopify tax. Live in 10 days.',
          subServices: [
            'E-Commerce Store — $2,500',
            'Up to 50 products catalog',
            'Stripe/Square checkout integration',
            'No monthly platform taxes'
          ]
        },
        {
          title: 'AI & Automation Systems',
          tag: 'AI OPERATIONS',
          price: 900,
          icon: Cpu,
          description: 'Integrate artificial intelligence directly into your daily operations. Build FAQ chatbots, appointment booking assistants, and automated CRM workflows.',
          subServices: [
            'AI FAQ Chatbot ($900)',
            'AI Booking Assistant ($1,400)',
            'AI Lead Qualification Bot ($1,600)',
            'Email/WhatsApp/CRM Automation ($1,000-$1,800)'
          ]
        },
        {
          title: 'Technical & Local SEO',
          tag: 'TRAFFIC & SEARCH',
          price: 200,
          icon: Search,
          description: 'Dominate Google local search rankings and AI search engines. Technical audits, local map pack optimization, and Google Business profile authority.',
          subServices: [
            'Google Business Profile Setup ($200)',
            'Local SEO Package ($450)',
            'Technical SEO Audit + Fix ($550)',
            'Monthly Management ($299/mo)'
          ]
        },
        {
          title: 'Brand Identity & Copywriting',
          tag: 'VISUAL SYSTEM',
          price: 300,
          icon: Edit3,
          description: 'Establish absolute trust and prestige. Editorial logo design, brand guidelines, and high-converting copy copywriting package.',
          subServices: [
            'Logo Design ($350)',
            'Brand Identity ($1,200)',
            'Social Media Kit ($300)',
            'Full Website Copy Package ($500)'
          ]
        }
      ];
    } else {
      // India region (INR)
      return [
        {
          title: 'Starter Landing Page',
          tag: 'LANDING PAGE',
          price: 5000,
          oldPrice: 15000,
          icon: Layers,
          description: 'One page, fast, mobile-ready, Google-indexed. Perfect for shops, clinics, freelancers, and small businesses. Live in 5 days.',
          subServices: [
            'Starter Landing Page — ₹5,000',
            'Mobile ready layout',
            'Google indexation',
            'Live in 5 days'
          ]
        },
        {
          title: 'Business Website',
          tag: 'MOST POPULAR',
          price: 11999,
          oldPrice: 35000,
          icon: Globe,
          isPopular: true,
          description: 'Up to 5 pages, custom design, contact form, WhatsApp button, SEO setup. The website your business deserves. Live in 7 days. GST included.',
          subServices: [
            'Business Website — ₹11,999',
            'Up to 5 pages custom design',
            'WhatsApp contact button',
            'GST included'
          ]
        },
        {
          title: 'Growth Website',
          tag: 'SCALE UP',
          price: 19999,
          oldPrice: 45000,
          icon: TrendingUp,
          description: 'Up to 10 pages, blog, booking system, and lead capture automation. Built for serious businesses. Live in 10 days. GST included.',
          subServices: [
            'Growth Website — ₹19,999',
            'Up to 10 pages + blog',
            'Booking & Lead automation',
            'GST included'
          ]
        },
        {
          title: 'E-Commerce Store',
          tag: 'DIGITAL STORE',
          price: 24999,
          oldPrice: 65000,
          icon: Award,
          description: 'Up to 50 products, Razorpay or Cashfree checkout, inventory management. Your own store, no monthly commission to anyone.',
          subServices: [
            'E-Commerce Store — ₹24,999',
            'Razorpay or Cashfree checkout',
            'Inventory management',
            'No monthly commissions'
          ]
        },
        {
          title: 'AI & Automation Systems',
          tag: 'AI OPERATIONS',
          price: 25000,
          oldPrice: 60000,
          icon: Cpu,
          description: 'Integrate artificial intelligence directly into your daily operations. Build FAQ chatbots, appointment booking assistants, and automated CRM workflows.',
          subServices: [
            'AI FAQ Chatbot (₹25,000)',
            'AI Booking Assistant (₹45,000)',
            'AI Lead Qualification Bot (₹50,000)',
            'WhatsApp/CRM Automation (₹30,000-₹55,000)'
          ]
        },
        {
          title: 'Technical & Local SEO',
          tag: 'TRAFFIC & SEARCH',
          price: 1500,
          oldPrice: 4500,
          icon: Search,
          description: 'Dominate Google local search rankings and AI search engines. Technical audits, local map pack optimization, and Google Business profile authority.',
          subServices: [
            'Google Business Profile Setup (₹1,500)',
            'Local SEO Package (₹3,999)',
            'Technical SEO Setup (₹4,999)',
            'Monthly Management (₹2,499/mo)'
          ]
        },
        {
          title: 'Brand Identity & Copywriting',
          tag: 'VISUAL SYSTEM',
          price: 3000,
          oldPrice: 9000,
          icon: Edit3,
          description: 'Establish absolute trust and prestige. Editorial logo design, brand guidelines, and high-converting copy copywriting package.',
          subServices: [
            'Logo Design (₹10,000)',
            'Brand Identity (₹35,000)',
            'Social Media Kit (₹9,000)',
            'Full Website Copy Package (₹15,000)'
          ]
        }
      ];
    }
  }, [region]);

  // Dynamic Rate Card Matrix based on active region
  const rateCardMatrix = useMemo(() => {
    if (region === 'us_ca') {
      return {
        web: [
          { service: 'Starter Landing Page', price: '$500', note: 'One page custom landing page' },
          { service: 'Business Website', price: '$1,199', note: 'Up to 5 pages, custom designed' },
          { service: 'Growth Website', price: '$2,200', note: 'Up to 10 pages + blog + booking' },
          { service: 'E-Commerce Store', price: '$2,500', note: 'Up to 50 products, Stripe checkout' },
          { service: 'Additional Page', price: '$150', note: 'Per inner page' }
        ],
        ai: [
          { service: 'AI FAQ Chatbot', price: '$900', note: 'Answers routine questions' },
          { service: 'AI Appointment Booking Bot', price: '$1,400', note: 'Auto-books calendar slots' },
          { service: 'AI Lead Qualification Bot', price: '$1,600', note: 'Qualifies & routes leads' },
          { service: 'Email / WhatsApp Automation', price: '$1,000', note: 'Automated messaging flows' },
          { service: 'CRM Automation', price: '$1,800', note: 'HubSpot, ActiveCampaign sync' }
        ],
        branding: [
          { service: 'Logo Design', price: '$350', note: 'Vector marks & lockups' },
          { service: 'Brand Identity System', price: '$1,200', note: 'Full guidelines + logo + colors' },
          { service: 'Social Media Kit', price: '$300', note: 'Banners, templates, icons' },
          { service: 'Website Copywriting per section', price: '$90', note: 'High-converting copywriting' },
          { service: 'Full Website Copy Package', price: '$500', note: 'Narrative rewrite' }
        ],
        care: [
          { service: '6-Month Care Pack', price: '$249', note: 'Backups, updates, edits (Renew when ready)' },
          { service: '12-Month Care Pack', price: '$399', note: 'Backups, updates, edits + speed audit' },
          { service: 'Hosting addon (optional)', price: '$15/mo', note: 'Fully managed hosting' }
        ],
        hourly: [
          { service: 'Design Rate', price: '$70/hr', note: 'UI/UX & graphic design' },
          { service: 'Development Rate', price: '$90/hr', note: 'React, Next.js, APIs' },
          { service: 'AI Consulting Rate', price: '$110/hr', note: 'Workflow & agent architecture' },
          { service: 'Emergency Work Rate', price: '$150/hr', note: 'Immediate same-day fix' }
        ]
      };
    } else {
      return {
        web: [
          { service: 'Starter Landing Page', price: '₹5,000', note: 'One page, fast, mobile-ready' },
          { service: 'Business Website', price: '₹11,999', note: 'Up to 5 pages, WhatsApp button, GST included' },
          { service: 'Growth Website', price: '₹19,999', note: 'Up to 10 pages + blog + booking, GST included' },
          { service: 'E-Commerce Store', price: '₹24,999', note: 'Razorpay or Cashfree checkout' },
          { service: 'Additional Page', price: '₹1,500', note: 'Per inner page' }
        ],
        ai: [
          { service: 'AI FAQ Chatbot', price: '₹25,000', note: 'Answers routine questions' },
          { service: 'AI Appointment Booking Bot', price: '₹45,000', note: 'Auto-books calendar slots' },
          { service: 'AI Lead Qualification Bot', price: '₹50,000', note: 'Qualifies & routes leads' },
          { service: 'Email / WhatsApp Automation', price: '₹30,000', note: 'Automated messaging flows' },
          { service: 'CRM Automation', price: '₹55,000', note: 'HubSpot, ActiveCampaign sync' }
        ],
        branding: [
          { service: 'Logo Design', price: '₹10,000', note: 'Vector marks & lockups' },
          { service: 'Brand Identity System', price: '₹35,000', note: 'Full guidelines + logo + colors' },
          { service: 'Social Media Kit', price: '₹9,000', note: 'Banners, templates, icons' },
          { service: 'Website Copywriting per section', price: '₹3,000', note: 'High-converting copywriting' },
          { service: 'Full Website Copy Package', price: '₹15,000', note: 'Narrative rewrite' }
        ],
        care: [
          { service: 'Basic Annual Care', price: '₹3,999/yr', note: 'Backups, updates, edits (GST included)' },
          { service: 'Growth Annual Care', price: '₹7,999/yr', note: 'Basic + WhatsApp support line' },
          { service: 'Hosting (after year 1)', price: '₹3,999/yr', note: '₹399/mo (1st year free)' }
        ],
        hourly: [
          { service: 'Design Rate', price: '₹1,500/hr', note: 'UI/UX & graphic design' },
          { service: 'Development Rate', price: '₹2,000/hr', note: 'React, Next.js, APIs' },
          { service: 'AI Consulting Rate', price: '₹2,500/hr', note: 'Workflow & agent architecture' },
          { service: 'Emergency Work Rate', price: '₹3,500/hr', note: 'Immediate same-day fix' }
        ]
      };
    }
  }, [region]);

  const comparisonData = useMemo(() => {
    return [
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
        usDesc: region === 'us_ca' 
          ? "Option to buy out 100% of the code for a one-time fee, or keep flexible low-cost monthly care."
          : "Option to buy out 100% of the code for a one-time fee, or keep flexible low-cost annual care.",
        themVal: region === 'us_ca' ? "$1,500 - $3,000/mo Retainers" : "₹50,000 - ₹1,50,000/mo Retainers",
        themDesc: "Locks you into rigid monthly retainers for hosting, simple text updates, and basic support."
      },
      {
        metric: "03",
        feature: "Overhead Costing",
        usVal: "Direct Engineer Pricing",
        usDesc: region === 'us_ca'
          ? "Transparent project pricing starting at $500 for landing pages and $1,199 for full custom platforms. Every dollar goes directly into design and engineering."
          : "Transparent project pricing starting at ₹5,000 for landing pages and ₹11,999 for full custom platforms. Every rupee goes directly into design and engineering.",
        themVal: region === 'us_ca' ? "$15,000+ - $30,000+ Agency Bloat" : "₹3,00,000+ Agency Bloat",
        themDesc: "Bloated agency minimums to fund sales commissions, project managers, and luxury office overhead."
      },
      {
        metric: "04",
        feature: "Build Speed",
        usVal: "5 to 10 Days Delivery",
        usDesc: "Rapid, agile sprints delivering fully functional products weeks ahead of schedule.",
        themVal: "4 to 8 Weeks Timeline",
        themDesc: "Bogged down by red tape, corporate account managers, and endless briefing loops."
      }
    ];
  }, [region]);

  // Reset/recalculate pricing on region change
  useEffect(() => {
    // Reset selection to Business Website when region changes
    setSelectedServices([1]);
  }, [region]);

  // Floating Navigation floating styling on mount
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
    sessionStorage.setItem('selected_region', region);
    
    trackCTA('claim_proposal', 'click', {
      selected_services: mappedServices,
      total_price: finalTotal,
      discount_applied: hasDiscount,
      region: region
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
    <div ref={pageRef} className="sp-wrapper" onMouseMove={(e) => {
      if (!isLite) {
        const rect = pageRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }}>
      
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
            <span>
              {region === 'us_ca' 
                ? 'PREMIUM CANADIAN AGENCY CAPABILITIES' 
                : 'BUILT BY INDIAN ENGINEERS, FOR INDIAN BUSINESSES'}
            </span>
          </div>
          <h1 className="sp-title">
            Digital Engineering & <br />
            <span className="sp-title-gradient">AI Automation Engine</span>
          </h1>
          <p className="sp-subtitle">
            {region === 'us_ca'
              ? 'Transparent pricing for growing SMBs, medical practices, law firms, and trades. Built with high-fidelity React, Next.js, and automated workflow systems.'
              : 'Fast, modern, Google-friendly websites. No hidden charges. Transparent pricing for growing businesses, shops, clinics, and freelancers.'}
          </p>

          {/* Region Selector tabs: Only visible if Indian region is auto-detected to prevent US/Canada visitors from seeing/switching */}
          {detectedRegion === 'in' && (
            <div className="sp-region-switcher" style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <div style={{
                background: 'rgba(21, 17, 15, 0.6)',
                border: '1px solid var(--border)',
                borderRadius: '100px',
                padding: '4px',
                display: 'flex',
                gap: '4px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
              }}>
                <button
                  onClick={() => setRegion('us_ca')}
                  className={`lxs-btn ${region === 'us_ca' ? 'lxs-btn--primary' : 'lxs-btn--ghost'}`}
                  style={{ padding: '8px 20px', fontSize: '12px', border: 'none', background: region === 'us_ca' ? '' : 'transparent', color: region === 'us_ca' ? '#070707' : 'var(--text-secondary)' }}
                >
                  🇺🇸🇨🇦 US / Canada (USD)
                </button>
                <button
                  onClick={() => setRegion('in')}
                  className={`lxs-btn ${region === 'in' ? 'lxs-btn--primary' : 'lxs-btn--ghost'}`}
                  style={{ padding: '8px 20px', fontSize: '12px', border: 'none', background: region === 'in' ? '' : 'transparent', color: region === 'in' ? '#070707' : 'var(--text-secondary)' }}
                >
                  🇮🇳 India (INR)
                </button>
              </div>
            </div>
          )}

          {region === 'in' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
              <a
                href="https://wa.me/919024378271?text=Hi%20OddWebs%2C%20I%20am%20interested%20in%20a%20website%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                className="lxs-btn"
                style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', fontSize: '13px', padding: '10px 24px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.023-5.09-2.885-6.954C16.59 1.958 14.13 1.95 11.517 1.95c-5.438 0-9.863 4.413-9.866 9.831 0 1.77.472 3.5 1.365 5.03L2.094 21.75l5.09-1.332zM17.487 14.4c-.299-.149-1.778-.875-2.053-.974-.275-.099-.475-.149-.675.15-.2.299-.775.974-.95 1.174-.175.199-.35.224-.65.074-1.122-.56-2.127-1.127-2.92-1.815-.615-.533-1.012-1.186-1.132-1.393-.12-.207-.013-.319.107-.439.108-.108.225-.262.337-.393.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.413-.056-.131-.475-1.136-.65-1.56-.17-.411-.344-.356-.475-.362-.122-.005-.262-.006-.401-.006-.14 0-.367.052-.56.262-.193.21-1.378 1.348-1.378 3.288 0 1.94 1.412 3.815 1.612 4.077.2.262 2.78 4.248 6.732 5.952.94.406 1.674.647 2.247.829.945.3 1.806.258 2.486.156.758-.113 2.278-.93 2.597-1.785.319-.855.319-1.587.225-1.785-.095-.199-.35-.299-.65-.449z"/>
                </svg>
                WhatsApp Inquiry
              </a>
            </div>
          )}
        </header>

        {/* HORIZONTAL CAROUSEL SHOWCASE */}
        <section className="lxs-carousel-section">
          <div className="lxs-carousel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
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
              const hasOldPrice = service.oldPrice !== undefined;
              const isPopular = service.isPopular;
              return (
                <div key={idx} className="lxs-carousel-slide" style={{ flex: '0 0 380px', scrollSnapAlign: 'center' }}>
                  <article 
                    className="lxs-card"
                    style={{
                      transform: isDragging ? `rotateY(${tiltAngle}deg) scale(0.99)` : 'none',
                      border: isPopular ? '1px solid var(--lxs-gold)' : '1px solid var(--lxs-border-thin)'
                    }}
                  >
                    {isPopular && (
                      <div className="lxs-popular-badge" style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'linear-gradient(135deg, var(--lxs-gold) 0%, #aa8037 100%)',
                        color: '#070707',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '100px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        zIndex: 10
                      }}>
                        Most Popular
                      </div>
                    )}
                    <div className="lxs-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                      <span className="lxs-card-tag">{service.tag}</span>
                      <div className="lxs-card-icon-wrap">
                        <Icon size={20} strokeWidth={1.5} className="lxs-card-icon" />
                      </div>
                    </div>

                    <h3 className="lxs-card-title">{service.title}</h3>
                    <p className="lxs-card-desc">{service.description}</p>
                    
                    <ul className="lxs-card-bullets" style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                      {service.subServices.map((sub, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'rgba(247, 245, 252, 0.7)' }}>
                          <span className="lxs-bullet-dot"></span>
                          {sub}
                        </li>
                      ))}
                    </ul>

                    {/* Money framing line for Business Website */}
                    {isPopular && region === 'us_ca' && (
                      <p style={{ fontSize: '11px', color: 'var(--lxs-gold)', fontStyle: 'italic', marginBottom: '16px', opacity: 0.9 }}>
                        * Less than one month of a traditional agency retainer. You own it forever.
                      </p>
                    )}

                    <div className="lxs-card-footer">
                      <div className="lxs-card-scope">
                        <span className="lxs-scope-label">STARTING PRICE</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          {hasOldPrice && (
                            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.3)' }}>
                              {region === 'us_ca' ? '$' : '₹'}{service.oldPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          <span className="lxs-scope-price" style={{ color: 'var(--lxs-gold)', fontWeight: 700 }}>
                            {region === 'us_ca' ? '$' : '₹'}{service.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {region === 'in' && (
                          <span style={{ fontSize: '9px', color: 'var(--lxs-mint)', fontWeight: 600 }}>No hidden charges • GST Included</span>
                        )}
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
                        <span className="lxs-pill-price">From +{region === 'us_ca' ? '$' : '₹'}{service.price.toLocaleString('en-IN')}</span>
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
                      <span className="lxs-summary-item-price">{region === 'us_ca' ? '$' : '₹'}{serviceCategories[idx].price.toLocaleString('en-IN')} {region === 'us_ca' ? 'USD' : 'INR'}</span>
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
                    <span>20% Bundle Discount Applied (-{region === 'us_ca' ? '$' : '₹'}{discountAmount.toLocaleString('en-IN')} {region === 'us_ca' ? 'USD' : 'INR'})</span>
                  </div>
                )}

                <div className="lxs-total-section">
                  <span className="lxs-total-label">Estimated Build Total</span>
                  <div className="lxs-total-price">
                    <span className="lxs-price-currency">{region === 'us_ca' ? '$' : '₹'}</span>
                    <span className="lxs-price-val">{displayedPrice.toLocaleString('en-IN')}</span>
                    <span className="lxs-price-suffix">{region === 'us_ca' ? 'USD' : 'INR'} / starting</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  {region === 'in' && (
                    <a 
                      href="https://wa.me/919024378271?text=Hi%20OddWebs%2C%20I%20want%20to%20get%20started%20with%20custom%20modules." 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="lxs-btn" 
                      style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', width: '100%', padding: '14px 20px', fontSize: '13px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.023-5.09-2.885-6.954C16.59 1.958 14.13 1.95 11.517 1.95c-5.438 0-9.863 4.413-9.866 9.831 0 1.77.472 3.5 1.365 5.03L2.094 21.75l5.09-1.332zM17.487 14.4c-.299-.149-1.778-.875-2.053-.974-.275-.099-.475-.149-.675.15-.2.299-.775.974-.95 1.174-.175.199-.35.224-.65.074-1.122-.56-2.127-1.127-2.92-1.815-.615-.533-1.012-1.186-1.132-1.393-.12-.207-.013-.319.107-.439.108-.108.225-.262.337-.393.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.413-.056-.131-.475-1.136-.65-1.56-.17-.411-.344-.356-.475-.362-.122-.005-.262-.006-.401-.006-.14 0-.367.052-.56.262-.193.21-1.378 1.348-1.378 3.288 0 1.94 1.412 3.815 1.612 4.077.2.262 2.78 4.248 6.732 5.952.94.406 1.674.647 2.247.829.945.3 1.806.258 2.486.156.758-.113 2.278-.93 2.597-1.785.319-.855.319-1.587.225-1.785-.095-.199-.35-.299-.65-.449z"/>
                      </svg>
                      Chat on WhatsApp
                    </a>
                  )}
                  <button onClick={handleClaimProposal} className="lxs-btn lxs-btn--primary lxs-btn--full">
                    Get My Custom Proposal
                    <ArrowRight size={14} />
                  </button>
                </div>
                <span className="lxs-summary-footer-text" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
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
              Fair, upfront pricing tailored for growing businesses, medical clinics, trades, and professional practices.
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
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>PRICE ({region === 'us_ca' ? 'USD' : 'INR'})</th>
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
                {region === 'us_ca' ? '* All rates in USD. Customized enterprise scopes available upon request.' : '* All rates in INR (GST included). No hidden charges. Customized enterprise scopes available upon request.'}
              </span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {region === 'in' && (
                  <a
                    href="https://wa.me/919024378271?text=Hi%20OddWebs%2C%20I%20have%20questions%20about%20your%20services%20matrix."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lxs-btn"
                    style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', padding: '8px 18px', fontSize: '11px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.023-5.09-2.885-6.954C16.59 1.958 14.13 1.95 11.517 1.95c-5.438 0-9.863 4.413-9.866 9.831 0 1.77.472 3.5 1.365 5.03L2.094 21.75l5.09-1.332zM17.487 14.4c-.299-.149-1.778-.875-2.053-.974-.275-.099-.475-.149-.675.15-.2.299-.775.974-.95 1.174-.175.199-.35.224-.65.074-1.122-.56-2.127-1.127-2.92-1.815-.615-.533-1.012-1.186-1.132-1.393-.12-.207-.013-.319.107-.439.108-.108.225-.262.337-.393.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.413-.056-.131-.475-1.136-.65-1.56-.17-.411-.344-.356-.475-.362-.122-.005-.262-.006-.401-.006-.14 0-.367.052-.56.262-.193.21-1.378 1.348-1.378 3.288 0 1.94 1.412 3.815 1.612 4.077.2.262 2.78 4.248 6.732 5.952.94.406 1.674.647 2.247.829.945.3 1.806.258 2.486.156.758-.113 2.278-.93 2.597-1.785.319-.855.319-1.587.225-1.785-.095-.199-.35-.299-.65-.449z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                )}
                <button onClick={() => onViewChange('demo')} className="lxs-btn lxs-btn--primary" style={{ padding: '8px 18px', fontSize: '11px' }}>
                  Request Custom Proposal ↗
                </button>
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
              {region === 'us_ca'
                ? 'We eliminate traditional agency bloat. No account managers playing telephone, no expensive office minimums. Direct software engineering flat-rates starting from $500 for landing pages and $1,199 for full custom platforms.'
                : 'We eliminate traditional agency bloat. No account managers, no middlemen, just engineering. Direct flat-rates starting from ₹5,000 for landing pages and ₹11,999 for full custom platforms.'}
            </p>
          </div>
        </section>

        {/* COMPARISON MATRIX TABLE */}
        <section className="lxs-comparison-section">
          <div className="lxs-section-header">
            <span className="lxs-eyebrow">TRANSPARENCY</span>
            <h2 className="lxs-section-title">The OddWebs Advantage</h2>
          </div>

          <div className="lxs-comp-grid">
            {/* ODDWEBS PANEL */}
            <div className="lxs-comp-panel lxs-comp-panel--us">
              <div className="lxs-comp-panel-glow" />
              <div className="lxs-comp-panel-header">
                <span className="lxs-comp-panel-label">ODDWEBS</span>
                <h3 className="lxs-comp-panel-title">Direct Engineering</h3>
              </div>
              <ul className="lxs-comp-list">
                {comparisonData.map((item, idx) => (
                  <li key={idx} className="lxs-comp-item">
                    <div className="lxs-comp-item-header">
                      <span className="lxs-comp-num">{item.metric}</span>
                      <div className="lxs-comp-check-icon success">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="lxs-comp-feature-name">{item.feature}</span>
                    </div>
                    <div className="lxs-comp-item-content">
                      <span className="lxs-comp-highlight success">{item.usVal}</span>
                      <p className="lxs-comp-desc">{item.usDesc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* TRADITIONAL AGENCIES PANEL */}
            <div className="lxs-comp-panel lxs-comp-panel--them">
              <div className="lxs-comp-panel-header">
                <span className="lxs-comp-panel-label">TRADITIONAL AGENCIES</span>
                <h3 className="lxs-comp-panel-title">Typical Agency Model</h3>
              </div>
              <ul className="lxs-comp-list">
                {comparisonData.map((item, idx) => (
                  <li key={idx} className="lxs-comp-item">
                    <div className="lxs-comp-item-header">
                      <span className="lxs-comp-num">{item.metric}</span>
                      <div className="lxs-comp-check-icon failure" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 107, 74, 0.12)', color: 'var(--lxs-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>×</span>
                      </div>
                      <span className="lxs-comp-feature-name">{item.feature}</span>
                    </div>
                    <div className="lxs-comp-item-content">
                      <span className="lxs-comp-highlight failure">{item.themVal}</span>
                      <p className="lxs-comp-desc">{item.themDesc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>


        {/* BOTTOM CALL TO ACTION */}
        <section className="lxs-bottom-cta">
          <div className="lxs-bottom-box">
            <span className="lxs-bottom-label">GET STARTED</span>
            <h2 className="lxs-bottom-title">Build Your Custom Engine.</h2>
            <p className="lxs-bottom-sub">
              {region === 'us_ca'
                ? 'Claim your free roadmap design. We\'ll map out your custom digital structure and deliver a fully custom homepage demo within days, completely free.'
                : 'Claim your free roadmap design. We\'ll map out your custom digital structure and deliver a fully custom homepage demo within days, completely free.'}
            </p>
            <div className="lxs-bottom-ctas" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onViewChange('demo')} 
                className="lxs-btn lxs-btn--primary magnetic"
                style={{ padding: '16px 36px', fontSize: '0.95rem' }}
              >
                Book Free Strategy Call
                <ArrowRight size={16} />
              </button>
              {region === 'in' && (
                <a
                  href="https://wa.me/919024378271?text=Hi%20OddWebs%2C%20I%20am%20interested%20in%20a%20website%20and%20want%20to%20book%20a%20call."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lxs-btn"
                  style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', padding: '16px 36px', fontSize: '0.95rem' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.023-5.09-2.885-6.954C16.59 1.958 14.13 1.95 11.517 1.95c-5.438 0-9.863 4.413-9.866 9.831 0 1.77.472 3.5 1.365 5.03L2.094 21.75l5.09-1.332zM17.487 14.4c-.299-.149-1.778-.875-2.053-.974-.275-.099-.475-.149-.675.15-.2.299-.775.974-.95 1.174-.175.199-.35.224-.65.074-1.122-.56-2.127-1.127-2.92-1.815-.615-.533-1.012-1.186-1.132-1.393-.12-.207-.013-.319.107-.439.108-.108.225-.262.337-.393.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.413-.056-.131-.475-1.136-.65-1.56-.17-.411-.344-.356-.475-.362-.122-.005-.262-.006-.401-.006-.14 0-.367.052-.56.262-.193.21-1.378 1.348-1.378 3.288 0 1.94 1.412 3.815 1.612 4.077.2.262 2.78 4.248 6.732 5.952.94.406 1.674.647 2.247.829.945.3 1.806.258 2.486.156.758-.113 2.278-.93 2.597-1.785.319-.855.319-1.587.225-1.785-.095-.199-.35-.299-.65-.449z"/>
                  </svg>
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* STICKY BOTTOM CALL TO ACTION (Fades in after 40% scroll depth) */}
      <div className={`lxs-sticky-cta ${showStickyCta ? 'visible' : ''}`}>
        <div className="lxs-sticky-content">
          <span className="lxs-sticky-dot" />
          <span className="lxs-sticky-text">
            {region === 'us_ca' 
              ? 'Custom Growth Packages Start at $500' 
              : 'Custom Growth Packages Start at ₹5,000'}
          </span>
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
