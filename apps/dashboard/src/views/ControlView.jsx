import { useState } from 'react';
import DeviceGrid from '../components/DeviceGrid.jsx';

export default function ControlView() {
  const [selectedMac, setSelectedMac] = useState(null);
  const [devices, setDevices] = useState([]);

  return (
    <div>
      <DeviceGrid
        selectedMac={selectedMac}
        onSelect={setSelectedMac}
        onDevicesLoaded={setDevices}
      />
      {devices.length > 0 && (
        <p className="empty-state">Controls coming in the next commit...</p>
      )}
    </div>
  );
}
