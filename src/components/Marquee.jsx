import React from 'react';

const logos = [
  { name: 'Lunacart', style: { fontFamily: "'Inter', sans-serif", fontWeight: 600 } },
  { name: 'DataFlow', style: { fontFamily: "'Syne', sans-serif", fontWeight: 700 } },
  { name: 'mintpay', style: { fontFamily: "'Inter', sans-serif", fontWeight: 300, textTransform: 'lowercase' } },
  { name: 'VOYAGE', style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase' } },
  { name: 'northbeam', style: { fontFamily: "'Inter', sans-serif", fontWeight: 400 } },
  { name: 'simple.', style: { fontFamily: "'Syne', sans-serif", fontWeight: 400 } },
  { name: 'Reachly', style: { fontFamily: "'Syne', sans-serif", fontWeight: 600 } },
  { name: 'Apex IO', style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 } },
];

export default function Marquee() {
  const allLogos = [...logos, ...logos];
  return (
    <section className="marquee-section">
      <span className="marquee-label">[ TRUSTED BY ]</span>
      <div className="marquee-track-wrapper">
        <div className="marquee-track">
          {allLogos.map((logo, i) => (
            <span key={i} className="marquee-logo" style={logo.style}>{logo.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
