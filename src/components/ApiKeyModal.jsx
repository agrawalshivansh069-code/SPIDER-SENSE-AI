import React, { useState } from 'react';
import { getStoredApiKey, saveApiKey } from '../services/gemini';
import { X, Key, Check, Trash2, ExternalLink } from 'lucide-react';
import { SpiderWebIcon } from './Icons';

export function ApiKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [keyInput, setKeyInput] = useState(getStoredApiKey() || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveApiKey(keyInput.trim());
    setSavedSuccess(true);
    onKeyUpdated?.(keyInput.trim());
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    saveApiKey('');
    setKeyInput('');
    onKeyUpdated?.('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SpiderWebIcon size={20} color="var(--crimson)" />
            <h3 className="modal-title">Gemini API Key</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--off-white-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Connect your Google Gemini API key to run both <strong>Reality Check</strong> and the{' '}
          <strong>What-If Machine</strong> live via Gemini 1.5 Flash. Your key stays strictly in your browser's localStorage.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="api-key-input">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#ff8598',
                  fontSize: '0.74rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                Get free key <ExternalLink size={11} />
              </a>
            </label>
            <input
              id="api-key-input"
              type="password"
              className="input-field"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            {keyInput ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                style={{ fontSize: '0.8rem', color: '#ff8598' }}
              >
                <Trash2 size={14} />
                Clear Key
              </button>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--off-white-dim)' }}>
                Offline simulation active if left empty.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.1rem' }}>
                {savedSuccess ? (
                  <>
                    <Check size={16} /> Saved!
                  </>
                ) : (
                  <>
                    <Key size={15} /> Save Key
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
