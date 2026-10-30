import React, { useState } from 'react';
import { analyzeRealityCheck } from '../services/gemini';
import { Clock, AlertTriangle, CheckCircle2, Sparkles, Copy, Check } from 'lucide-react';

const PRESETS = [
  {
    name: 'Overloaded Day (8h tasks vs 5h free)',
    tasks: '3 hours coding, 2 hours study, 1 hour gym, 2 hours assignment',
    freeHours: 5,
  },
  {
    name: 'Balanced Midweek (4.5h tasks vs 6h free)',
    tasks: '2 hours discrete math problem set, 1.5 hours club web project, 1 hour gym',
    freeHours: 6,
  },
  {
    name: 'Exam Crunch (7h tasks vs 3h free)',
    tasks: '4 hours OS revision, 2 hours lab report, 1 hour group meeting',
    freeHours: 3,
  },
];

export function RealityCheck({ onOpenApiModal }) {
  const [tasks, setTasks] = useState('');
  const [freeHours, setFreeHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleApplyPreset = (preset) => {
    setTasks(preset.tasks);
    setFreeHours(preset.freeHours.toString());
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!tasks.trim() || !freeHours) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeRealityCheck({
        tasks: tasks.trim(),
        freeHours: freeHours.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze schedule. Please try again.');
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
    <section className="feature-card" id="reality-check">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon-badge">
            <Clock size={22} />
          </div>
          <div className="card-title-group">
            <h2>REALITY CHECK</h2>
            <p>Audit your day's ambition against the harsh math of available hours.</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="presets-container">
          <span style={{ fontSize: '0.74rem', color: 'var(--off-white-dim)', marginRight: '0.2rem' }}>
            Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset(p)}
              title={p.tasks}
            >
              {p.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAnalyze}>
        <div className="form-row two-col">
          <div className="form-group">
            <label className="form-label" htmlFor="daily-tasks">
              <span>Today's Planned Tasks & Estimates</span>
              <span className="form-hint">e.g. 3h coding, 2h study, 1h gym</span>
            </label>
            <textarea
              id="daily-tasks"
              className="input-field"
              rows={4}
              placeholder="3 hours coding, 2 hours study, 1 hour gym, 2 hours assignment..."
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="free-hours">
              <span>Actual Free Hours</span>
              <span className="form-hint">Excl. classes & sleep</span>
            </label>
            <input
              id="free-hours"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              className="input-field"
              placeholder="e.g. 5"
              value={freeHours}
              onChange={(e) => setFreeHours(e.target.value)}
              required
            />
            <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--off-white-dim)' }}>
              Spider-Sense will evaluate cognitive load, buffer limits, and generate a trimmed schedule.
            </div>
          </div>
        </div>

        <div className="btn-group">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !tasks.trim() || !freeHours}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing Schedule...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Run Reality Check
              </>
            )}
          </button>

          {tasks && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setTasks('');
                setFreeHours('');
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

      {/* Result Card: Fades in smoothly (0.3s ease-in) */}
      {result && (
        <div className="result-container">
          <div className="result-badge-bar">
            <div
              className={`result-badge ${
                result.isOverloaded ? 'badge-overloaded' : 'badge-realistic'
              }`}
            >
              {result.isOverloaded ? (
                <>
                  <AlertTriangle size={14} />
                  Overload Flagged
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Schedule Feasible
                </>
              )}
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
                {copied ? 'Copied' : 'Copy Plan'}
              </button>
            </div>
          </div>

          <div className="result-card-inner">
            <ul>
              {result.lines.map((line, idx) => {
                const isHeading = line.startsWith('• Revised Schedule:') || line.startsWith('• Prioritised Execution:');
                const isSubBullet = line.startsWith('-') || line.startsWith('  -') || line.startsWith('P1') || line.startsWith('P2');
                
                return (
                  <li
                    key={idx}
                    style={{
                      fontWeight: isHeading ? '600' : '400',
                      color: isHeading ? '#ff8598' : 'var(--off-white)',
                      paddingLeft: isSubBullet ? '2.2rem' : '1.4rem',
                    }}
                  >
                    {line.replace(/^[•\-*]\s*/, '')}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
