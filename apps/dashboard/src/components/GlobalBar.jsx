import { useState } from 'react';

const COLOR_PRESETS = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
];

export default function GlobalBar({
  group,
  onGroupChange,
  groups,
  brightness,
  onBrightnessChange,
  color,
  onColorChange,
  onKill,
  deviceCount,
  discordActive,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="global-bar">
      {/* Status line */}
      <div className="global-status">
        <span className="global-status-devices">
          {deviceCount} device{deviceCount !== 1 ? 's' : ''}
        </span>
        <span className="global-status-right">
          <span
            className={`global-discord-dot ${discordActive ? 'on' : 'off'}`}
            title={discordActive ? 'Discord connected' : 'Discord offline'}
          />
          <button className="global-gear-btn" onClick={() => {}} title="Settings">
            {'\u2699'}
          </button>
          <button className="global-kill-btn" onClick={onKill}>
            KILL
          </button>
        </span>
      </div>

      {/* Group pills */}
      <div className="global-groups">
        {groups.map((g) => (
          <button
            key={g}
            className={`group-pill ${group === g ? 'active' : ''}`}
            onClick={() => onGroupChange(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Brightness + color dot */}
      <div className="global-controls-row">
        <input
          type="range"
          className="global-brightness-slider"
          min={0}
          max={200}
          value={brightness}
          onChange={(e) => onBrightnessChange(Number(e.target.value))}
        />
        <button
          className="global-color-dot"
          style={{ background: color }}
          onClick={() => setPickerOpen((o) => !o)}
          title="Pick color"
        />
      </div>

      {/* Color picker swatches */}
      {pickerOpen && (
        <div className="global-color-picker">
          {COLOR_PRESETS.map((hex) => (
            <button
              key={hex}
              className={`color-swatch ${color === hex ? 'active' : ''}`}
              style={{ background: hex }}
              onClick={() => {
                onColorChange(hex);
                setPickerOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
