import React from 'react';

export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1469" />
          <stop offset="100%" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
      {/* O - bold circle */}
      <circle cx="28" cy="40" r="22" stroke="url(#logoGrad)" strokeWidth="6" fill="none" />
      {/* W - sharp geometric */}
      <path
        d="M42 22L50 54L58 34L66 54L74 22"
        stroke="url(#logoGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
