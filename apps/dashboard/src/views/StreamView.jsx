import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeStream } from '../api.js';
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

  // SSE subscription
  useEffect(() => {
    const source = subscribeStream((evt) => {
      setEvents((prev) => {
        const next = [...prev, evt];
        return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
      });
    });
    return () => source.close();
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
