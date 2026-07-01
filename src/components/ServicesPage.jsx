import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitHeading from './SplitHeading';
import { isLite } from '../utils/device';
import { trackEvent, trackCTA } from '../utils/analytics';

gsap.registerPlugin(ScrollTrigger);

const serviceCategories = [
  {
    title: 'Web Design & Build',
    count: 8,
    color: 'var(--accent-ember)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    description: 'Our expert web designers and developers craft custom, conversion-optimized websites that look stunning and perform brilliantly. From small business websites to complex web applications, we build responsive, SEO-friendly sites using Next.js, React, and modern frameworks that load fast and rank high on Google.',
    subServices: [
      'Custom Website Design',
      'Responsive Web Development',
      'E-Commerce Stores',
      'Landing Pages & Funnels',
      'Website Redesign',
      'Headless CMS Integration',
      'Performance Optimization',
      'Web App Development'
    ]
  },
  {
    title: 'AI & Automation',
    count: 6,
    color: 'var(--accent-amber)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    description: 'Leverage the power of artificial intelligence to automate business processes, enhance customer experiences, and unlock data-driven insights. We build custom AI chatbots, workflow automation systems, and intelligent integrations using OpenAI, LangChain, and enterprise-grade LLM pipelines — purpose-built for startups and growing businesses.',
    subServices: [
      'AI Chatbots & Virtual Assistants',
      'Workflow Automation (Zapier, Make)',
      'Custom AI/ML Models',
      'AI-Powered Analytics',
      'Automated Lead Generation',
      'LLM & GPT Integration'
    ]
  },
  {
    title: 'Hosting & Infrastructure',
    count: 6,
    color: 'var(--accent-bright)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
        <circle cx="6" cy="6" r="1"/><circle cx="6" cy="18" r="1"/>
      </svg>
    ),
    description: 'Reliable, high-performance managed cloud hosting and infrastructure services that keep your website fast, secure, and always online. We handle SSL certificates, CDN configuration, server monitoring, domain management, and scalable cloud architecture so you can focus on growing your business.',
    subServices: [
      'Managed Cloud Hosting (AWS, Vercel)',
      'SSL Certificates & Security',
      'CDN Setup & Optimization',
      'Domain Management',
      '24/7 Server Monitoring',
      'Scalable Infrastructure'
    ]
  },
  {
    title: 'Google & Local SEO',
    count: 6,
    color: 'var(--accent-gold)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    description: 'Dominate search rankings with our data-driven SEO services tailored for businesses in the US and Canada. We optimize your website for Google with technical SEO audits, local search optimization, schema markup implementation, Core Web Vitals tuning, and strategic keyword targeting that drives qualified organic traffic and improves AI search visibility.',
    subServices: [
      'Technical SEO Audit & Fixes',
      'Local SEO Optimization',
      'Google Business Profile Setup',
      'Schema & Structured Data',
      'Core Web Vitals Optimization',
      'Keyword Strategy & Research'
    ]
  },
  {
    title: 'Branding',
    count: 4,
    color: 'var(--accent-lacquer)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 22l10-6 10 6L12 2z"/>
      </svg>
    ),
    description: 'Build a brand that commands trust and attention. Our branding services include professional logo design, comprehensive brand identity systems, brand guidelines, and visual strategy — all crafted to give your startup or business a premium, cohesive identity that resonates with your target audience in North America.',
    subServices: [
      'Brand Identity Design',
      'Logo Design & Mark Creation',
      'Brand Guidelines & Style Guides',
      'Visual Strategy & Positioning'
    ]
  },
  {
    title: 'Content & Copy',
    count: 4,
    color: 'var(--accent-ember)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    description: 'Words that convert. Our content and copywriting services are optimized for both humans and search engines. From compelling website copy to SEO-driven blog content, we create strategic content that establishes authority, drives organic traffic, and turns readers into customers.',
    subServices: [
      'Website Copywriting',
      'SEO Content Strategy',
      'Blog & Article Writing',
      'Conversion-Focused Copy'
    ]
  },
  {
    title: 'Ads & Marketing',
    count: 4,
    color: 'var(--accent-amber)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    description: 'Maximize your ROI with precision-targeted digital advertising and performance marketing. We manage Google Ads, social media campaigns, retargeting, and analytics-driven marketing strategies that deliver measurable results for businesses looking to scale their customer acquisition across the United States and Canada.',
    subServices: [
      'Google Ads (PPC) Management',
      'Social Media Marketing',
      'Performance Marketing & Analytics',
      'Retargeting & Remarketing Campaigns'
    ]
  }
];

