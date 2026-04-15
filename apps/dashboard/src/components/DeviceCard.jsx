import { useState } from 'react';
import { api } from '../api.js';

function rgbFrom(col) {
  if (!col || col.length < 3) return null;
  return `rgb(${col[0]},${col[1]},${col[2]})`;
}

function hexFrom(col) {
  if (!col || col.length < 3) return '';
  const to = (n) => n.toString(16).padStart(2, '0');
  return `#${to(col[0])}${to(col[1])}${to(col[2])}`;
}

export default function DeviceCard({ device, liveState, isSelected, onSelect, onRenamed }) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const commitRename = async () => {
    if (!draft.trim()) { setRenaming(false); return; }
    setBusy(true);
    try {
      await api.rename(device.mac, draft.trim());
      onRenamed?.();
    } finally {
      setBusy(false);
      setRenaming(false);
    }
  };

  const seg = liveState?.seg?.[0] || {};
  const col = seg.col?.[0];
  const swatchColor = rgbFrom(col) || 'var(--surface-3)';
  const hex = hexFrom(col);
  const isOn = liveState?.on ?? false;

  const matrixInfo = device.matrix
    ? `${device.matrix.width}×${device.matrix.height}`
    : `${device.led_count} LEDs`;

  return (
    <div
      className={isSelected ? 'device-card selected' : 'device-card'}
      onClick={() => onSelect(device.mac)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(device.mac); }}
    >
      <div className="inline-row" style={{ marginBottom: 'var(--sp-3)' }}>
        {!renaming ? (
          <>
            <strong style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {device.name}
            </strong>
            <button
              className="btn btn-ghost"
              style={{ padding: 'var(--sp-1) var(--sp-2)', fontSize: 'var(--text-xs)' }}
              onClick={(e) => { e.stopPropagation(); setDraft(device.name); setRenaming(true); }}
            >
              ✏️
            </button>
          </>
        ) : (
          <>
            <input
              className="input"
              style={{ flex: 1, fontSize: 'var(--text-sm)' }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setRenaming(false);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <button
              className="btn btn-primary"
              style={{ padding: 'var(--sp-1) var(--sp-2)', fontSize: 'var(--text-xs)' }}
              disabled={busy}
              onClick={(e) => { e.stopPropagation(); commitRename(); }}
            >
              save
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: 'var(--sp-1) var(--sp-2)', fontSize: 'var(--text-xs)' }}
              disabled={busy}
              onClick={(e) => { e.stopPropagation(); setRenaming(false); }}
            >
              ✕
            </button>
          </>
        )}
      </div>

      <div className="live-state" style={{ marginBottom: 'var(--sp-3)' }}>
        <div
          className={isOn ? 'live-swatch on' : 'live-swatch'}
          style={{
            background: liveState ? swatchColor : 'var(--surface-3)',
            '--swatch-glow': isOn ? swatchColor : 'transparent',
            width: '40px',
            height: '40px',
          }}
        />
        <div className="live-meta">
          <div className="live-row">
            <span className={isOn ? 'live-dot on' : 'live-dot off'} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>
              {liveState ? (isOn ? 'ON' : 'OFF') : '—'}
            </span>
            {liveState && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                bri {liveState.bri}
              </span>
            )}
          </div>
          {liveState && (
            <div className="live-row">
              {hex && <span className="live-hex">{hex}</span>}
              {seg.fx != null && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  fx {seg.fx}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)' }}>
        {device.ip} · {matrixInfo}
      </div>
    </div>
  );
}
