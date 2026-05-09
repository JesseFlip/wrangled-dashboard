import { useEffect, useState } from 'react';

type TabId = 'overview' | 'guests' | 'schedule' | 'decor' | 'shopping' | 'tasks' | 'honorees';

export function useKeyboardShortcuts(onNavigate: (tab: TabId) => void) {
  const [lastChar, setLastChar] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      if (lastChar === 'g') {
        setLastChar(null);
        switch (key) {
          case 'o': onNavigate('overview'); break;
          case 'g': onNavigate('guests'); break;
          case 's': onNavigate('schedule'); break;
          case 'd': onNavigate('decor'); break;
          case 'l': onNavigate('shopping'); break;
          case 't': onNavigate('tasks'); break;
          case 'h': onNavigate('honorees'); break;
          default: break;
        }
      } else if (key === 'g') {
        setLastChar('g');
        // Reset after 1 second if no follow-up key
        setTimeout(() => setLastChar(null), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastChar, onNavigate]);
}
