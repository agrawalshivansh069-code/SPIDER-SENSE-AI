import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { analyzeEmergencyReplanner } from '../services/gemini';
import {
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { SpiderIcon } from './Icons';

const EMERGENCY_PRESETS = [
  {
    title: 'Surprise Java Lab Assignment',
    event: 'Surprise Java recursion assignment just dropped, due tomorrow at 9:00 AM sharp.',
    hours: 3.5,
    deadline: 'Tomorrow 9:00 AM',
  },
  {
    title: 'Sudden Family Emergency',
    event: 'Urgent family situation requires me to travel home for 4 hours this evening.',
    hours: 4,
    deadline: 'Tonight 10:00 PM',
  },
  {
    title: 'Severe Migraine / Sickness',
    event: 'Debilitating migraine: must sleep for 3 hours now during peak study window.',
    hours: 3,
    deadline: 'Immediate',
  },
];

export function EmergencyReplanner({ onOpenApiModal }) {
  const { tasks, freeHours, constraints, setAllTasks, requestScheduleApplication } = useTasks();

  const [emergencyText, setEmergencyText] = useState('Surprise Java recursion assignment just dropped, due tomorrow at 9:00 AM sharp.');
  const [hoursNeeded, setHoursNeeded] = useState('3.5');
  const [deadline, setDeadline] = useState('Tomorrow 9:00 AM');
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Pre-load default emergency triage result so it is immediately demonstrable
  const [result, setResult] = useState({
    protectedItems: [
      'Algorithms Midterm Revision (3.0h) — LOCKED: Exam is Thursday 9:00 AM and carries 30% of grade.',
      'Distributed Systems Paper (2.5h) — CRITICAL: Friday 5:00 PM deadline requires minimum viable draft tonight.'
    ],
    deferredItems: [
      'Club Frontend Web Project (1.5h) — POSTPONED to Saturday afternoon with zero grade penalty.',
      'Gym & Recovery Workout (1.0h) — COMPRESSED into a 20-minute stretching reset right before bed.'
    ],
    revisedSchedule: [
      '6:00 PM – 9:30 PM: Emergency Sprint on Surprise Java Recursion Assignment (submission ready).',
      '9:30 PM – 10:00 PM: High-nutrition dinner & 20-min mental reset.',
      '10:00 PM – 12:30 AM: Algorithms Midterm Deep Review (protected core formulas).',
      'Tomorrow 7:30 AM: Final proof of Distributed Systems draft before class.'
    ],
    rationale: 'By ring-fencing your Thursday Algorithms midterm and deferring the flexible club project to Saturday, the unexpected Java assignment is completed 12 hours before deadline without pulling an all-nighter.',
    isSimulated: true,
    rawText: 'PROTECTED:\n• Algorithms Midterm Revision...\nCOMPRESSED & DEFERRED:\n• Club Frontend Web Project...\nEMERGENCY REVISED SCHEDULE:\n• 6:00 PM – 9:30 PM: Emergency Sprint...\nRATIONALE: By ring-fencing your Thursday midterm...'
  });

  const handleApplyPreset = (preset) => {
    setEmergencyText(preset.event);
    setHoursNeeded(preset.hours.toString());
    setDeadline(preset.deadline);
  };

  const handleReplanning = async (e) => {
    e?.preventDefault?.();
    if (!emergencyText.trim() || !hoursNeeded) return;

    setLoading(true);
    setError(null);
    setProgressStage('Parsing crisis urgency & capacity impact...');

    try {
      const data = await analyzeEmergencyReplanner({
        unexpectedEvent: emergencyText.trim(),
        hoursRequired: parseFloat(hoursNeeded) || 3,
        deadline: deadline.trim(),
        existingTasks: tasks,
        freeHours,
        constraints,
        onProgress: (stage) => setProgressStage(stage),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to triage emergency. Please check inputs.');
    } finally {
      setLoading(false);
      setProgressStage('');
    }
  };

  const handleApplyEmergencySchedule = () => {
    if (!result?.revisedSchedule) return;

    requestScheduleApplication(result.revisedSchedule, 'Emergency Replanner Protocol', () => {
      // Synchronize shared tasks: insert emergency task as fixed, compress flexible tasks
      const emergencyTask = {
        id: `emergency-${Date.now()}`,
        title: `CRISIS: ${emergencyText.slice(0, 42)}`,
        duration: parseFloat(hoursNeeded) || 3,
        deadline: deadline || 'Urgent',
        priority: 'high',
        type: 'fixed',
      };

      const adjustedExisting = tasks.map(t => {
        if (t.type === 'flexible') {
          return { ...t, duration: Math.max(0.5, Number((t.duration * 0.4).toFixed(1))), notes: 'Compressed in emergency triage' };
        }
        return t;
      });

      setAllTasks([emergencyTask, ...adjustedExisting]);
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 4000);
    });
  };

  const handleCopy = () => {
    if (!result?.rawText) return;
    navigator.clipboard.writeText(result.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="feature-card emergency-card" id="emergency-replanner">
      {/* Header */}
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon-badge emergency-icon-badge">
            <AlertOctagon size={22} />
          </div>
          <div className="card-title-group">
            <div className="card-section-label emergency-label">03 · CRISIS TRIAGE & ADAPTATION</div>
            <h2>EMERGENCY REPLANNER</h2>
            <p>Something unexpected happened. Reorganise your schedule without catastrophic burnout.</p>
          </div>
        </div>

        {/* Quick Crisis Presets */}
        <div className="presets-container">
          <span className="presets-label">Crisis Presets:</span>
          {EMERGENCY_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset(p)}
              title={p.event}
            >
              {p.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleReplanning}>
        <div className="form-group">
          <label className="form-label" htmlFor="emergency-event-input">
            <span>What unexpected responsibility just arrived?</span>
            <span className="form-hint">Surprise assignment, family call, hardware failure, illness</span>
          </label>
          <textarea
            id="emergency-event-input"
            className="input-field emergency-textarea"
            rows={2}
            placeholder="e.g. I just received a Java assignment that must be submitted tomorrow at 9 AM..."
            value={emergencyText}
            onChange={(e) => setEmergencyText(e.target.value)}
            required
          />
        </div>

        <div className="form-row two-col">
          <div className="form-group">
            <label className="form-label" htmlFor="emergency-hours-input">
              <span>Estimated Hours Required</span>
              <span className="form-hint">Time needed to resolve crisis</span>
            </label>
            <input
              id="emergency-hours-input"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              className="input-field"
              value={hoursNeeded}
              onChange={(e) => setHoursNeeded(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emergency-deadline-input">
              <span>Hard Deadline for the Emergency</span>
              <span className="form-hint">When must this be finished?</span>
            </label>
            <input
              id="emergency-deadline-input"
              type="text"
              className="input-field"
              placeholder="e.g. Tomorrow 9:00 AM"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="btn-group">
          <button
            type="submit"
            className="btn-primary emergency-action-btn"
            disabled={loading || !emergencyText.trim() || !hoursNeeded}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>{progressStage || 'Executing Emergency Triage...'}</span>
              </>
            ) : (
              <>
                <ShieldAlert size={16} />
                Activate Emergency Triage Protocol
              </>
            )}
          </button>
        </div>
      </form>

      {appliedNotice && (
        <div className="notice-banner success" style={{ marginTop: '1.25rem' }}>
          <CheckCircle2 size={15} />
          <span>Emergency schedule applied! Crisis inserted into your active plan, non-vital tasks compressed.</span>
        </div>
      )}

      {error && (
        <div className="notice-banner error" style={{ marginTop: '1.25rem' }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Emergency Results Section */}
      {result && (
        <div className="result-container">
          <div className="result-badge-bar">
            <div className="result-badge badge-emergency">
              <ShieldAlert size={14} />
              Emergency Triage Matrix Active
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
                {copied ? 'Copied' : 'Copy Triage Plan'}
              </button>
            </div>
          </div>

          {/* Triage Grid: Protected vs Deferred */}
          <div className="emergency-triage-grid">
            <div className="triage-card triage-protected">
              <div className="triage-header">
                <Lock size={15} color="#5B9BD5" />
                <span>PROTECTED (Non-Negotiable)</span>
              </div>
              <ul className="triage-list">
                {result.protectedItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="triage-card triage-deferred">
              <div className="triage-header">
                <Clock size={15} color="#ff8598" />
                <span>COMPRESSED & DEFERRED</span>
              </div>
              <ul className="triage-list">
                {result.deferredItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Revised Action Schedule Timeline */}
          <div className="revised-timeline-card">
            <div className="timeline-header">
              <SpiderIcon size={16} color="#C41E3A" />
              <span>TIME-BLOCKED REVISED ACTION SCHEDULE</span>
            </div>

            <div className="timeline-steps">
              {result.revisedSchedule.map((step, idx) => (
                <div key={idx} className="timeline-step">
                  <div className="step-marker">{idx + 1}</div>
                  <div className="step-content">{step}</div>
                </div>
              ))}
            </div>

            {/* Rationale explanation */}
            {result.rationale && (
              <div className="rationale-banner">
                <span className="rationale-tag">WHY THIS WORKS:</span>
                <span>{result.rationale}</span>
              </div>
            )}

            {/* User Confirmation Action Button */}
            <div className="emergency-apply-bar">
              <button
                type="button"
                className="btn-primary emergency-confirm-btn"
                onClick={handleApplyEmergencySchedule}
              >
                <TrendingUp size={15} /> Confirm & Apply Revised Plan to Active Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