const servicePrices = {
  'Web Design & Build': 699,
  'AI & Automation': 599,
  'Hosting & Infrastructure': 199,
  'Google & Local SEO': 399,
  'Branding': 299,
  'Content & Copy': 249,
  'Ads & Marketing': 499
};

export default function ServicesPage({ onViewChange }) {
  const sectionRef = useRef(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState([0]); // Web Design checked by default

  useEffect(() => {
    if (isLite) {
      gsap.set('.sp-category-card', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.sp-category-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true
            },
            delay: i * 0.05
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleExpand = (idx) => {
    setExpandedCard(expandedCard === idx ? null : idx);
  };

  const handleBundleToggle = (idx) => {
    setSelectedBundle(prev => {
      let nextBundle;
      if (prev.includes(idx)) {
        nextBundle = prev.filter(i => i !== idx);
      } else {
        nextBundle = [...prev, idx];
      }
      
      const serviceTitle = serviceCategories[idx].title;
      const isSelected = nextBundle.includes(idx);
      trackEvent('growth_stack_selection_change', {
        service_name: serviceTitle,
        action: isSelected ? 'checked' : 'unchecked',
        total_selected: nextBundle.length
      });
      return nextBundle;
    });
  };

  const handleClaimBundle = (e) => {
    e.preventDefault();
    if (selectedBundle.length === 0) return;
    
    const mappedServices = [];
    selectedBundle.forEach(idx => {
      const title = serviceCategories[idx].title;
      if (title === 'Web Design & Build') {
        mappedServices.push('Website', 'UI/UX Design');
      } else if (title === 'AI & Automation') {
        mappedServices.push('AI Automation');
      } else if (title === 'Hosting & Infrastructure' || title === 'Google & Local SEO') {
        mappedServices.push('Website');
      } else if (title === 'Branding') {
        mappedServices.push('UI/UX Design');
      } else {
        mappedServices.push('Other');
      }
    });
    
    const uniqueServices = Array.from(new Set(mappedServices));
    sessionStorage.setItem('preferred_services', JSON.stringify(uniqueServices));
    
    trackCTA('claim_bundle_discount', 'click', {
      selected_services: uniqueServices,
      has_discount: selectedBundle.length >= 2,
      total_selections: selectedBundle.length
    });
    
    onViewChange('demo');
  };

  // Pricing calculations
  const originalTotal = selectedBundle.reduce((sum, idx) => sum + servicePrices[serviceCategories[idx].title], 0);
  const hasDiscount = selectedBundle.length >= 2;
  const discountAmount = hasDiscount ? Math.round(originalTotal * 0.20) : 0;
  const finalTotal = originalTotal - discountAmount;

  return (
    <div id="services-page" ref={sectionRef} className="sp-wrapper">
      <div className="section-glow-line" aria-hidden="true" />
      <div className="portfolio-bg-glow" style={{ '--active-color': 'var(--accent-ember)' }} />

      <div className="container sp-container">
        {/* Back nav */}
        <div className="bf-back-home-wrap">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); onViewChange('home'); }}
            className="bf-back-home-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Back to Home
          </a>
        </div>

        {/* Scarcity availability status ticker */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="sp-status-ticker">
            <span className="sp-status-dot"></span>
            <span>Status: Only 2 Client Build Slots Remaining for {new Date().toLocaleString('default', { month: 'long' })}</span>
          </div>
        </div>

        {/* Header */}
        <header className="sp-header">
          <span className="eyebrow" style={{ color: 'var(--accent-ember)' }}>TAILORED SOLUTIONS</span>
          <SplitHeading text="All Services" className="sp-title" />
          <p className="sp-subtitle">
            We do not sell pre-made packages or rigid plans. Every business is unique, and we scope every project from scratch based on your custom requirements. We offer a <strong style={{ color: 'var(--accent-ember)' }}>Free Technical Demo & Roadmap</strong>, with all custom projects starting at <strong style={{ color: 'var(--accent-amber)' }}>$499 USD</strong>.
          </p>
        </header>

        {/* Trust badges */}
        <div className="sp-trust-bar">
          <div className="sp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ember)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            <span>Free Custom Roadmap</span>
          </div>
          <div className="sp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>No Fixed Plans</span>
          </div>
          <div className="sp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Starts at $499 USD</span>
          </div>
          <div className="sp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <span>Free Live Demo</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="sp-grid">
          {serviceCategories.map((cat, idx) => {
            const isHighlighted = cat.title === 'Web Design & Build';
            return (
              <article
                key={idx}
                className={`sp-category-card ${expandedCard === idx ? 'sp-card--expanded' : ''} ${isHighlighted ? 'sp-card--highlighted' : ''}`}
                style={{ '--card-accent': cat.color }}
                onClick={() => toggleExpand(idx)}
              >
                {isHighlighted && (
                  <span className="sp-highlight-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Top Deal
                  </span>
                )}
                <div className="sp-card-top">
                  <div className="sp-card-icon" style={{ color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className="sp-card-count">{cat.count}</div>
                </div>

                <h3 className="sp-card-title">{cat.title}</h3>
                <p className="sp-card-desc">{cat.description}</p>

                {/* Sub-services list */}
                <ul className="sp-card-list">
                  {cat.subServices.map((sub, i) => (
                    <li key={i}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {sub}
                    </li>
                  ))}
                </ul>

                {/* Redesigned Pricing & Scope */}
                <div className="sp-card-price" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>PROJECT SCOPE</span>
                  <span style={{ fontSize: '15px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>Customized to your needs</span>
                  <span style={{ fontSize: '12px', color: cat.color, fontFamily: 'var(--font-mono)' }}>Starts at $499 USD</span>
                </div>

                {/* CTA */}
                <a
                  href="#demo"
                  className="sp-card-cta"
                  style={{ '--cta-color': cat.color }}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onViewChange('demo'); }}
                >
                  Get Custom Roadmap
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>

                <div className="sp-card-glow" />
              </article>
            );
          })}
        </div>

        {/* Custom Bundle Builder */}
        <section className="sp-bundle-section">
          <div className="sp-bundle-header">
            <span className="eyebrow" style={{ color: 'var(--accent-amber)' }}>interactive pricing</span>
            <h2 className="sp-bundle-title">Custom Growth Stack Configurator</h2>
            <p className="sp-bundle-subtitle">
              Combine services to engineer your perfect digital ecosystem. Select 2 or more capabilities to unlock an instant 20% bundle discount.
            </p>
          </div>

          <div className="sp-bundle-container">
            {/* Left: Checklist */}
            <div className="sp-bundle-checklist">
              {serviceCategories.map((cat, idx) => {
                const isActive = selectedBundle.includes(idx);
                const price = servicePrices[cat.title];
                return (
                  <div
                    key={idx}
                    className={`sp-bundle-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleBundleToggle(idx)}
                  >
                    <div className="sp-bundle-checkbox">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div className="sp-bundle-item-content">
                      <div>
                        <span className="sp-bundle-item-title">{cat.title}</span>
                        <span className="sp-bundle-item-tag"> ({cat.count} capabilities included)</span>
                      </div>
                      <span className="sp-bundle-item-val">${price} USD</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Pricing Calculator Pass */}
            <div className="sp-bundle-price-card">
              <div>
                <div className="sp-bundle-summary-header">
                  <span className="sp-bundle-summary-title">Your Custom Stack</span>
                  <p className="sp-bundle-summary-desc">
                    {selectedBundle.length === 0 
                      ? 'Select services on the left to start configuring your deal.' 
                      : `Bundling ${selectedBundle.length} expert service areas.`}
                  </p>
                </div>

                {selectedBundle.length > 0 && (
                  <div className="sp-bundle-summary-rows">
                    {selectedBundle.map((idx) => {
                      const cat = serviceCategories[idx];
                      return (
                        <div key={idx} className="sp-bundle-summary-row">
                          <span>{cat.title}</span>
                          <span>${servicePrices[cat.title]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                {hasDiscount && (
                  <div className="sp-bundle-discount-badge">
                    🔥 20% Bundle Discount Applied (-${discountAmount} USD)
                  </div>
                )}

                {selectedBundle.length > 0 ? (
                  <>
                    {hasDiscount && (
                      <div className="sp-bundle-original-price">${originalTotal} USD</div>
                    )}
                    <div className="sp-bundle-final-price">
                      ${finalTotal} <span>USD / starting</span>
                    </div>
                    <p className="sp-bundle-price-footer">
                      *Scoped completely free. No retainer contract required.
                    </p>
                    <a
                      href="#demo"
                      className="sp-bundle-cta"
                      onClick={handleClaimBundle}
                    >
                      Lock in this Deal
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </a>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                    Select services to see pricing.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="sp-comparison-section">
          <div className="sp-bundle-header">
            <span className="eyebrow" style={{ color: 'var(--accent-ember)' }}>SMART CONTRAST</span>
            <h2 className="sp-bundle-title">OD Model vs. Traditional Agencies</h2>
            <p className="sp-bundle-subtitle">
              Why fast-growing startups and small businesses choose our high-efficiency structure over bloated retainers.
            </p>
          </div>
          <div className="sp-comparison-wrapper">
            <table className="sp-comp-table">
              <thead>
                <tr>
                  <th>Features & Value</th>
                  <th className="col-highlight">OD (Our Model)</th>
                  <th>Traditional Agencies</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sp-comp-feature">
                    Risk-Free Demo
                    <span className="sp-comp-feature-desc">Pay nothing until you see your custom homepage design.</span>
                  </td>
                  <td className="sp-comp-us-cell col-highlight">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    100% Free Demo First
                  </td>
                  <td className="sp-comp-them-cell">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Requires upfront deposit
                  </td>
                </tr>
                <tr>
                  <td className="sp-comp-feature">
                    Pricing Structure
                    <span className="sp-comp-feature-desc">Modular scaling designed for high ROI.</span>
                  </td>
                  <td className="sp-comp-us-cell col-highlight">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Starts at $499 USD
                  </td>
                  <td className="sp-comp-them-cell">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    $5,000+ flat minimums
                  </td>
                </tr>
                <tr>
                  <td className="sp-comp-feature">
                    Contracts & Retainers
                    <span className="sp-comp-feature-desc">No lock-ins. Pay only for what you build.</span>
                  </td>
                  <td className="sp-comp-us-cell col-highlight">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Zero monthly retainers
                  </td>
                  <td className="sp-comp-them-cell">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Hard 6-12 month lock-ins
                  </td>
                </tr>
                <tr>
                  <td className="sp-comp-feature">
                    Build Speed & Scoping
                    <span className="sp-comp-feature-desc">Deployed on fast edge servers quickly.</span>
                  </td>
                  <td className="sp-comp-us-cell col-highlight">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    3 - 7 days turnaround
                  </td>
                  <td className="sp-comp-them-cell">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    4 - 8 weeks of slow bureaucracy
                  </td>
                </tr>
                <tr>
                  <td className="sp-comp-feature">
                    Direct Team Access
                    <span className="sp-comp-feature-desc">No sales reps or telephone tag.</span>
                  </td>
                  <td className="sp-comp-us-cell col-highlight">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Direct dev Slack & WhatsApp
                  </td>
                  <td className="sp-comp-them-cell">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Bloated middleman managers
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="sp-bottom-cta">
          <h2 className="sp-bottom-title">Get your custom roadmap today.</h2>
          <p className="sp-bottom-sub">
            Schedule a free live demo call. We'll analyze your requirements, answer your questions, and deliver a tailored scope document starting at just $499 USD.
          </p>
          <a
            href="#demo"
            className="btn-primary magnetic"
            onClick={(e) => { e.preventDefault(); onViewChange('demo'); }}
            style={{ fontSize: '1rem', padding: '16px 36px' }}
          >
            Book Free Demo Call
            <span className="btn-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
