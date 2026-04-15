import { useEffect, useState } from 'react';
import { api } from '../api.js';
import DeviceCard from './DeviceCard.jsx';

export default function DeviceGrid({ selectedMac, onSelect, onDevicesLoaded }) {
  const [devices, setDevices] = useState([]);
  const [liveState, setLiveState] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  const loadDevices = () => {
    api.listDevices()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.devices ?? []);
        setDevices(list);
        onDevicesLoaded?.(list);
        setError(null);
      })
      .catch((e) => setError(e.message));
  };

  // Poll device list every 5s
  useEffect(() => {
    loadDevices();
    const h = setInterval(loadDevices, 5000);
    return () => clearInterval(h);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll live state for selected device every 2s
  useEffect(() => {
    if (!selectedMac) { setLiveState(null); return undefined; }
    let cancelled = false;
    const poll = async () => {
      try {
        const s = await api.getState(selectedMac);
        if (!cancelled) setLiveState(s);
      } catch {
        // silently ignore — card shows — state
      }
    };
    poll();
    const h = setInterval(poll, 2000);
    return () => { cancelled = true; clearInterval(h); };
  }, [selectedMac]);

  const handleRescan = async () => {
    setScanning(true);
    try {
      await api.rescan();
      await new Promise((r) => setTimeout(r, 1000));
      loadDevices();
    } finally {
      setScanning(false);
    }
  };

  const handleRenamed = () => { loadDevices(); };

  return (
    <div>
      <div className="inline-row" style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {devices.length} device{devices.length !== 1 ? 's' : ''} found
        </span>
        <button
          className="btn btn-ghost"
          style={{ marginLeft: 'auto' }}
          disabled={scanning}
          onClick={handleRescan}
        >
          {scanning ? 'Scanning…' : 'Rescan 🔄'}
        </button>
      </div>
      {error && <div className="banner-error">{error}</div>}
      {devices.length === 0 && !error && (
        <p className="empty-state">No devices found. Try rescanning.</p>
      )}
      <div className="device-grid">
        {devices.map((d) => (
          <DeviceCard
            key={d.mac}
            device={d}
            liveState={selectedMac === d.mac ? liveState : null}
            isSelected={selectedMac === d.mac}
            onSelect={onSelect}
            onRenamed={handleRenamed}
          />
        ))}
      </div>
    </div>
  );
}
