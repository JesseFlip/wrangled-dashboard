import { useEffect, useState } from 'react';
import { api } from '../api.js';

function fxLabel(fxId) {
  if (fxId === undefined || fxId === null) return '';
  return `fx ${fxId}`;
}

function Swatch({ rgb }) {
  if (!rgb || rgb.length < 3) return null;
  const [r, g, b] = rgb;
  return (
    <span style={{
      display: 'inline-block', width: '1rem', height: '1rem',
      backgroundColor: `rgb(${r},${g},${b})`, border: '1px solid var(--border)',
      verticalAlign: 'middle', marginRight: '0.25rem',
    }} />
  );
}

export default function LiveState({ selectedMac }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedMac) return undefined;
    let cancelled = false;

    const poll = async () => {
      try {
        const s = await api.getState(selectedMac);
        if (!cancelled) { setState(s); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };
    poll();
    const handle = setInterval(poll, 2000);
    return () => { cancelled = true; clearInterval(handle); };
  }, [selectedMac]);

  if (!selectedMac) return null;
  if (error) return <section style={{ padding: '0.5rem 1rem', color: '#ffb0b0' }}>Live state: {error}</section>;
  if (!state) return <section style={{ padding: '0.5rem 1rem', color: 'var(--muted)' }}>Live state: loading…</section>;

  const seg = state.seg?.[0] || {};
  const col = seg.col?.[0];

  return (
    <section style={{ padding: '0.75rem 1rem', background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.95rem' }}>
        <span>{state.on ? '● ON' : '○ off'}</span>
        <span>bri {state.bri}</span>
        <span>{fxLabel(seg.fx)}</span>
        <span><Swatch rgb={col} />{col ? `rgb(${col.join(',')})` : ''}</span>
      </div>
    </section>
  );
}
