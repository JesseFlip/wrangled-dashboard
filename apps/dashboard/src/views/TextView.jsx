import { useCallback, useState } from 'react';
import { api } from '../api.js';

const CANNED_MESSAGES = [
  'Welcome to PyTexas!',
  'Break - back soon',
  'Thanks for coming!',
  'Q&A time',
];

function hexToRgb(hex) {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 255, g: 128, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export default function TextView({ group, color, brightness }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(async (msg) => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await api.goIdle();
      await api.broadcastCommand(group, {
        kind: 'text',
        text: trimmed,
        color: hexToRgb(color),
        speed: 20,
        brightness,
      });
    } catch {
      /* swallow */
    } finally {
      setSending(false);
    }
  }, [group, color, brightness]);

  return (
    <div className="command-view">
      <section className="command-section">
        <div className="section-label">Send Text</div>
        <div className="quick-text-row">
          <input
            className="quick-text-input"
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage(text); setText(''); } }}
          />
          <button
            className="btn-accent"
            disabled={sending || !text.trim()}
            onClick={() => { sendMessage(text); setText(''); }}
          >
            SEND
          </button>
        </div>
      </section>

      <section className="command-section">
        <div className="section-label">Quick Messages</div>
        <div className="canned-chips">
          {CANNED_MESSAGES.map((msg) => (
            <button
              key={msg}
              className="canned-chip"
              disabled={sending}
              onClick={() => sendMessage(msg)}
            >
              {msg}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
