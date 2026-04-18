import { useCallback, useEffect, useRef, useState } from 'react';
import { api, subscribeStream } from '../api.js';
import StreamCard from '../components/StreamCard.jsx';

const MAX_EVENTS = 200;

export default function StreamView({ group }) {
  const [events, setEvents] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef(null);
  const autoScrollRef = useRef(true);

  // Keep ref in sync so the SSE callback always reads the latest value
  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  // Backfill history on mount, then subscribe to live events. Any events that
  // arrive while the history fetch is in flight get buffered and merged in.
  useEffect(() => {
    let cancelled = false;
    let history = null;
    const liveBuffer = [];

    const flushIfReady = () => {
      if (cancelled || history === null) return;
      setEvents([...history, ...liveBuffer].slice(-MAX_EVENTS));
    };

    api.recentCommands(MAX_EVENTS)
      .then((res) => {
        if (cancelled) return;
        history = res.events || [];
        flushIfReady();
      })
      .catch(() => {
        if (cancelled) return;
        history = [];
        flushIfReady();
      });

    const source = subscribeStream((evt) => {
      if (history === null) {
        liveBuffer.push(evt);
        return;
      }
      setEvents((prev) => {
        const next = [...prev, evt];
        return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
      });
    });

    return () => {
      cancelled = true;
      source.close();
    };
  }, []);

  // Auto-scroll on new events
  useEffect(() => {
    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  // Detect user scroll to pause auto-scroll
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    setAutoScroll(true);
  }, []);

  // Filter by group
  const visible = group === 'all'
    ? events
    : events.filter((e) => e.target === group);

  return (
    <div className="stream-view" ref={containerRef} onScroll={handleScroll}>
      {visible.length === 0 && (
        <div className="stream-empty">Waiting for commands...</div>
      )}
      {visible.map((evt, i) => (
        <StreamCard key={`${evt.timestamp}-${i}`} event={evt} />
      ))}
      {!autoScroll && visible.length > 0 && (
        <button className="stream-scroll-btn" onClick={scrollToBottom}>
          &#8595; New messages
        </button>
      )}
    </div>
  );
}
