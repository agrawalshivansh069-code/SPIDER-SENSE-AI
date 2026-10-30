import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import { SpiderIcon } from './Icons';

export function ConfirmationModal({ modalState, onClose }) {
  if (!modalState || !modalState.isOpen) return null;

  const { origin, proposedSchedule, onConfirm, onCancel } = modalState;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card confirmation-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <div className="confirmation-icon-wrapper">
            <ShieldAlert size={22} color="var(--crimson)" />
          </div>
          <div>
            <h3 className="modal-title">Apply Suggested Schedule?</h3>
            <p className="confirmation-origin-sub">
              Originating from <strong>{origin || 'Spider-Sense AI Engine'}</strong>
            </p>
          </div>
        </div>

        <p className="confirmation-desc">
          Spider-Sense is ready to synchronize your active daily tasks with this triaged schedule.
          This will update your shared plan across Reality Check, What-If Machine, and Emergency Replanner.
        </p>

        {proposedSchedule && proposedSchedule.length > 0 && (
          <div className="confirmation-schedule-preview">
            <div className="preview-label">Proposed Schedule Blocks:</div>
            <ul>
              {proposedSchedule.slice(0, 4).map((item, idx) => (
                <li key={idx}>
                  <SpiderIcon size={12} color="#C41E3A" style={{ marginRight: '6px', flexShrink: 0 }} />
                  <span>{typeof item === 'string' ? item : item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="confirmation-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              onCancel?.();
              onClose?.();
            }}
          >
            <X size={15} /> Cancel & Keep Current Plan
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            <Check size={16} /> Confirm & Apply Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
