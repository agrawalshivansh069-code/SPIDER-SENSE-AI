import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { analyzeWhatIf } from '../services/gemini';
import {
  Compass,
  Scale,
  Sparkles,
  Copy,
  Check,
  GitBranch,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SpiderIcon } from './Icons';

const WHAT_IF_PRESETS = [
  {
    name: '36-Hour Hackathon Dilemma',
    newThing: 'Join a 36-hour weekend Web3 hackathon with my club team',
    estimatedHours: 16,
  },
  {
    name: 'Part-Time Startup Internship',
    newThing: 'Take on a 15h/week part-time frontend internship with early-stage AI team',
    estimatedHours: 15,
  },
  {
    name: 'Late-Night Gaming / Movie Sprint',
    newThing: 'Stay up until 3:30 AM for a surprise game release with high school friends',
    estimatedHours: 4,
  },
];

export function WhatIfMachine({ onOpenApiModal }) {
  const { tasks, freeHours, tasksAsPromptText, requestScheduleApplication } = useTasks();

  const [newThing, setNewThing] = useState('Join a 36-hour weekend Web3 hackathon with my club team');
  const [estimatedHours, setEstimatedHours] = useState('16');
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Pre-load high impact demo state on initial load
  const [result, setResult] = useState({
    scenarioA: [
      'High-voltage experiential gain and portfolio impact from shipping with your team, but your margin for error on your Thursday Algorithms midterm and Friday paper drops to near zero.',
      'Sleep debt of 8+ hours will compound, creating severe brain fog during next Monday’s lab presentations.',
      'Manageable only if you finish 80% of your systems paper before Friday 5 PM and intentionally deprioritize side-tracks.'
    ],
    scenarioB: [
      'You protect deep revision windows, 7+ hours of nightly sleep, and high execution quality for your existing midterm and paper.',
      'Zero spillover risk: your academic standing, mental composure, and recovery cycles remain completely guarded.',
      'You miss the team camaraderie, resume-worthy project sprint, and potential networking with industry sponsors.'
    ],
    thirdPath: [
      'Accept with a strict scope cap: commit 10 focused daytime hours on Saturday for core frontend/API work, then leave by 9 PM to sleep.',
      'Temporarily defer the Club Frontend project to next week, immediately freeing 2.5 hours of breathing space.',
      'Negotiate with your hackathon teammates upfront so they know you are an MVP contributor, not an all-nighter hero.'
    ],
    verdict: 'Saying yes buys high-stakes opportunity at the direct cost of academic breathing room; saying no protects your grades and peace of mind at the cost of short-term novelty; the Third Path requires firm boundaries to capture the learning without sacrificing your GPA.',
    isSimulated: true,
    rawText: 'SCENARIO A:\n• High-voltage experiential gain...\nSCENARIO B:\n• You protect deep revision windows...\nTHE THIRD PATH:\n• Accept with a strict scope cap...\nVERDICT: Saying yes buys high-stakes opportunity...'
  });

  const handleApplyPreset = (preset) => {
    setNewThing(preset.newThing);
    setEstimatedHours(preset.estimatedHours.toString());
  };

  const handleSimulate = async (e) => {
    e?.preventDefault?.();
    if (!newThing.trim()) return;

    setLoading(true);
    setError(null);
    setProgressStage('Analyzing commitment baseline...');

    try {
      const data = await analyzeWhatIf({
        commitments: tasksAsPromptText,
        newThing: `${newThing.trim()} (~${estimatedHours} hours needed)`,
        structuredTasks: tasks,
        freeHours,
        onProgress: (stage) => setProgressStage(stage),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to simulate decision trajectories.');
    } finally {
      setLoading(false);
      setProgressStage('');
    }
  };

  const handleApplyThirdPath = () => {
    if (!result?.thirdPath) return;

    requestScheduleApplication(result.thirdPath, 'What-If Machine (Third Path)', () => {
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 3500);
    });
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
            <Compass size={22} />
          </div>
          <div className="card-title-group">
            <div className="card-section-label">02 · SIMULATE DIVERGENT FUTURES</div>
            <h2>WHAT-IF MACHINE</h2>
            <p>Simulate the cascading fallout of taking on one more commitment before you commit.</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="presets-container">
          <span className="presets-label">Presets:</span>
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
        {/* Baseline Commitments Preview */}
        <div className="commitments-baseline-strip">
          <div className="baseline-header">
            <span className="baseline-title">
              <Layers size={13} /> Active Commitments Baseline:
            </span>
            <span className="baseline-hours">{tasks.length} tasks · {tasks.reduce((s, t) => s + t.duration, 0)}h total</span>
          </div>
          <div className="baseline-chips">
            {tasks.map(t => (
              <span key={t.id} className="baseline-chip">
                {t.title} ({t.duration}h)
              </span>
            ))}
          </div>
        </div>

        <div className="form-row two-col" style={{ marginTop: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-thing-input">
              <span>What if I take on...</span>
              <span className="form-hint">The new event, project, role, or temptation</span>
            </label>
            <textarea
              id="new-thing-input"
              className="input-field"
              rows={2}
              placeholder="e.g. Join a 36-hour weekend Web3 hackathon with my club team..."
              value={newThing}
              onChange={(e) => setNewThing(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-hours-input">
              <span>Estimated Hours Needed</span>
              <span className="form-hint">Approximate time required</span>
            </label>
            <input
              id="new-hours-input"
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              className="input-field"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g. 16"
            />
          </div>
        </div>

        <div className="btn-group">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !newThing.trim()}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>{progressStage || 'Simulating Decision...'}</span>
              </>
            ) : (
              <>
                <GitBranch size={16} />
                Simulate Scenarios & The Third Path
              </>
            )}
          </button>
        </div>
      </form>

      {appliedNotice && (
        <div className="notice-banner success" style={{ marginTop: '1rem' }}>
          <CheckCircle2 size={15} />
          <span>The Third Path schedule applied! Boundaries established in your schedule.</span>
        </div>
      )}

      {error && (
        <div className="notice-banner error" style={{ marginTop: '1rem' }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="result-container">
          <div className="result-badge-bar">
            <div className="result-badge" style={{ background: 'rgba(196, 30, 58, 0.15)', color: 'var(--off-white)' }}>
              <Scale size={14} style={{ color: 'var(--crimson)' }} />
              Divergent Trajectories · 3 Paths Evaluated
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {result.isSimulated && (
                <span
                  className="status-demo"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
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
                {copied ? 'Copied' : 'Copy All'}
              </button>
            </div>
          </div>

          {/* Three Paths Grid: Scenario A, Scenario B, The Third Path */}
          <div className="scenarios-three-grid">
            {/* Scenario A: Accept */}
            <div className="scenario-card accept">
              <div className="scenario-header">
                <div>
                  <h3 className="scenario-title">SCENARIO A</h3>
                  <div className="scenario-sub red">Accept Opportunity</div>
                </div>
                <span className="scenario-badge accept-badge">High Risk / High Upside</span>
              </div>
              <ul className="scenario-bullets">
                {result.scenarioA.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Scenario B: Decline */}
            <div className="scenario-card decline">
              <div className="scenario-header">
                <div>
                  <h3 className="scenario-title">SCENARIO B</h3>
                  <div className="scenario-sub blue">Decline & Guard Base</div>
                </div>
                <span className="scenario-badge decline-badge">Stability & Buffer</span>
              </div>
              <ul className="scenario-bullets">
                {result.scenarioB.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* The Third Path: Accept with Adjustments */}
            <div className="scenario-card third-path">
              <div className="scenario-header">
                <div>
                  <h3 className="scenario-title">THE THIRD PATH</h3>
                  <div className="scenario-sub emerald">Accept with Adjustments</div>
                </div>
                <span className="scenario-badge third-path-badge">Disciplined Compromise</span>
              </div>
              <ul className="scenario-bullets">
                {result.thirdPath.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-secondary third-path-apply-btn"
                onClick={handleApplyThirdPath}
              >
                <Sliders size={13} /> Apply Adjusted Schedule
              </button>
            </div>
          </div>

          {/* Verdict Card */}
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
