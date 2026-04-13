import { useState } from 'react';

export default function BrightnessSlider({ onCommit }) {
  const [value, setValue] = useState(80);
  return (
    <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <label>Brightness</label>
      <input
        type="range"
        min={0}
        max={200}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onPointerUp={() => onCommit(value)}
        onKeyUp={() => onCommit(value)}
        style={{ flex: 1 }}
      />
      <span style={{ minWidth: '4ch', textAlign: 'right' }}>{value} / 200</span>
    </div>
  );
}
