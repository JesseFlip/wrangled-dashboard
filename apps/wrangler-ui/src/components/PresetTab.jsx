import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function PresetTab({ onSend }) {
  const [presets, setPresets] = useState([]);
  useEffect(() => { api.listPresets().then((d) => setPresets(d.presets)).catch(() => {}); }, []);
  return (
    <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }}>
      {presets.map((name) => (
        <button key={name} onClick={() => onSend({ kind: 'preset', name })}
          style={{ padding: '1rem 1.5rem', fontSize: '1rem' }}>{name}</button>
      ))}
    </div>
  );
}
