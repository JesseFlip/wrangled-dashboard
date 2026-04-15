import { useState } from 'react';
import ColorTab from './ColorTab.jsx';
import EffectTab from './EffectTab.jsx';
import TextTab from './TextTab.jsx';
import PresetTab from './PresetTab.jsx';
import EmojiTab from './EmojiTab.jsx';
import BrightnessSlider from './BrightnessSlider.jsx';

const TABS = ['Color', 'Effect', 'Text', 'Preset', 'Emoji'];

export default function ControlPanel({ onSend, applyToAll, onToggleAll }) {
  const [tab, setTab] = useState('Color');

  return (
    <div className="control-surface">
      <div className="inline-row" style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--border-subtle)' }}>
        <label className="field-label" style={{ margin: 0 }}>
          <input type="checkbox" checked={applyToAll} onChange={(e) => onToggleAll(e.target.checked)} />
          {' '}Apply to ALL devices
        </label>
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'tab active' : 'tab'} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>
      <div className="tab-panel">
        {tab === 'Color' && <ColorTab onSend={onSend} />}
        {tab === 'Effect' && <EffectTab onSend={onSend} />}
        {tab === 'Text' && <TextTab onSend={onSend} />}
        {tab === 'Preset' && <PresetTab onSend={onSend} />}
        {tab === 'Emoji' && <EmojiTab onSend={onSend} />}
      </div>
      <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="inline-row" style={{ gap: 'var(--sp-4)' }}>
          <div style={{ flex: 1 }}>
            <BrightnessSlider onCommit={(v) => onSend({ kind: 'brightness', brightness: v })} />
          </div>
          <div className="power-group">
            <button className="btn btn-success" onClick={() => onSend({ kind: 'power', on: true })}>On</button>
            <button className="btn btn-danger" onClick={() => onSend({ kind: 'power', on: false })}>Off</button>
          </div>
        </div>
      </div>
    </div>
  );
}
