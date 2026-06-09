import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const cases = [
  {
    name: 'LunaCart', category: 'E-COMMERCE', pillBg: 'rgba(255,95,87,0.2)', pillColor: '#FF5F57',
    bg: 'linear-gradient(145deg, #1A0A0A, #2A0A14)', metric: '320%', metricColor: '#FFD166',
    sub: 'Revenue Growth in 6 months',
    desc: 'We rebuilt their entire e-commerce platform on Next.js with custom checkout flows and abandoned cart AI.',
    mockType: 'browser',
  },
  {
    name: 'DataFlow', category: 'SAAS PLATFORM', pillBg: 'rgba(6,239,197,0.2)', pillColor: '#06EFC5',
    bg: 'linear-gradient(145deg, #0A0A2A, #0A1A2A)', metric: '45%', metricColor: '#06EFC5',
    sub: 'Churn Rate Reduced',
    desc: 'Custom analytics dashboard with real-time data visualization and predictive churn modeling.',
    mockType: 'chart',
  },
  {
    name: 'Payze', category: 'FINTECH APP', pillBg: 'rgba(167,139,250,0.2)', pillColor: '#A78BFA',
    bg: 'linear-gradient(145deg, #1A0A2A, #0A0A1E)', metric: '$2.4M', metricColor: '#A78BFA',
    sub: 'Funding Secured Post-Launch',
    desc: 'Designed and built the fintech MVP in 5 weeks. Investors were impressed from the first demo.',
    mockType: 'phone',
  },
  {
    name: 'VoyageAI', category: 'AI AUTOMATION', pillBg: 'rgba(6,239,197,0.2)', pillColor: '#06EFC5',
    bg: 'linear-gradient(145deg, #0A1A0A, #0A2A1A)', metric: '80%', metricColor: '#06EFC5',
    sub: 'Manual Work Eliminated',
    desc: 'End-to-end automation pipeline using GPT-4o and custom agents for content and operations.',
    mockType: 'flow',
  },
];

function BrowserMock() {
  return (
    <div className="browser-mock">
      <div className="browser-mock-bar">
        <span className="browser-dot" style={{ background: '#FF5F57' }} />
        <span className="browser-dot" style={{ background: '#FFD166' }} />
        <span className="browser-dot" style={{ background: '#06EFC5' }} />
      </div>
      <div className="browser-mock-content">
        <div className="mock-line" style={{ width: '60%' }} />
        <div className="mock-line" style={{ width: '80%', opacity: 0.5 }} />
        <div className="mock-line" style={{ width: '40%', opacity: 0.3 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
          <div style={{ height: 30, background: 'rgba(123,63,228,0.15)', borderRadius: 4 }} />
          <div style={{ height: 30, background: 'rgba(123,63,228,0.1)', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

function ChartMock() {
  const heights = [40, 65, 35, 80, 55, 70];
  return (
    <div className="chart-mock" style={{ paddingTop: 30 }}>
      {heights.map((h, i) => (
        <div key={i} className="chart-bar" style={{
          height: `${h}%`,
          background: i % 2 === 0
            ? 'rgba(6,239,197,0.4)'
            : 'rgba(123,63,228,0.4)',
        }} />
      ))}
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="phone-mock">
      <div className="phone-notch" />
      <div className="phone-mock-line" style={{ width: '70%' }} />
      <div className="phone-mock-line" style={{ width: '50%', opacity: 0.5 }} />
      <div style={{ height: 20, background: 'rgba(167,139,250,0.15)', borderRadius: 4, marginTop: 8, marginBottom: 4 }} />
      <div style={{ height: 20, background: 'rgba(167,139,250,0.1)', borderRadius: 4 }} />
      <div className="phone-mock-line" style={{ width: '40%', opacity: 0.3, marginTop: 8 }} />
    </div>
  );
}

function FlowMock() {
  return (
    <div className="flow-diagram">
      <div className="flow-node" />
      <div className="flow-connector" />
      <div className="flow-node" />
      <div className="flow-connector" />
      <div className="flow-node" />
      <div className="flow-connector" />
      <div className="flow-node" />
    </div>
  );
}

const mocks = { browser: BrowserMock, chart: ChartMock, phone: PhoneMock, flow: FlowMock };

export default function CaseStudies() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => '+=' + track.scrollWidth,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => setScrollProgress(self.progress * 100),
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="case-section" ref={sectionRef} id="case-studies">
      <div className="case-header">
        <span className="section-pill">Featured case studies</span>
        <h2 className="section-title">Real results. Real <span className="highlight">impact.</span></h2>
      </div>
      <div className="case-track-wrapper">
        <div className="case-track" ref={trackRef}>
          {cases.map((c, i) => {
            const MockComponent = mocks[c.mockType];
            return (
              <div key={i} className="case-card" style={{ background: c.bg }}>
                <span className="case-pill" style={{ background: c.pillBg, color: c.pillColor }}>[{c.category}]</span>
                <div className="case-mock">
                  <MockComponent />
                </div>
                <div className="case-metric" style={{ color: c.metricColor }}>{c.metric}</div>
                <div className="case-sub">{c.sub}</div>
                <p className="case-desc">{c.desc}</p>
                <a href="#cta" className="case-link">View Case Study →</a>
              </div>
            );
          })}
        </div>
      </div>
      <div className="case-progress-bar">
        <div className="case-progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>
    </section>
  );
}
