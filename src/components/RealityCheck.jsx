import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { analyzeRealityCheck } from '../services/gemini';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SpiderIcon } from './Icons';

export function RealityCheck({ onOpenApiModal }) {
  const {
    tasks,
    freeHours,
    constraints,
    stats,
    tasksAsPromptText,
    addTask,
    updateTask,
    removeTask,
    setFreeHours,
    setConstraints,
    requestScheduleApplication,
    setAllTasks,
  } = useTasks();

  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // New task quick-entry state
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('1.5');
  const [newPriority, setNewPriority] = useState('medium');
  const [newType, setNewType] = useState('flexible');
  const [newDeadline, setNewDeadline] = useState('');

  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      duration: parseFloat(newDuration) || 1,
      priority: newPriority,
      type: newType,
      deadline: newDeadline.trim(),
    });
    setNewTitle('');
    setNewDeadline('');
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault?.();
    if (tasks.length === 0 || !freeHours) return;

    setLoading(true);
    setError(null);
    setProgressStage('Scanning your commitments...');

    try {
      const data = await analyzeRealityCheck({
        tasks: tasksAsPromptText,
        freeHours: freeHours.toString(),
        constraints,
        structuredTasks: tasks,
        onProgress: (stage) => setProgressStage(stage),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to evaluate plan. Please check inputs.');
    } finally {
      setLoading(false);
      setProgressStage('');
    }
  };

  const handleApplySuggested = () => {
    if (!result?.suggestedPlan) return;

    requestScheduleApplication(result.suggestedPlan, 'Reality Check Engine', () => {
      // Re-map tasks to fit available hours
      const updated = tasks.map((t, idx) => {
        if (t.type === 'fixed') {
          return t; // keep fixed
        }
        // compress flexible tasks
        return {
          ...t,
          duration: Math.max(0.5, Number((t.duration * 0.65).toFixed(1))),
        };
      });
      setAllTasks(updated);
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
    <section className="feature-card" id="reality-check">
      {/* Header */}
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon-badge">
            <Clock size={22} />
          </div>
          <div className="card-title-group">
            <div className="card-section-label">01 · AUDIT YOUR CAPACITY</div>
            <h2>REALITY CHECK</h2>
            <p>Determine whether your day's planned activities fit within your available hours.</p>
          </div>
        </div>

        {/* Deterministic Quick Ratio Pill */}
        <div className="capacity-pill-summary">
          <span className="capacity-label">Workload Ratio:</span>
          <span className={`capacity-value ${stats.isOverloaded ? 'overloaded' : 'feasible'}`}>
            {stats.workloadPercentage}%
          </span>
        </div>
      </div>

      {/* Deterministic Visual Workload Progress Meter */}
      <div className="workload-meter-container">
        <div className="workload-meter-header">
          <div className="meter-stat">
            <span className="meter-label">Planned Time:</span>
            <span className="meter-val">{stats.totalPlanned}h</span>
          </div>
          <div className="meter-stat">
            <span className="meter-label">Available Free Hours:</span>
            <span className="meter-val">{stats.available}h</span>
          </div>
          <div className="meter-stat">
            <span className="meter-label">Capacity Delta:</span>
            <span className={`meter-val ${stats.isOverloaded ? 'text-deficit' : 'text-surplus'}`}>
              {stats.isOverloaded ? `-${stats.overloadHours}h Deficit` : `+${stats.balance}h Cushion`}
            </span>
          </div>
        </div>

        <div className="meter-bar-track">
          <div
            className={`meter-bar-fill ${stats.isOverloaded ? 'bar-overloaded' : 'bar-feasible'}`}
            style={{ width: `${Math.min(stats.workloadPercentage, 100)}%` }}
          />
          {stats.workloadPercentage > 100 && (
            <div
              className="meter-bar-overflow"
              style={{ width: `${Math.min(stats.workloadPercentage - 100, 60)}%` }}
              title={`Overflow: +${stats.overloadHours}h beyond capacity`}
            />
          )}
        </div>
      </div>

      {/* Dynamic Structured Task Manager */}
      <div className="tasks-manager-section">
        <div className="manager-title-bar">
          <span className="manager-title">
            <Layers size={14} /> Active Daily Commitments ({tasks.length})
          </span>
          <span className="manager-sub">
            {stats.fixedHours}h Fixed · {stats.flexibleHours}h Flexible
          </span>
        </div>

        <div className="tasks-list-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`task-item-card ${task.type === 'fixed' ? 'is-fixed' : 'is-flexible'}`}>
              <div className="task-item-main">
                <button
                  type="button"
                  className={`task-type-toggle ${task.type}`}
                  onClick={() => updateTask(task.id, { type: task.type === 'fixed' ? 'flexible' : 'fixed' })}
                  title={task.type === 'fixed' ? 'Fixed commitment (Non-negotiable)' : 'Flexible activity (Can compress/defer)'}
                >
                  {task.type === 'fixed' ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{task.type}</span>
                </button>

                <div className="task-title-area">
                  <span className="task-title-text">{task.title}</span>
                  {task.deadline && (
                    <span className="task-deadline-badge">
                      <Calendar size={11} /> {task.deadline}
                    </span>
                  )}
                </div>
              </div>

              <div className="task-item-controls">
                <span className={`task-priority-badge priority-${task.priority}`}>
                  {task.priority}
                </span>

                <div className="task-duration-picker">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={task.duration}
                    onChange={(e) => updateTask(task.id, { duration: parseFloat(e.target.value) || 0.5 })}
                    className="task-duration-input"
                  />
                  <span className="duration-unit">h</span>
                </div>

                <button
                  type="button"
                  className="task-delete-btn"
                  onClick={() => removeTask(task.id)}
                  aria-label="Remove task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Task Row */}
        <form onSubmit={handleAddNewTask} className="add-task-row">
          <input
            type="text"
            className="input-field task-add-title"
            placeholder="Add task (e.g. Distributed Systems Lab)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="task-add-fields">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              className="input-field task-add-hours"
              placeholder="Hours"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              title="Estimated hours"
            />

            <select
              className="input-field task-add-select"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              title="Priority"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="input-field task-add-select"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              title="Commitment type"
            >
              <option value="flexible">Flexible</option>
              <option value="fixed">Fixed</option>
            </select>

            <input
              type="text"
              className="input-field task-add-deadline"
              placeholder="Deadline (optional)"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
            />

            <button type="submit" className="btn-secondary task-add-btn">
              <Plus size={14} /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Constraints & Available Hours Row */}
      <div className="form-row two-col" style={{ marginTop: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="free-hours-input">
            <span>Actual Free Hours Available Today</span>
            <span className="form-hint">Excl. classes & sleep</span>
          </label>
          <input
            id="free-hours-input"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            className="input-field"
            value={freeHours}
            onChange={(e) => setFreeHours(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="constraints-input">
            <span>Personal Constraints (Optional)</span>
            <span className="form-hint">Non-negotiable sleep, workouts, shifts</span>
          </label>
          <input
            id="constraints-input"
            type="text"
            className="input-field"
            placeholder="e.g. Need 7h sleep, gym is non-negotiable"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="btn-group">
        <button
          type="button"
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={loading || tasks.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner" />
              <span>{progressStage || 'Evaluating Plan...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Evaluate Plan Realism
            </>
          )}
        </button>

        {stats.highPressureTasks.length > 0 && (
          <div className="pressure-summary-tag">
            <AlertTriangle size={13} color="#ff7588" />
            <span>High Pressure: {stats.highPressureTasks.map(t => t.title).slice(0, 2).join(', ')}</span>
          </div>
        )}
      </div>

      {appliedNotice && (
        <div className="notice-banner success">
          <CheckCircle2 size={15} />
          <span>Suggested schedule applied! Tasks compressed and synchronized across the app.</span>
        </div>
      )}

      {error && (
        <div className="notice-banner error">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
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
                  Overload Flagged ({stats.overloadHours}h deficit)
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Schedule Feasible ({stats.balance}h buffer)
                </>
              )}
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
                {copied ? 'Copied' : 'Copy Breakdown'}
              </button>
            </div>
          </div>

          {/* Structured Analysis Card */}
          <div className="result-card-inner">
            <div className="analysis-summary-points">
              {result.lines.map((line, idx) => {
                const isHeading = line.startsWith('• Revised Schedule:') || line.startsWith('• Prioritised Execution:');
                const isSubBullet = line.startsWith('-') || line.startsWith('  -') || line.startsWith('P1') || line.startsWith('P2');

                return (
                  <div
                    key={idx}
                    className={`analysis-line ${isHeading ? 'line-heading' : ''} ${isSubBullet ? 'line-subbullet' : ''}`}
                  >
                    <span className="line-marker">{isHeading ? '❖' : '—'}</span>
                    <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                  </div>
                );
              })}
            </div>

            {/* Apply Schedule Action with User Confirmation */}
            {result.suggestedPlan && (
              <div className="apply-plan-callout">
                <div className="apply-plan-text">
                  <strong>Ready to balance your schedule?</strong> Apply this trimmed layout to your active plan.
                </div>
                <button
                  type="button"
                  className="btn-primary apply-plan-btn"
                  onClick={handleApplySuggested}
                >
                  <TrendingUp size={15} /> Apply Suggested Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
