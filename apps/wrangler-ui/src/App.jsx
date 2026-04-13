import { useCallback, useEffect, useState } from 'react';
import DeviceSelector from './components/DeviceSelector.jsx';
import LiveState from './components/LiveState.jsx';
import ColorTab from './components/ColorTab.jsx';
import PowerTab from './components/PowerTab.jsx';
import BrightnessSlider from './components/BrightnessSlider.jsx';
import EffectTab from './components/EffectTab.jsx';
import TextTab from './components/TextTab.jsx';
import PresetTab from './components/PresetTab.jsx';
import EmojiTab from './components/EmojiTab.jsx';
import { api } from './api.js';

const STORAGE_KEY = 'wrangler.selectedMac';
const TABS = ['Color', 'Effect', 'Text', 'Preset', 'Emoji', 'Power'];

export default function App() {
  const [devices, setDevices] = useState([]);
  const [selectedMac, setSelectedMac] = useState(localStorage.getItem(STORAGE_KEY));
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('Color');

  const refreshDevices = useCallback(async () => {
    try {
      const { devices } = await api.listDevices();
      setDevices(devices);
      setError(null);
      if (devices.length && !devices.some((d) => d.mac === selectedMac)) {
        const mac = devices[0].mac;
        setSelectedMac(mac);
        localStorage.setItem(STORAGE_KEY, mac);
      }
    } catch (e) { setError(e.message); }
  }, [selectedMac]);

  useEffect(() => { refreshDevices(); }, [refreshDevices]);

  const sendCommand = async (command) => {
    if (!selectedMac) return;
    try {
      await api.sendCommand(selectedMac, command);
      setError(null);
    } catch (e) { setError(e.message); }
  };

  const sendBrightness = (level) => sendCommand({ kind: 'brightness', brightness: level });

  const handleRescan = async () => {
    try {
      const { devices } = await api.rescan();
      setDevices(devices);
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <DeviceSelector
        devices={devices}
        selectedMac={selectedMac}
        onSelect={(mac) => { setSelectedMac(mac); localStorage.setItem(STORAGE_KEY, mac); }}
        onRescan={handleRescan}
        onRenamed={refreshDevices}
      />
      {error && <div style={{ padding: '0.5rem 1rem', background: '#3a1212', color: '#ffd6d6' }}>{error}</div>}
      {selectedMac && <LiveState selectedMac={selectedMac} />}
      <nav style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '0.4rem 1rem', background: t === tab ? 'var(--accent)' : 'var(--panel)', color: t === tab ? '#000' : 'var(--fg)', border: '1px solid var(--border)' }}>
            {t}
          </button>
        ))}
      </nav>
      {tab === 'Color' && <ColorTab onSend={sendCommand} />}
      {tab === 'Effect' && <EffectTab onSend={sendCommand} />}
      {tab === 'Text' && <TextTab onSend={sendCommand} />}
      {tab === 'Preset' && <PresetTab onSend={sendCommand} />}
      {tab === 'Emoji' && <EmojiTab onSend={sendCommand} />}
      {tab === 'Power' && <PowerTab onSend={sendCommand} />}
      {selectedMac && <BrightnessSlider onCommit={sendBrightness} />}
    </div>
  );
}
