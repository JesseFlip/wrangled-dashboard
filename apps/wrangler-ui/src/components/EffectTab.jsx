import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function EffectTab({ onSend }) {
  const [effects, setEffects] = useState([]);
  const [name, setName] = useState('rainbow');
  const [speed, setSpeed] = useState(128);
  const [intensity, setIntensity] = useState(128);
  const [color, setColor] = useState('');

  useEffect(() => { api.listEffects().then((d) => setEffects(d.effects)).catch(() => {}); }, []);

  const send = () => {
    const cmd = { kind: 'effect', name, speed, intensity };
    if (color.trim()) {
      const hex = color.startsWith('#') ? color.slice(1) : color;
      if (hex.length === 6) {
        cmd.color = {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        };
      }
    }
    onSend(cmd);
  };

  return (
    <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem', maxWidth: '32rem' }}>
      <label>
        Effect:{' '}
        <select value={name} onChange={(e) => setName(e.target.value)} style={{ marginLeft: '0.5rem' }}>
          {effects.map((e) => (<option key={e} value={e}>{e}</option>))}
        </select>
      </label>
      <label>Speed ({speed}):
        <input type="range" min={0} max={255} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: '100%' }} />
      </label>
      <label>Intensity ({intensity}):
        <input type="range" min={0} max={255} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} style={{ width: '100%' }} />
      </label>
      <label>Color (#hex, optional):
        <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#ff7a00" />
      </label>
      <button onClick={send} style={{ padding: '0.6rem 1rem' }}>Fire effect 🔥</button>
    </div>
  );
}
