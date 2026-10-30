import React, { useState, useEffect } from 'react';
import { SpiderWebIcon, BackgroundWebPattern } from './components/Icons';
import { RealityCheck } from './components/RealityCheck';
import { WhatIfMachine } from './components/WhatIfMachine';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getStoredApiKey } from './services/gemini';
import { Key, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(getStoredApiKey());
  }, []);

  const handleKeyUpdated = (newKey) => {
    setApiKey(newKey);
  };

  return (
    <div className="app-wrapper">
      {/* Background Spider-Web Texture Overlay */}
      <div className="web-background" />
      <BackgroundWebPattern />

      {/* Fixed Top Nav */}
      <header className="top-nav">
        <div className="nav-container">
          <a href="#" className="brand-link">
            <div className="brand-icon-wrapper">
              <SpiderWebIcon size={20} color="var(--crimson)" />
            </div>
            <div className="brand-title-group">
              <span className="brand-title">SPIDER-SENSE</span>
              <span className="brand-tagline">Think ahead. Choose wisely. Stay responsible.</span>
            </div>
          </a>

          <div className="nav-controls">
            <button
              type="button"
              className={`status-badge ${apiKey ? 'status-live' : 'status-demo'}`}
              onClick={() => setIsApiModalOpen(true)}
              title="Click to configure Gemini API Key"
              style={{ cursor: 'pointer', background: 'transparent' }}
            >
              <span className="status-dot" />
              <span>{apiKey ? 'Gemini 1.5 Live' : 'Demo / Heuristic Mode'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsApiModalOpen(true)}
              title="Manage Gemini API Key"
            >
              <Key size={14} />
              <span style={{ display: 'none', smDisplay: 'inline' }}>
                {apiKey ? 'API Key Set' : 'Add API Key'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-pill">
            <ShieldCheck size={13} />
            <span>Student Decision Assistant</span>
          </div>

          <h1 className="hero-title">
            SPIDER-<span>SENSE</span>
          </h1>

          <h2 className="hero-subtitle">Your Personal Decision Assistant</h2>

          <p className="hero-body">
            Most apps tell you what to do. Spider-Sense helps you understand what you{' '}
            <em className="hero-highlight-can">can</em> realistically do — and what happens if you choose differently.
          </p>

          <p className="hero-quote">
            "With great power comes great responsibility." — <strong>Uncle Ben</strong>
          </p>
        </section>

        {/* Notice for First-Time Users if No Key is Set */}
        {!apiKey && (
          <div className="api-notice">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={16} />
              <span>
                Ready to use! Spider-Sense is currently running in local heuristic mode. Connect your free{' '}
                <strong>Gemini API Key</strong> for live AI evaluations.
              </span>
            </div>
            <button type="button" onClick={() => setIsApiModalOpen(true)}>
              Enter Key
            </button>
          </div>
        )}

        {/* The Two Core Features Grid: What-If Machine first for immediate high-impact demo */}
        <div className="features-grid">
          {/* Feature 1: WHAT-IF MACHINE (Lead feature) */}
          <WhatIfMachine onOpenApiModal={() => setIsApiModalOpen(true)} />

          {/* Feature 2: REALITY CHECK */}
          <RealityCheck onOpenApiModal={() => setIsApiModalOpen(true)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="footer-text">
          Built for The CodeBreakers Club · GenAI Domain Task · Spider-Man Universe
        </p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />
    </div>
  );
}
