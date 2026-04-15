import { useCallback, useState } from 'react';
import DeviceGrid from '../components/DeviceGrid.jsx';
import ControlPanel from '../components/ControlPanel.jsx';
import SystemFooter from '../components/SystemFooter.jsx';
import { api } from '../api.js';

export default function ControlView() {
  const [selectedMac, setSelectedMac] = useState(null);
  const [devices, setDevices] = useState([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [error, setError] = useState(null);

  const sendCommand = useCallback(async (command) => {
    const targets = applyToAll ? devices.map((d) => d.mac) : selectedMac ? [selectedMac] : [];
    if (!targets.length) return;

    const results = await Promise.allSettled(
      targets.map((mac) => api.sendCommand(mac, command)),
    );
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      setError(`${results.length - failed.length}/${results.length} succeeded`);
    } else {
      setError(null);
    }
  }, [applyToAll, devices, selectedMac]);

  return (
    <div>
      {error && <div className="banner-error">{error}</div>}
      <DeviceGrid
        selectedMac={selectedMac}
        onSelect={setSelectedMac}
        onDevicesLoaded={setDevices}
      />
      {(selectedMac || applyToAll) && (
        <div style={{ padding: '0 var(--sp-4)' }}>
          <ControlPanel
            onSend={sendCommand}
            applyToAll={applyToAll}
            onToggleAll={setApplyToAll}
          />
        </div>
      )}
      <SystemFooter />
    </div>
  );
}
