import { useCallback, useEffect, useState } from 'react';
import DeviceSelector from './components/DeviceSelector.jsx';
import LiveState from './components/LiveState.jsx';
import { api } from './api.js';

const STORAGE_KEY = 'wrangler.selectedMac';

export default function App() {
  const [devices, setDevices] = useState([]);
  const [selectedMac, setSelectedMac] = useState(localStorage.getItem(STORAGE_KEY));
  const [error, setError] = useState(null);

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
    } catch (e) {
      setError(e.message);
    }
  }, [selectedMac]);

  useEffect(() => { refreshDevices(); }, [refreshDevices]);

  const handleSelect = (mac) => {
    setSelectedMac(mac);
    localStorage.setItem(STORAGE_KEY, mac);
  };

  const handleRescan = async () => {
    try {
      const { devices } = await api.rescan();
      setDevices(devices);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <DeviceSelector
        devices={devices}
        selectedMac={selectedMac}
        onSelect={handleSelect}
        onRescan={handleRescan}
        onRenamed={refreshDevices}
      />
      {error && (
        <div style={{ padding: '0.5rem 1rem', background: '#3a1212', color: '#ffd6d6' }}>
          {error}
        </div>
      )}
      {selectedMac && <LiveState selectedMac={selectedMac} />}
      {!devices.length && (
        <p style={{ padding: '1rem', color: 'var(--muted)' }}>
          No devices found. Click Rescan to search the LAN.
        </p>
      )}
    </div>
  );
}
