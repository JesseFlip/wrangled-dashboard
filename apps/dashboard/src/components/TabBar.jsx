export default function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'stream', label: 'Stream', icon: '\u{1F4AC}' },
    { id: 'command', label: 'Command', icon: '\u{1F39B}' },
    { id: 'text', label: 'Text', icon: '\u{270F}\u{FE0F}' },
    { id: 'toolkit', label: 'Toolkit', icon: '\u{1F3A8}' },
  ];
  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-bar-item ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-bar-icon">{tab.icon}</span>
          <span className="tab-bar-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
