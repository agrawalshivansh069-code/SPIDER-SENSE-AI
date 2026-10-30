import React from 'react';
import { Shield, Compass, AlertOctagon, Activity } from 'lucide-react';

export function HeroSection({ onNavigateToSection }) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-content">
        <div className="hero-pill">
          <span className="hero-pulse-dot" />
          <span>Student Decision Matrix</span>
        </div>

        <h1 className="hero-title">
          SPIDER-<span>SENSE</span>
        </h1>

        <h2 className="hero-subtitle">Your Personal Decision Assistant</h2>

        <p className="hero-body">
          Most applications tell you what to do. Spider-Sense helps you understand what you{' '}
          <em className="hero-highlight-can">can</em> realistically do, what happens when you
          choose differently, and how to adapt when life changes.
        </p>

        <div className="hero-quote-box">
          <p className="hero-quote">
            "With great power comes great responsibility." — <strong>Uncle Ben</strong>
          </p>
        </div>

        {/* 3 Pillars Quick-Navigation Cards */}
        <div className="hero-pillars-grid">
          <button
            type="button"
            className="pillar-card"
            onClick={() => onNavigateToSection?.('reality-check')}
          >
            <div className="pillar-header">
              <span className="pillar-num">01</span>
              <Activity size={16} className="pillar-icon" />
            </div>
            <div className="pillar-title">REALITY CHECK</div>
            <div className="pillar-desc">Is my current daily workload actually achievable?</div>
          </button>

          <button
            type="button"
            className="pillar-card"
            onClick={() => onNavigateToSection?.('what-if-machine')}
          >
            <div className="pillar-header">
              <span className="pillar-num">02</span>
              <Compass size={16} className="pillar-icon" />
            </div>
            <div className="pillar-title">WHAT-IF MACHINE</div>
            <div className="pillar-desc">What happens if I take on one more commitment?</div>
          </button>

          <button
            type="button"
            className="pillar-card pillar-emergency"
            onClick={() => onNavigateToSection?.('emergency-replanner')}
          >
            <div className="pillar-header">
              <span className="pillar-num">03</span>
              <AlertOctagon size={16} className="pillar-icon" />
            </div>
            <div className="pillar-title">EMERGENCY REPLANNER</div>
            <div className="pillar-desc">A crisis just hit. How do I adapt immediately?</div>
          </button>
        </div>
      </div>

      {/* Spider-Sense Radar Graphic - Technical & Subtle */}
      <div className="hero-radar-container" aria-hidden="true">
        <svg
          className="hero-radar-svg"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radar Background Rings */}
          <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(245, 240, 232, 0.05)" strokeWidth="1" />
          <circle cx="200" cy="200" r="125" fill="none" stroke="rgba(245, 240, 232, 0.07)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(196, 30, 58, 0.15)" strokeWidth="1" />
          <circle cx="200" cy="200" r="35" fill="none" stroke="rgba(196, 30, 58, 0.3)" strokeWidth="1.2" />

          {/* Crosshairs */}
          <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(245, 240, 232, 0.06)" strokeWidth="1" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(245, 240, 232, 0.06)" strokeWidth="1" />

          {/* Octagonal Spider Web Inset */}
          <polygon
            points="200,75 288,112 325,200 288,288 200,325 112,288 75,200 112,112"
            fill="none"
            stroke="rgba(196, 30, 58, 0.2)"
            strokeWidth="1"
          />

          {/* Sweeping Radar Arc */}
          <g className="radar-sweep-group">
            <line
              x1="200"
              y1="200"
              x2="200"
              y2="30"
              stroke="url(#radarSweepGradient)"
              strokeWidth="2"
            />
            <path
              d="M 200 200 L 200 30 A 170 170 0 0 1 320 80 Z"
              fill="url(#radarSectorGradient)"
              opacity="0.35"
            />
          </g>

          {/* Radar Blips (Simulating Tasks / Commitments) */}
          <circle cx="270" cy="140" r="4" fill="#C41E3A" className="blip blip-1" />
          <circle cx="130" cy="240" r="3.5" fill="#88b8e6" className="blip blip-2" />
          <circle cx="230" cy="260" r="4.5" fill="#ff7588" className="blip blip-3" />
          <circle cx="200" cy="200" r="4" fill="#F5F0E8" />

          <defs>
            <linearGradient id="radarSweepGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(196, 30, 58, 0.1)" />
              <stop offset="100%" stopColor="#C41E3A" />
            </linearGradient>
            <radialGradient id="radarSectorGradient" cx="200" cy="200" r="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(196, 30, 58, 0)" />
              <stop offset="70%" stopColor="rgba(196, 30, 58, 0.15)" />
              <stop offset="100%" stopColor="rgba(196, 30, 58, 0.35)" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}
