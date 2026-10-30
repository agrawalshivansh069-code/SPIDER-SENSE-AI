import React, { useState, useEffect } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { OpeningActivation } from './components/OpeningActivation';
import { HeroSection } from './components/HeroSection';
import { RealityCheck } from './components/RealityCheck';
import { WhatIfMachine } from './components/WhatIfMachine';
import { EmergencyReplanner } from './components/EmergencyReplanner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SpiderWebIcon, BackgroundWebPattern } from './components/Icons';
import { getStoredApiKey } from './services/gemini';
import { Key, Play, AlertCircle, Compass, Activity, AlertOctagon } from 'lucide-react';

function AppContent() {
  const { confirmationModal, closeConfirmationModal } = useTasks();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [forceActivation, setForceActivation] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'reality' | 'whatif' | 'emergency'

  useEffect(() => {
    setApiKey(getStoredApiKey());
  }, []);

  const handleKeyUpdated = (newKey) => {
    setApiKey(newKey);
  };

  const handleNavigateToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* Spider-Sense Cinematic Opening Activation */}
      <OpeningActivation forcePlay={forceActivation} onComplete={() => setForceActivation(false)} />

      {/* Subtle Spider-Web Texture Background */}
      <div className="web-background" />
      <BackgroundWebPattern />

      {/* Fixed Top Navigation Bar */}
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

          {/* Quick Nav Anchor Links */}
          <nav className="nav-quick-links" aria-label="Feature navigation">
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => handleNavigateToSection('reality-check')}
            >
              <Activity size={13} /> Reality Check
            </button>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => handleNavigateToSection('what-if-machine')}
            >
              <Compass size={13} /> What-If
            </button>
            <button
              type="button"
              className="nav-link-btn nav-link-emergency"
              onClick={() => handleNavigateToSection('emergency-replanner')}
            >
              <AlertOctagon size={13} /> Emergency
            </button>
          </nav>

          {/* Controls: Replay Activation & API Key */}
          <div className="nav-controls">
            <button
              type="button"
              className="btn-replay"
              onClick={() => setForceActivation(true)}
              title="Replay Spider-Sense Activation Sequence"
            >
              <Play size={12} />
              <span>Intro</span>
            </button>

            <button
              type="button"
              className={`status-badge ${apiKey ? 'status-live' : 'status-demo'}`}
              onClick={() => setIsApiModalOpen(true)}
              title="Click to configure Gemini API Key"
              style={{ cursor: 'pointer', background: 'transparent' }}
            >
              <span className="status-dot" />
              <span>{apiKey ? 'Gemini 1.5 Live' : 'Demo Mode'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsApiModalOpen(true)}
              title="Manage Gemini API Key"
            >
              <Key size={14} />
              <span className="key-btn-label">{apiKey ? 'Key Set' : 'Add Key'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Redesigned Hero Section */}
        <HeroSection onNavigateToSection={handleNavigateToSection} />

        {/* Informative Banner if running in demo fallback mode */}
        {!apiKey && (
          <div className="api-notice">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertCircle size={16} />
              <span>
                Spider-Sense is running on the local deterministic heuristic engine. Connect a free{' '}
                <strong>Gemini API Key</strong> in the header for real-time generative reasoning.
              </span>
            </div>
            <button type="button" onClick={() => setIsApiModalOpen(true)}>
              Enter Key
            </button>
          </div>
        )}

        {/* The 3 Core Pillars in Unified Architecture */}
        <div className="features-grid">
          {/* Pillar 1: REALITY CHECK */}
          <RealityCheck onOpenApiModal={() => setIsApiModalOpen(true)} />

          {/* Pillar 2: WHAT-IF MACHINE (With The Third Path) */}
          <WhatIfMachine onOpenApiModal={() => setIsApiModalOpen(true)} />

          {/* Pillar 3: EMERGENCY REPLANNER (New!) */}
          <EmergencyReplanner onOpenApiModal={() => setIsApiModalOpen(true)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="footer-text">
          Built for The CodeBreakers Club · GenAI Domain Task · Spider-Man Universe
        </p>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />

      <ConfirmationModal
        modalState={confirmationModal}
        onClose={closeConfirmationModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
