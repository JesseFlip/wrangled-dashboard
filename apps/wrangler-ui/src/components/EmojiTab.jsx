import { useEffect, useState } from 'react';
import { api } from '../api.js';

function resolveEmojiCommand(glyph) {
  const table = {
    '🔥': { kind: 'effect', name: 'fire' },
    '🌈': { kind: 'effect', name: 'rainbow' },
    '⚡': { kind: 'effect', name: 'sparkle', speed: 220 },
    '🎉': { kind: 'effect', name: 'fireworks' },
    '🐍': { kind: 'effect', name: 'matrix' },
    '❤️': { kind: 'color', color: { r: 255, g: 0, b: 0 } },
    '💙': { kind: 'color', color: { r: 0, g: 0, b: 255 } },
    '💚': { kind: 'color', color: { r: 0, g: 200, b: 0 } },
    '💜': { kind: 'color', color: { r: 180, g: 0, b: 255 } },
    '🧡': { kind: 'color', color: { r: 255, g: 100, b: 0 } },
    '🖤': { kind: 'power', on: false },
  };
  return table[glyph] || null;
}

export default function EmojiTab({ onSend }) {
  const [labels, setLabels] = useState({});
  useEffect(() => { api.listEmoji().then((d) => setLabels(d.emoji)).catch(() => {}); }, []);
  const glyphs = Object.keys(labels);
  return (
    <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {glyphs.map((g) => {
        const cmd = resolveEmojiCommand(g);
        if (!cmd) return null;
        return (
          <button key={g} onClick={() => onSend(cmd)}
            style={{ padding: '0.6rem 1rem', fontSize: '1.1rem' }}
            title={labels[g]}>
            <span style={{ fontSize: '1.4rem' }}>{g}</span>{' '}
            <small style={{ color: 'var(--muted)' }}>{labels[g]}</small>
          </button>
        );
      })}
    </div>
  );
}
