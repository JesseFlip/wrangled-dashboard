import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

const PRESET_GRADIENTS = {
  pytexas: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  party: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
  chill: 'linear-gradient(135deg, #14b8a6, #6366f1)',
  fire: 'linear-gradient(135deg, #f97316, #eab308)',
  matrix: 'linear-gradient(135deg, #22c55e, #22c55e)',
  love_it: 'linear-gradient(135deg, #ef4444, #ec4899)',
  zen: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  snake_attack: 'linear-gradient(135deg, #22c55e, #84cc16)',
};

const MODE_OPTIONS = ['idle', 'clock', 'schedule', 'countdown'];

function hexToRgb(hex) {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 255, g: 128, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function speakerLabel(session) {
  if (session.speakers && session.speakers.length > 0) {
    return session.speakers.join(', ');
  }
  return session.speaker || '';
}

export default function CommandView({ group, color, brightness }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [nextTime, setNextTime] = useState(null);
  const [presets, setPresets] = useState([]);
  const [mode, setMode] = useState(null);
  const [sending, setSending] = useState(false);
  const intervalRef = useRef(null);

  const loadData = useCallback(async () => {
    const [curRes, nxtRes, preRes, modeRes] = await Promise.allSettled([
      api.getCurrentSession(),
      api.getNextSession(),
      api.listPresets(),
      api.getMode(),
    ]);
    if (curRes.status === 'fulfilled') setCurrentSession(curRes.value.session ?? null);
    if (nxtRes.status === 'fulfilled') {
      setNextSession(nxtRes.value.session ?? null);
      setNextTime(nxtRes.value.next_time ?? null);
    }
    if (preRes.status === 'fulfilled') setPresets(preRes.value.presets ?? []);
    if (modeRes.status === 'fulfilled') setMode(modeRes.value);
  }, []);

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [loadData]);

  const broadcast = useCallback(async (command) => {
    setSending(true);
    try {
      await api.goIdle();
      await api.broadcastCommand(group, command);
    } catch {
      /* swallow – fire and forget */
    } finally {
      setSending(false);
    }
  }, [group]);

  const pushSession = useCallback((session) => {
    const speaker = speakerLabel(session);
    const label = speaker ? `${session.title} \u2014 ${speaker}` : session.title;
    broadcast({
      kind: 'text',
      text: label,
      color: hexToRgb(color),
      speed: 20,
      brightness,
    });
  }, [broadcast, color, brightness]);

  const sendPreset = useCallback((name) => {
    broadcast({ kind: 'preset', name });
  }, [broadcast]);

  const changeMode = useCallback(async (name) => {
    setSending(true);
    try {
      if (name === 'idle') {
        await api.goIdle();
      } else {
        await api.setMode({ mode: name });
      }
      const res = await api.getMode();
      setMode(res);
    } catch {
      /* swallow */
    } finally {
      setSending(false);
    }
  }, []);

  const activeMode = mode?.mode ?? null;

  return (
    <div className="command-view">
      {/* Now Playing */}
      {currentSession && (
        <section className="command-section">
          <div className="card-header"><span>Now Playing</span></div>
          <div className="schedule-card now-playing">
            <div className="schedule-card-info">
              <div className="schedule-card-title">{currentSession.title}</div>
              {speakerLabel(currentSession) && (
                <div className="schedule-card-meta">{speakerLabel(currentSession)}</div>
              )}
            </div>
            <button
              className="schedule-push-btn"
              disabled={sending}
              onClick={() => pushSession(currentSession)}
            >
              PUSH
            </button>
          </div>
        </section>
      )}

      {/* Up Next */}
      {nextSession && (
        <section className="command-section">
          <div className="card-header">
            <span>Up Next{nextTime ? ` \u2014 ${nextTime}` : ''}</span>
          </div>
          <div className="schedule-card">
            <div className="schedule-card-info">
              <div className="schedule-card-title">{nextSession.title}</div>
              {speakerLabel(nextSession) && (
                <div className="schedule-card-meta">{speakerLabel(nextSession)}</div>
              )}
            </div>
            <button
              className="schedule-push-btn dim"
              disabled={sending}
              onClick={() => pushSession(nextSession)}
            >
              PUSH
            </button>
          </div>
        </section>
      )}

      {/* Presets */}
      {presets.length > 0 && (
        <section className="command-section">
          <div className="card-header"><span>Presets</span></div>
          <div className="cmd-preset-grid">
            {presets.map((name) => (
              <button
                key={name}
                className="cmd-preset-btn"
                style={{ background: PRESET_GRADIENTS[name] || 'var(--surface-3)' }}
                disabled={sending}
                onClick={() => sendPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Matrix Mode */}
      <section className="command-section">
        <div className="card-header"><span>Matrix Mode</span></div>
        <div className="mode-pills">
          {MODE_OPTIONS.map((name) => (
            <button
              key={name}
              className={`mode-pill${activeMode === name ? ' active' : ''}`}
              disabled={sending}
              onClick={() => changeMode(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
