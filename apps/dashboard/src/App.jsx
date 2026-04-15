import { useEffect, useState } from 'react';
import AuthGate from './components/AuthGate.jsx';
import ControlView from './views/ControlView.jsx';
import StoryView from './views/StoryView.jsx';

export default function App() {
  const [view, setView] = useState(location.hash === '#/about' ? 'about' : 'control');

  useEffect(() => {
    const onHash = () => setView(location.hash === '#/about' ? 'about' : 'control');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <AuthGate>
      <div className="app-shell">
        <nav className="app-header">
          <h1 className="app-title">Wrang<span className="app-title-accent">LED</span></h1>
          <a href="#/" className={view === 'control' ? 'nav-link active' : 'nav-link'}>Control</a>
          <a href="#/about" className={view === 'about' ? 'nav-link active' : 'nav-link'}>Story</a>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={() => { localStorage.removeItem('wrangled.token'); location.reload(); }}>Logout</button>
        </nav>
        {view === 'control' ? <ControlView /> : <StoryView />}
      </div>
    </AuthGate>
  );
}
