import { useEffect, useState } from 'react';
import { api } from '../api.js';

async function loadSettings() {
  const [cfg, lks] = await Promise.all([
    api.modConfig(),
    api.modDeviceLocks(),
  ]);
  return { config: cfg, locks: lks };
}

export default function SettingsSheet({ open, onClose }) {
  const [config, setConfig] = useState(null);
  const [locks, setLocks] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadSettings()
      .then((data) => {
        if (cancelled) return;
        setConfig(data.config);
        setLocks(data.locks);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => { cancelled = true; };
  }, [open]);

  const updateConfig = async (updates) => {
    try {
      const cfg = await api.modUpdateConfig(updates);
      setConfig(cfg);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleLock = async (mac, currentlyLocked) => {
    try {
      if (currentlyLocked) {
        await api.modUnlockDevice(mac);
      } else {
        await api.modLockDevice(mac);
      }
      const data = await loadSettings();
      setConfig(data.config);
      setLocks(data.locks);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        className="settings-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)' }}>
            Settings
          </span>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {error && <div className="banner-error" style={{ marginBottom: 'var(--sp-3)' }}>{error}</div>}

        {!config ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <>
            <div
              className="settings-row"
              onClick={() => updateConfig({ bot_paused: !config.bot_paused })}
            >
              <span>Bot Paused</span>
              <input
                type="checkbox"
                checked={config.bot_paused}
                readOnly
              />
            </div>

            <div
              className="settings-row"
              onClick={() => updateConfig({ preset_only_mode: !config.preset_only_mode })}
            >
              <span>Preset-Only Mode</span>
              <input
                type="checkbox"
                checked={config.preset_only_mode}
                readOnly
              />
            </div>

            <div className="settings-row" style={{ cursor: 'default' }}>
              <span>Brightness Cap</span>
              <input
                type="number"
                className="settings-num"
                min={0}
                max={255}
                value={config.brightness_cap}
                onChange={(e) => updateConfig({ brightness_cap: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="settings-row" style={{ cursor: 'default' }}>
              <span>Cooldown (s)</span>
              <input
                type="number"
                className="settings-num"
                min={0}
                max={60}
                value={config.cooldown_seconds}
                onChange={(e) => updateConfig({ cooldown_seconds: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            {locks.length > 0 && (
              <>
                <div style={{
                  marginTop: 'var(--sp-4)',
                  marginBottom: 'var(--sp-2)',
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-secondary)',
                }}>
                  Device Locks
                </div>
                {locks.map((d) => (
                  <div
                    key={d.mac}
                    className="settings-row"
                    onClick={() => toggleLock(d.mac, d.locked)}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      {d.mac}
                    </span>
                    <input
                      type="checkbox"
                      checked={d.locked}
                      readOnly
                    />
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
