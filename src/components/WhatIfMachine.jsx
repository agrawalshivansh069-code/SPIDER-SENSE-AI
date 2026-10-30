import React, { useState } from 'react';
import { analyzeWhatIf } from '../services/gemini';
import { GitBranch, Compass, Sparkles, Scale, Copy, Check } from 'lucide-react';
import { SpiderIcon } from './Icons';

const WHAT_IF_PRESETS = [
  {
    name: '36-Hour Hackathon Dilemma',
    commitments: 'Algorithms midterm on Thursday, 12-page systems paper due Friday, already running on 6 hours sleep.',
    newThing: 'Join a 36-hour weekend Web3 hackathon with my club team',
  },
  {
    name: 'Part-Time Startup Role',
    commitments: 'Full 18-credit course load, weekly lab reports, active soccer team practice on Tuesday & Thursday.',
    newThing: 'Take an 15h/week part-time frontend internship offering good stipend',
  },
  {
    name: 'Late-Night Gaming / Movie Sprint',
    commitments: '8 AM database lab exam tomorrow morning, followed by project presentation at 11 AM.',
    newThing: 'Stay up until 3 AM for a surprise Discord multiplayer release with high school friends',
  },
];

export function WhatIfMachine({ onOpenApiModal }) {
  const [commitments, setCommitments] = useState(
    'Algorithms midterm on Thursday, 12-page systems paper due Friday, already running on 6 hours sleep.'
  );
  const [newThing, setNewThing] = useState(
    'Join a 36-hour weekend Web3 hackathon with my club team'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    scenarioA: [
      'High adrenaline and rapid experiential gain from tackling the hackathon, but your margin for error on your Thursday midterm and Friday paper drops to near zero.',
      'Severe sleep debt and cognitive fragmentation will compound over the weekend, creating a hangover that jeopardizes next week’s presentations.',
      'Manageable only if you finish 80% of the systems paper before Friday 5 PM and intentionally deprioritize hackathon side-tracks.'
    ],
    scenarioB: [
      'You protect deep revision windows, 7+ hours of nightly sleep, and high execution quality for your existing midterm and paper.',
      'Zero spillover risk: your academic standing, mental composure, and recovery cycles remain completely guarded.',
      'You miss the team camaraderie, resume-worthy project sprint, and potential networking with industry sponsors.'
    ],
    verdict: 'Saying yes buys high-stakes opportunity at the direct cost of academic breathing room; saying no protects your grades and peace of mind at the cost of short-term adventure.',
    isSimulated: true,
    rawText: 'SCENARIO A:\n• High adrenaline and rapid experiential gain...\nSCENARIO B:\n• You protect deep revision windows...\nVERDICT: Saying yes buys high-stakes opportunity...'
  });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleApplyPreset = (preset) => {
    setCommitments(preset.commitments);
    setNewThing(preset.newThing);
    setResult(null);
    setError(null);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!commitments.trim() || !newThing.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeWhatIf({
        commitments: commitments.trim(),
        newThing: newThing.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to simulate scenarios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.rawText) return;
    navigator.clipboard.writeText(result.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="feature-card" id="what-if-machine">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon-badge">
            <GitBranch size={22} />
          </div>
          <div className="card-title-group">
            <h2>WHAT-IF MACHINE</h2>
            <p>Simulate the cascading fallout of taking on one more commitment before you commit.</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="presets-container">
          <span style={{ fontSize: '0.74rem', color: 'var(--off-white-dim)', marginRight: '0.2rem' }}>
            Presets:
          </span>
          {WHAT_IF_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset(p)}
              title={p.newThing}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSimulate}>
        <div className="form-group">
          <label className="form-label" htmlFor="commitments">
            <span>Your Existing Commitments & Deadlines</span>
            <span className="form-hint">Exams, papers, shifts, family</span>
          </label>
          <textarea
            id="commitments"
            className="input-field"
            rows={3}
            placeholder="e.g. DSA midterm in 3 days, final project draft due Friday, 4h part-time shift Saturday..."
            value={commitments}
            onChange={(e) => setCommitments(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-thing">
            <span>What if I take on...</span>
            <span className="form-hint">The new opportunity, event, or temptation</span>
          </label>
          <textarea
            id="new-thing"
            className="input-field"
            rows={2}
            placeholder="e.g. What if I join this 36-hour hackathon tomorrow?"
            value={newThing}
            onChange={(e) => setNewThing(e.target.value)}
            required
          />
        </div>

        <div className="btn-group">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !commitments.trim() || !newThing.trim()}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Simulating Scenarios...
              </>
            ) : (
              <>
                <Compass size={16} />
                Simulate Decision
              </>
            )}
          </button>

          {(commitments || newThing) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCommitments('');
                setNewThing('');
                setResult(null);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            background: 'rgba(196, 30, 58, 0.15)',
            border: '1px solid rgba(196, 30, 58, 0.4)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#ff8598',
          }}
        >
          {error}
        </div>
      )}

      {/* Results Section: Side-by-Side Scenario A & B + Spider Icon + Verdict */}
      {result && (
        <div className="result-container">
          <div className="result-badge-bar">
            <div className="result-badge" style={{ background: 'rgba(196, 30, 58, 0.15)', color: 'var(--off-white)' }}>
              <Scale size={14} style={{ color: 'var(--crimson)' }} />
              Divergent Trajectories
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {result.isSimulated && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#fde047',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={onOpenApiModal}
                  title="Click to add live Gemini API key"
                >
                  Offline Engine Active
                </span>
              )}
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy Scenarios'}
              </button>
            </div>
          </div>

          {/* Two side-by-side cards separated by a small spider icon */}
          <div className="scenarios-grid">
            {/* Scenario A: Accept */}
            <div className="scenario-card accept">
              <div className="scenario-header">
                <div>
                  <h3 className="scenario-title">SCENARIO A</h3>
                  <div style={{ fontSize: '0.8rem', color: '#ff8598', marginTop: '0.15rem' }}>
                    You Accept The Invitation
                  </div>
                </div>
                <span className="scenario-badge accept-badge">High Risk / High Upside</span>
              </div>
              <ul className="scenario-bullets">
                {result.scenarioA.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Subtle Spider Separator Icon */}
            <div className="spider-divider" title="Decision Nexus">
              <div className="spider-divider-line" />
              <div className="spider-divider-icon">
                <SpiderIcon size={20} color="#C41E3A" />
              </div>
              <div className="spider-divider-line" />
            </div>

            {/* Scenario B: Decline */}
            <div className="scenario-card decline">
              <div className="scenario-header">
                <div>
                  <h3 className="scenario-title">SCENARIO B</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--off-white-muted)', marginTop: '0.15rem' }}>
                    You Decline & Hold The Line
                  </div>
                </div>
                <span className="scenario-badge decline-badge">Stability / Buffer Protected</span>
              </div>
              <ul className="scenario-bullets">
                {result.scenarioB.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Honest Trade-off Verdict */}
          {result.verdict && (
            <div className="verdict-card">
              <div className="verdict-header">
                <SpiderIcon size={14} color="#ff8598" />
                <span>VERDICT · THE HONEST TRADE-OFF</span>
              </div>
              <div className="verdict-text">{result.verdict}</div>
              <div className="verdict-reminder">
                Remember: Spider-Sense illuminates the branches. The responsibility of the choice is entirely yours.
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
