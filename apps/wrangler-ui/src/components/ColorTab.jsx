import { useState } from 'react';

const NAMED = [
  ['red', [255, 0, 0]], ['orange', [255, 100, 0]], ['yellow', [255, 220, 0]],
  ['green', [0, 200, 0]], ['cyan', [0, 200, 200]], ['blue', [0, 0, 255]],
  ['purple', [180, 0, 255]], ['pink', [255, 120, 180]], ['white', [255, 255, 255]],
  ['black', [0, 0, 0]],
];

const EMOJI_COLORS = [
  ['🔴', [255, 0, 0]], ['🟢', [0, 200, 0]], ['🔵', [0, 0, 255]],
  ['🟠', [255, 100, 0]], ['🟡', [255, 220, 0]], ['🟣', [180, 0, 255]],
  ['⚪', [255, 255, 255]], ['⚫', [0, 0, 0]],
];

function parseHex(h) {
  const s = h.replace('#', '');
  if (s.length === 3) return [0, 1, 2].map((i) => parseInt(s[i] + s[i], 16));
  if (s.length === 6) return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  return null;
}

export default function ColorTab({ onSend }) {
  const [hex, setHex] = useState('#ff7a00');

  const sendRgb = ([r, g, b]) => {
    onSend({ kind: 'color', color: { r, g, b } });
  };

  const sendHex = () => {
    const rgb = parseHex(hex);
    if (rgb) sendRgb(rgb);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {NAMED.map(([name, rgb]) => (
          <button key={name} onClick={() => sendRgb(rgb)}
            style={{ padding: '0.5rem 1rem', background: `rgb(${rgb.join(',')})`, color: '#000', border: '1px solid var(--border)' }}>
            {name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label>Hex</label>
        <input value={hex} onChange={(e) => setHex(e.target.value)} style={{ padding: '0.4rem' }} />
        <span style={{ display: 'inline-block', width: '2rem', height: '1.5rem', background: hex, border: '1px solid var(--border)' }} />
        <button onClick={sendHex}>send</button>
      </div>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {EMOJI_COLORS.map(([e, rgb]) => (
          <button key={e} onClick={() => sendRgb(rgb)} style={{ fontSize: '1.5rem' }}>{e}</button>
        ))}
      </div>
    </div>
  );
}
