import { useEffect, useState } from 'react';
import { api } from '../api.js';

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - Date.parse(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function SystemFooter() {
  const [wranglers, setWranglers] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const [w, h] = await Promise.all([
          api.listWranglers(),
          fetch('/healthz').then((r) => r.json()).catch(() => null),
        ]);
        setWranglers(w);
        setHealth(h);
      } catch {
        // ignore
      }
    };
    poll();
    const h = setInterval(poll, 10000);
    return () => clearInterval(h);
  }, []);

  const discordOn = health?.discord === true;
  const botPaused = health?.bot_paused === true;

  return (
    <footer className="card" style={{ margin: 'var(--sp-4)' }}>
      <div className="card-header"><span>System</span></div>
      <div className="live-row" style={{ padding: 'var(--sp-2) var(--sp-4)', fontSize: 'var(--text-sm)' }}>
        <span>Wranglers: {wranglers.length === 0 ? 'none connected' :
          wranglers.map((w) => `${w.wrangler_id} (${w.device_count} device${w.device_count !== 1 ? 's' : ''}, ${timeAgo(w.last_pong_at)})`).join(' · ')
        }</span>
      </div>
      <div className="live-row" style={{ padding: 'var(--sp-2) var(--sp-4)', fontSize: 'var(--text-sm)' }}>
        <span style={{ color: discordOn ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
          Discord: {discordOn ? (botPaused ? '🟡 paused' : '🟢 active') : '⚫ not configured'}
        </span>
      </div>
    </footer>
  );
}
