import React, { useState, useEffect } from 'react';

export function OpeningActivation({ onComplete, forcePlay = false }) {
  const [stage, setStage] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeen = sessionStorage.getItem('spider_sense_activation_seen');

    if (!forcePlay && (prefersReducedMotion || hasSeen)) {
      setShouldRender(false);
      onComplete?.();
      return;
    }

    // Sequence stages (2.6s total duration)
    // 0: Dark screen with very faint web lines
    // 1: Center crimson beacon appears (350ms)
    // 2: Concentric radar rings pulse outward & web filaments link (800ms)
    // 3: "SPIDER-SENSE" typography reveals (1400ms)
    // 4: Tagline fades in (1900ms)
    // 5: Fade-out transition into main app (2500ms - 2800ms)
    const timers = [
      setTimeout(() => setStage(1), 350),
      setTimeout(() => setStage(2), 850),
      setTimeout(() => setStage(3), 1400),
      setTimeout(() => setStage(4), 1950),
      setTimeout(() => setStage(5), 2600),
      setTimeout(() => {
        sessionStorage.setItem('spider_sense_activation_seen', 'true');
        setShouldRender(false);
        onComplete?.();
      }, 2950),
    ];

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forcePlay]);

  const handleSkip = () => {
    sessionStorage.setItem('spider_sense_activation_seen', 'true');
    setShouldRender(false);
    onComplete?.();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`activation-overlay ${stage >= 5 ? 'activation-fade-out' : ''}`}
      onClick={handleSkip}
      role="dialog"
      aria-label="Spider-Sense Activation Sequence"
    >
      <button
        type="button"
        className="activation-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
      >
        Skip [Esc]
      </button>

      <div className="activation-canvas">
        {/* Stage 1: Fine Web Geometry & Radar Rings */}
        <svg
          className={`activation-web-svg ${stage >= 1 ? 'web-visible' : ''}`}
          viewBox="0 0 800 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="rgba(196, 30, 58, 0.45)" strokeWidth="1" fill="none">
            {/* Concentric Radar / Web Octagons */}
            <circle
              cx="400"
              cy="400"
              r="60"
              className={`ring-circle ring-1 ${stage >= 2 ? 'ring-active' : ''}`}
            />
            <circle
              cx="400"
              cy="400"
              r="130"
              className={`ring-circle ring-2 ${stage >= 2 ? 'ring-active' : ''}`}
            />
            <circle
              cx="400"
              cy="400"
              r="220"
              className={`ring-circle ring-3 ${stage >= 2 ? 'ring-active' : ''}`}
            />
            <circle
              cx="400"
              cy="400"
              r="330"
              className={`ring-circle ring-4 ${stage >= 2 ? 'ring-active' : ''}`}
            />

            {/* Radial Web Strands connecting through center */}
            <line x1="400" y1="50" x2="400" y2="750" className="radial-line" />
            <line x1="50" y1="400" x2="750" y2="400" className="radial-line" />
            <line x1="150" y1="150" x2="650" y2="650" className="radial-line" />
            <line x1="150" y1="650" x2="650" y2="150" className="radial-line" />

            {/* Inner Web Polygons */}
            <polygon
              points="400,320 460,350 480,400 460,450 400,480 340,450 320,400 340,350"
              className={`poly-web ${stage >= 2 ? 'poly-active' : ''}`}
              strokeWidth="1.2"
            />
            <polygon
              points="400,240 520,280 560,400 520,520 400,560 280,520 240,400 280,280"
              className={`poly-web ${stage >= 2 ? 'poly-active' : ''}`}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </g>

          {/* Crimson Center Point & Radar Pulse */}
          <circle
            cx="400"
            cy="400"
            r={stage >= 1 ? '5' : '1'}
            fill="#C41E3A"
            className={`beacon-point ${stage >= 1 ? 'beacon-glowing' : ''}`}
          />
          <circle
            cx="400"
            cy="400"
            r="18"
            fill="none"
            stroke="#C41E3A"
            strokeWidth="2"
            className={`beacon-pulse ${stage >= 2 ? 'pulse-expanding' : ''}`}
          />
        </svg>

        {/* Stage 3 & 4: Title & Tagline Reveal */}
        <div className="activation-text-container">
          <div className={`activation-title ${stage >= 3 ? 'text-revealed' : ''}`}>
            <span>SPIDER</span>
            <span className="activation-title-separator">·</span>
            <span className="accent">SENSE</span>
          </div>

          <div className={`activation-tagline ${stage >= 4 ? 'tagline-revealed' : ''}`}>
            Think ahead. Choose wisely. Stay responsible.
          </div>

          <div className={`activation-radar-status ${stage >= 2 ? 'status-visible' : ''}`}>
            <span className="status-indicator-dot" />
            <span>ACTIVATING NEURAL DECISION MATRIX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
