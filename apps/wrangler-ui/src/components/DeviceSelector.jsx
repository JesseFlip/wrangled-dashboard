import { useState } from 'react';
import { api } from '../api.js';

export default function DeviceSelector({ devices, selectedMac, onSelect, onRescan, onRenamed }) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const current = devices.find((d) => d.mac === selectedMac);

  const commitRename = async () => {
    if (!current || !draft.trim()) {
      setRenaming(false);
      return;
    }
    setBusy(true);
    try {
      await api.rename(current.mac, draft.trim());
      onRenamed?.();
    } finally {
      setBusy(false);
      setRenaming(false);
    }
  };

  const rescan = async () => {
    setBusy(true);
    try {
      await onRescan?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <header style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
      <strong style={{ fontSize: '1.2rem' }}>Wrangler</strong>
      <select
        value={selectedMac || ''}
        onChange={(e) => onSelect(e.target.value)}
        style={{ padding: '0.4rem', background: 'var(--panel)', color: 'var(--fg)', border: '1px solid var(--border)' }}
      >
        {devices.map((d) => (
          <option key={d.mac} value={d.mac}>{d.name}</option>
        ))}
      </select>
      {current && !renaming && (
        <>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            {current.ip} · {current.matrix ? `${current.matrix.width}x${current.matrix.height}` : `${current.led_count} LEDs`} · v{current.version}
          </span>
          <button onClick={() => { setDraft(current.name); setRenaming(true); }}>✏️ rename</button>
        </>
      )}
      {current && renaming && (
        <>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false); }}
            autoFocus
          />
          <button disabled={busy} onClick={commitRename}>save</button>
          <button disabled={busy} onClick={() => setRenaming(false)}>cancel</button>
        </>
      )}
      <span style={{ flex: 1 }} />
      <button disabled={busy} onClick={rescan}>{busy ? 'Scanning…' : 'Rescan 🔄'}</button>
    </header>
  );
}
