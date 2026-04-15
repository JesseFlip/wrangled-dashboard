import { useState } from 'react';
import DeviceGrid from '../components/DeviceGrid.jsx';
import ControlPanel from '../components/ControlPanel.jsx';

export default function ControlView() {
  const [selectedMac, setSelectedMac] = useState(null);
  const [devices, setDevices] = useState([]);
  const [applyToAll, setApplyToAll] = useState(false);

  const sendCommand = (command) => console.log('send', command);

  return (
    <div>
      <DeviceGrid
        selectedMac={selectedMac}
        onSelect={setSelectedMac}
        onDevicesLoaded={setDevices}
      />
      {(selectedMac || applyToAll) && devices.length >= 0 && (
        <div style={{ padding: '0 var(--sp-4)' }}>
          <ControlPanel
            onSend={sendCommand}
            applyToAll={applyToAll}
            onToggleAll={setApplyToAll}
          />
        </div>
      )}
    </div>
  );
}
