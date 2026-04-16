import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import AuthGate from './components/AuthGate.jsx';
import GlobalBar from './components/GlobalBar.jsx';
import TabBar from './components/TabBar.jsx';
import CommandView from './views/CommandView.jsx';
import StoryView from './views/StoryView.jsx';
import StreamView from './views/StreamView.jsx';
import ToolkitView from './views/ToolkitView.jsx';

function useHash() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const onHash = () => setHash(location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const isAbout = hash === '#/about';

  const [tab, setTab] = useState('stream');
  const [group, setGroup] = useState('all');
  const [groups, setGroups] = useState(['all']);
  const [brightness, setBrightness] = useState(128);
  const [color, setColor] = useState('#3b82f6');
  const [deviceCount, setDeviceCount] = useState(0);
  const [discordActive, setDiscordActive] = useState(false);

  // Poll groups, devices, and health every 10s
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [devicesRes, healthRes] = await Promise.allSettled([
          api.listDevices(),
          fetch('/healthz').then((r) => r.json()),
        ]);

        if (cancelled) return;

        if (devicesRes.status === 'fulfilled') {
          const devices = devicesRes.value;
          setDeviceCount(Array.isArray(devices) ? devices.length : 0);

          // Derive groups from device tags if available, fallback to ['all']
          const tagSet = new Set(['all']);
          if (Array.isArray(devices)) {
            for (const d of devices) {
              if (d.group) tagSet.add(d.group);
            }
          }
          setGroups([...tagSet]);
        }

        if (healthRes.status === 'fulfilled' && healthRes.value) {
          setDiscordActive(Boolean(healthRes.value.discord));
        }
      } catch {
        // ignore poll errors
      }
    }

    poll();
    const id = setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const handleBrightnessChange = useCallback(
    (val) => {
      setBrightness(val);
      api.sendCommand(group === 'all' ? '*' : group, { kind: 'brightness', brightness: val }).catch(() => {});
    },
    [group],
  );

  const handleKill = useCallback(() => {
    if (window.confirm('Emergency OFF — kill all lights?')) {
      api.modEmergencyOff().catch(() => {});
    }
  }, []);

  // About / Story view — separate layout
  if (isAbout) {
    return (
      <AuthGate>
        <div className="app-shell">
          <nav className="app-header">
            <a href="#/" className="nav-link">
              &larr; Back
            </a>
          </nav>
          <StoryView />
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="mobile-shell">
        <GlobalBar
          group={group}
          onGroupChange={setGroup}
          groups={groups}
          brightness={brightness}
          onBrightnessChange={handleBrightnessChange}
          color={color}
          onColorChange={setColor}
          onKill={handleKill}
          deviceCount={deviceCount}
          discordActive={discordActive}
        />
        <main className="tab-content">
          {tab === 'stream' && <StreamView group={group} />}
          {tab === 'command' && <CommandView group={group} />}
          {tab === 'toolkit' && (
            <ToolkitView
              group={group}
              color={color}
              onColorChange={setColor}
              brightness={brightness}
              onBrightnessChange={handleBrightnessChange}
            />
          )}
        </main>
        <TabBar active={tab} onChange={setTab} />
      </div>
    </AuthGate>
  );
}
