import React from 'react';

/**
 * Clean, subtle spider-web icon for logo & accents.
 * Thematic, not cartoonish.
 */
export function SpiderWebIcon({ size = 20, className = '', color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Radial anchor lines */}
      <line x1="12" y1="2" x2="12" y2="22" opacity="0.8" />
      <line x1="2" y1="12" x2="22" y2="12" opacity="0.8" />
      <line x1="5" y1="5" x2="19" y2="19" opacity="0.7" />
      <line x1="5" y1="19" x2="19" y2="5" opacity="0.7" />
      
      {/* Concentric spider-web octagons */}
      <polygon points="12,5 17,7 19,12 17,17 12,19 7,17 5,12 7,7" opacity="0.6" strokeWidth="1.2" />
      <polygon points="12,8 15,9.5 16,12 15,14.5 12,16 9,14.5 8,12 9,9.5" opacity="0.85" strokeWidth="1.3" />
      
      {/* Spider center point */}
      <circle cx="12" cy="12" r="1.3" fill={color} />
    </svg>
  );
}

/**
 * Small spider icon used as the separator between Scenario A and Scenario B.
 * Sleek, geometric, inspired by the classic back-spider emblem.
 */
export function SpiderIcon({ size = 20, className = '', color = '#C41E3A' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      {/* Spider Body */}
      <ellipse cx="16" cy="16.5" rx="3.2" ry="4.5" fill={color} />
      <circle cx="16" cy="10.8" r="2.2" fill={color} />
      
      {/* Left Legs */}
      <path
        d="M14.5 13 C10 10, 8 7, 7 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.5 15 C9 14, 6 13, 5 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.5 17.5 C9 19, 6 21, 5 24"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.5 19.5 C11 23, 9 26, 8 28.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Right Legs */}
      <path
        d="M17.5 13 C22 10, 24 7, 25 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18.5 15 C23 14, 26 13, 27 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18.5 17.5 C23 19, 26 21, 27 24"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17.5 19.5 C21 23, 23 26, 24 28.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Faint full-screen background spider-web SVG geometry.
 */
export function BackgroundWebPattern() {
  return (
    <svg
      className="web-svg-pattern"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="#C41E3A" strokeWidth="0.8" fill="none">
        {/* Radial strands from top-right corner */}
        <line x1="1100" y1="80" x2="0" y2="150" />
        <line x1="1100" y1="80" x2="0" y2="400" />
        <line x1="1100" y1="80" x2="100" y2="900" />
        <line x1="1100" y1="80" x2="450" y2="900" />
        <line x1="1100" y1="80" x2="850" y2="900" />
        <line x1="1100" y1="80" x2="0" y2="650" />
        <line x1="1100" y1="80" x2="600" y2="0" />
        <line x1="1100" y1="80" x2="200" y2="0" />

        {/* Concentric connecting curves */}
        <path d="M700 0 Q800 120 1100 240" />
        <path d="M500 0 Q650 180 1100 380" />
        <path d="M300 0 Q500 250 1100 520" />
        <path d="M100 0 Q350 350 1100 680" />
        <path d="M0 150 Q250 450 1100 820" />
        <path d="M0 320 Q200 550 900 900" />
        <path d="M0 500 Q150 680 650 900" />
        <path d="M0 700 Q120 780 400 900" />

        {/* Subtle secondary cluster bottom-left */}
        <line x1="80" y1="820" x2="1200" y2="700" opacity="0.6" />
        <line x1="80" y1="820" x2="1200" y2="450" opacity="0.6" />
        <line x1="80" y1="820" x2="900" y2="0" opacity="0.6" />
        <line x1="80" y1="820" x2="550" y2="0" opacity="0.6" />
        <path d="M80 620 Q280 650 350 820" opacity="0.6" />
        <path d="M80 480 Q400 550 550 820" opacity="0.6" />
      </g>
    </svg>
  );
}
