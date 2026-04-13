import { useState } from 'react';

export default function TextTab({ onSend }) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ff7a00');
  const [speed, setSpeed] = useState(128);

  const send = () => {
    if (!text.trim()) return;
    const hex = color.startsWith('#') ? color.slice(1) : color;
    const cmd = { kind: 'text', text, speed };
    if (hex.length === 6) {
      cmd.color = {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    onSend(cmd);
  };

  return (
    <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem', maxWidth: '32rem' }}>
      <label>Text ({text.length}/64):
        <input maxLength={64} value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%' }} />
      </label>
      <label>Color:
        <input value={color} onChange={(e) => setColor(e.target.value)} />
      </label>
      <label>Speed ({speed}):
        <input type="range" min={32} max={240} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: '100%' }} />
      </label>
      <button onClick={send} style={{ padding: '0.6rem 1rem' }}>Send text</button>
    </div>
  );
}
