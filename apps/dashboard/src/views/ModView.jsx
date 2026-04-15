import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ModView() {
  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState([]);
  const [banned, setBanned] = useState([]);
  const [devices, setDevices] = useState([]);
  const [locks, setLocks] = useState([]);
  const [error, setError] = useState(null);

  // Ban form
  const [banUserId, setBanUserId] = useState('');
  const [banUsername, setBanUsername] = useState('');
  const [banReason, setBanReason] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [cfg, hist, bans, devs, lks] = await Promise.all([
        api.modConfig(),
        api.modHistory(50),
        api.modBanned(),
        api.listDevices(),
        api.modDeviceLocks(),
      ]);
      setConfig(cfg);
      setHistory(hist);
      setBanned(bans);
      setDevices(devs.devices || []);
      setLocks(lks);
      setError(null);
    } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => {
    let mounted = true;
    const poll = async () => { if (mounted) await refresh(); };
    poll();
    const h = setInterval(poll, 5000);
    return () => { mounted = false; clearInterval(h); };
  }, [refresh]);

  const updateConfig = async (updates) => {
    try {
      const cfg = await api.modUpdateConfig(updates);
      setConfig(cfg);
    } catch (e) { setError(e.message); }
  };

  const emergencyOff = async () => {
    if (!window.confirm('EMERGENCY OFF — power off ALL devices and pause bot?')) return;
    try {
      await api.modEmergencyOff();
      refresh();
    } catch (e) { setError(e.message); }
  };

  const toggleLock = async (mac, currentlyLocked) => {
    try {
      if (currentlyLocked) {
        await api.modUnlockDevice(mac);
      } else {
        await api.modLockDevice(mac);
      }
      refresh();
    } catch (e) { setError(e.message); }
  };

  const banUser = async () => {
    if (!banUserId.trim()) return;
    try {
      await api.modBan(banUserId.trim(), banUsername.trim(), banReason.trim());
      setBanUserId(''); setBanUsername(''); setBanReason('');
      refresh();
    } catch (e) { setError(e.message); }
  };

  const unbanUser = async (userId) => {
    try {
      await api.modUnban(userId);
      refresh();
    } catch (e) { setError(e.message); }
  };

  if (!config) return <div className="empty-state">Loading moderation panel...</div>;

  const lockMap = Object.fromEntries(locks.map(l => [l.mac, l.locked]));

  return (
    <div style={{ padding: 'var(--sp-4)', maxWidth: '64rem', margin: '0 auto' }}>
      {error && <div className="banner-error">{error}</div>}

      {/* Emergency OFF */}
      <button
        onClick={emergencyOff}
        style={{
          width: '100%', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)',
          background: 'var(--danger)', color: '#fff', border: 'none',
          borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-bold)', cursor: 'pointer',
        }}
      >
        🚨 EMERGENCY OFF — Kill All Devices + Pause Bot
      </button>

      {/* Config toggles */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-header"><span>Bot Controls</span></div>
        <div className="stack" style={{ padding: 'var(--sp-4)' }}>
          <label className="inline-row" style={{ gap: 'var(--sp-3)' }}>
            <input type="checkbox" checked={config.bot_paused} onChange={(e) => updateConfig({ bot_paused: e.target.checked })} />
            <span>Bot Paused {config.bot_paused && <strong style={{ color: 'var(--danger)' }}>(PAUSED)</strong>}</span>
          </label>
          <label className="inline-row" style={{ gap: 'var(--sp-3)' }}>
            <input type="checkbox" checked={config.preset_only_mode} onChange={(e) => updateConfig({ preset_only_mode: e.target.checked })} />
            <span>Preset-Only Mode (block raw colors/effects/text from Discord)</span>
          </label>
          <div className="inline-row" style={{ gap: 'var(--sp-3)' }}>
            <label className="field-label" style={{ margin: 0 }}>Brightness Cap</label>
            <input
              type="number" min={0} max={255} value={config.brightness_cap}
              className="input" style={{ width: '5rem' }}
              onChange={(e) => updateConfig({ brightness_cap: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="inline-row" style={{ gap: 'var(--sp-3)' }}>
            <label className="field-label" style={{ margin: 0 }}>Cooldown (seconds)</label>
            <input
              type="number" min={0} max={60} value={config.cooldown_seconds}
              className="input" style={{ width: '5rem' }}
              onChange={(e) => updateConfig({ cooldown_seconds: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Device locks */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-header"><span>Device Locks</span></div>
        <div style={{ padding: 'var(--sp-4)' }}>
          {devices.length === 0 && <div className="live-empty">No devices connected.</div>}
          {devices.map((d) => (
            <div key={d.mac} className="inline-row" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
              <input type="checkbox" checked={!!lockMap[d.mac]} onChange={() => toggleLock(d.mac, !!lockMap[d.mac])} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{d.name}</span>
              <span style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-xs)' }}>{d.mac}</span>
              {lockMap[d.mac] && <span style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)' }}>LOCKED</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Ban list */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-header"><span>Banned Users ({banned.length})</span></div>
        <div style={{ padding: 'var(--sp-4)' }}>
          {banned.map((b) => (
            <div key={b.user_id} className="inline-row" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{b.username || b.user_id}</span>
              <span style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-xs)' }}>{b.reason}</span>
              <span style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-xs)' }}>{timeAgo(b.banned_at)}</span>
              <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }} onClick={() => unbanUser(b.user_id)}>unban</button>
            </div>
          ))}
          <div className="inline-row" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            <input className="input" placeholder="Discord user ID" value={banUserId} onChange={(e) => setBanUserId(e.target.value)} style={{ width: '12rem' }} />
            <input className="input" placeholder="Username" value={banUsername} onChange={(e) => setBanUsername(e.target.value)} style={{ width: '10rem' }} />
            <input className="input" placeholder="Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} style={{ width: '10rem' }} />
            <button className="btn btn-danger" onClick={banUser}>Ban</button>
          </div>
        </div>
      </div>

      {/* Command history */}
      <div className="card">
        <div className="card-header"><span>Command History (last {history.length})</span></div>
        <div style={{ padding: 'var(--sp-3)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--sp-1) var(--sp-2)' }}>Time</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-1) var(--sp-2)' }}>Who</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-1) var(--sp-2)' }}>Source</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-1) var(--sp-2)' }}>Kind</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-1) var(--sp-2)' }}>Device</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-1) var(--sp-2)' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)', whiteSpace: 'nowrap' }}>{timeAgo(h.timestamp)}</td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)' }}>{h.who}</td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)' }}>{h.source}</td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)' }}>{h.command_kind}</td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)' }}>{h.device_mac?.slice(-8)}</td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)', color: h.result === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{h.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <div className="live-empty" style={{ padding: 'var(--sp-4)' }}>No commands recorded yet.</div>}
        </div>
      </div>
    </div>
  );
}
