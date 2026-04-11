import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Static Data ---
const initialTasks = {
  hardware: [
    { id: 'h1', text: 'Wire AC cord to PSU safely', done: false },
    { id: 'h2', text: 'Wire 5V/GND from PSU to SP803E', done: false },
    { id: 'h3', text: 'Wire 5V/GND from PSU to Matrix', done: false },
    { id: 'h4', text: 'Connect GPIO 16 to Matrix DIN', done: false },
    { id: 'h5', text: 'Test WLED AP mode with basic effects', done: false },
    { id: 'h6', text: 'Create/Test Python proxy script on Pi', done: false },
    { id: 'h7', text: 'Lock in Hotspot SSID on Pi and WLED', done: false }
  ],
  software: [
    { id: 's1', text: 'Initialize Discord Bot (discord.py)', done: false },
    { id: 's2', text: 'Create bot command parsing logic', done: false },
    { id: 's3', text: 'Map colors/effects to WLED JSON payload', done: false },
    { id: 's4', text: 'Setup VPS WebSocket server (asyncio)', done: false },
    { id: 's5', text: 'Broadcast JSON via WebSocket to Pi', done: false },
    { id: 's6', text: 'End-to-end test with Jim sending mock data', done: false }
  ]
};

// --- Components ---

// 1. CommandCenter (Overview)
const CommandCenter = ({ tasks }) => {
  const allTasks = useMemo(() => [...tasks.hardware, ...tasks.software], [tasks]);
  const completedCount = allTasks.filter(t => t.done).length;
  const pendingCount = allTasks.length - completedCount;
  const pct = Math.round((completedCount / allTasks.length) * 100) || 0;

  // Dynamic colors matching CSS vars
  let chartColor = '#D97757'; // orange
  if (pct > 50) chartColor = '#6B8EAD'; // blue
  if (pct === 100) chartColor = '#7CA982'; // green

  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [completedCount, pendingCount],
      backgroundColor: [chartColor, 'rgba(255, 255, 255, 0.4)'],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} tasks`
        }
      }
    },
    animation: { animateScale: true, animateRotate: true }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Project Status</h2>
        <p className="text-subtle">High-level tracking for the WrangLED PyTexas build. Both tracks must be completed by Monday to allow buffer time for integration testing.</p>
      </div>

      <div className="grid grid-cols-3">
        
        {/* Progress Chart */}
        <div className="glass-panel items-center flex-col justify-center flex">
          <h3 style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>Completion Readiness</h3>
          <div style={{ position: 'relative', width: '100%', height: '220px', margin: '0 auto' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            <strong style={{ color: chartColor, fontSize: '1.25rem' }}>{pct}%</strong> Completed
          </div>
        </div>

        {/* Mission Brief */}
        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>Architecture Summary</h3>
          <div className="info-card font-mono text-subtle" style={{ margin: '1rem 0', whiteSpace: 'nowrap', overflowX: 'auto' }}>
            Discord User → Bot → FastAPI (Jim/VPS) → Tailscale WebSocket → Python Proxy (Jesse/Pi) → WLED API → SP803E → Matrix
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="info-card">
              <h4 className="text-accent-blue">Dallas Lane (Jesse)</h4>
              <ul className="text-subtle" style={{ listStyle: 'none', lineHeight: '1.8' }}>
                <li>✓ Pi Online & Tailscale connected</li>
                <li>✓ WLED basic config</li>
                <li>☐ PSU & Matrix Wiring</li>
                <li>☐ Run Local Proxy Script</li>
              </ul>
            </div>
            <div className="info-card">
              <h4 className="text-accent-green">Remote Lane (Jim)</h4>
              <ul className="text-subtle" style={{ listStyle: 'none', lineHeight: '1.8' }}>
                <li>☐ Discord Bot Logic</li>
                <li>☐ FastAPI Endpoints</li>
                <li>☐ WebSocket Server</li>
                <li>☐ WLED JSON Formatting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Hardware Lane
const HardwareLane = ({ tasks, toggleTask }) => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Hardware & Wiring Guide</h2>
        <p className="text-subtle">The fastest, safest path to assemble the physical hardware in Dallas. Focus on common grounds and power safety.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex-col gap-6 flex">
          <div className="glass-panel">
            <h3>Power Injection Diagram <span style={{ fontSize: '0.75rem', background: '#E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'normal', color: '#64748b' }}>No SVG / HTML Layout</span></h3>
            
            <div className="diag-container">
              {/* PSU */}
              <div className="diag-box" style={{ borderColor: 'var(--neutral-dark)' }}>
                5V 20A PSU
                <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#666', marginTop: '0.25rem' }}>Wall AC IN</div>
              </div>
              
              {/* Wires */}
              <div className="wire-list">
                <div className="wire-block"><span className="wire-color bg-red-light" style={{ background: '#E53E3E', border: 'none' }}></span> V+ (5V) → Matrix</div>
                <div className="wire-block"><span className="wire-color" style={{ background: '#1A202C' }}></span> V- (GND) → Matrix</div>
                <div className="wire-block"><span className="wire-color" style={{ background: '#38A169' }}></span> Data (16) → DIN</div>
              </div>

              {/* Matrix */}
              <div className="flex-col gap-4 flex items-center">
                 <div className="diag-box" style={{ borderColor: 'var(--accent-blue)', background: '#F0F9FF' }}>
                    SP803E WLED
                 </div>
                 <div style={{ fontSize: '0.85rem', color: '#666' }}>↓ Data Link</div>
                 <div className="diag-box" style={{ borderColor: 'var(--accent-orange)', background: '#FFF7ED' }}>
                    8x32 Matrix
                 </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Crucial Steps:</h4>
              <ol className="text-subtle" style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                <li><strong>Unplug AC</strong> before touching terminal screws.</li>
                <li><strong>Common Ground:</strong> Controller and Matrix must share PSU ground.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex-col gap-6 flex">
          <div className="glass-panel bg-red-light">
            <h3 style={{ color: '#991B1B' }}>⚠ Hardware Pitfalls</h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Level Shifting:</strong> If the matrix flickers crazily, keep the data wire under 4 inches.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Voltage Drop:</strong> If the end turns pink, inject 5V/GND to the other end.</li>
              <li><strong>Directionality:</strong> Ensure data connects to DIN, not DOUT.</li>
            </ul>
          </div>
          
          <div className="glass-panel">
            <h3>Jesse's Task List</h3>
            <div>
              {tasks.hardware.map(task => (
                <div key={task.id} className={`task-item ${task.done ? 'completed' : ''}`} onClick={() => toggleTask('hardware', task.id)}>
                  <input type="checkbox" className="task-checkbox" checked={task.done} readOnly />
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Software Lane
const SoftwareLane = ({ tasks, toggleTask }) => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Software & API Integrations</h2>
        <p className="text-subtle">Documentation for the control layer. Jim builds the bot/VPS side; Jesse runs the lightweight proxy on the Pi.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex-col gap-6 flex">
          <div className="glass-panel">
            <h3>WLED JSON API</h3>
            <p className="text-subtle" style={{ marginBottom: '1rem' }}>HTTP POST to <code>http://[WLED-IP]/json/state</code>.</p>
<pre><code>{`{
  "on": true,
  "bri": 128,
  "seg": [{
    "col": [[255, 0, 0], [0, 0, 0]],
    "fx": 14,
    "sx": 128
  }]
}`}</code></pre>
          </div>
          <div className="glass-panel">
            <h3>VPS Architecture (Jim)</h3>
            <ul className="text-subtle" style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
              <li>Discord command <code>!led red</code> received.</li>
              <li>Bot translates to JSON payload.</li>
              <li>VPS broadcasts to Pi over WebSocket.</li>
            </ul>
          </div>
        </div>

        <div className="flex-col gap-6 flex">
          <div className="glass-panel">
            <h3>Pi WebSocket Proxy</h3>
<pre><code>{`import asyncio, websockets, requests, json

VPS_URI = "ws://[VPS_IP]:8765"
WLED_URL = "http://localhost/json/state"

async def listen():
    async with websockets.connect(VPS_URI) as ws:
        while True:
            msg = await ws.recv()
            requests.post(WLED_URL, json=json.loads(msg))

asyncio.run(listen())`}</code></pre>
          </div>
          
          <div className="glass-panel">
            <h3>Jim's Task List</h3>
            <div>
              {tasks.software.map(task => (
                <div key={task.id} className={`task-item ${task.done ? 'completed' : ''}`} onClick={() => toggleTask('software', task.id)}>
                  <input type="checkbox" className="task-checkbox" checked={task.done} readOnly />
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Launch Protocol
const LaunchProtocol = () => (
  <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h2>Conference Day Protocol</h2>
      <p className="text-subtle">Network environment will be hostile. Rely on the Pixel Hotspot.</p>
    </div>

    <div className="launch-callout" style={{ marginBottom: '2rem' }}>
      <h3 style={{ position: 'relative', zIndex: 10 }}>Network Failsafe Configuration</h3>
      <ul style={{ position: 'relative', zIndex: 10, paddingLeft: '1.25rem', marginTop: '1rem', lineHeight: '1.8', fontWeight: 600 }}>
        <li>Set Pixel 8a Hotspot SSID to <code>PyTexas_WrangLED</code>.</li>
        <li>Hardcode in Pi's <code>wpa_supplicant.conf</code>.</li>
        <li>Hardcode in WLED's WiFi settings beforehand.</li>
      </ul>
    </div>

    <div className="glass-panel">
      <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Boot Order Sequence</h3>
      
      {[
        { step: 1, title: 'Enable Mobile Hotspot', desc: 'Turn on Pixel 8a hotspot. Ensure it broadcasts.' },
        { step: 2, title: 'Power Up Hardware', desc: 'Plug in the 5V 20A PSU to initialize.' },
        { step: 3, title: 'Verify Connections', desc: 'Check Hotspot client list for WLED and Pi.' },
        { step: 4, title: 'Start Pi Proxy', desc: 'Run proxy.py script via Tailscale SSH.' },
        { step: 5, title: 'Test via Discord', desc: 'Send a mock command through Discord.', isSuccess: true }
      ].map(item => (
        <div key={item.step} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '2.5rem', height: '2.5rem', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
            background: item.isSuccess ? 'var(--accent-green)' : '#E2E8F0',
            color: item.isSuccess ? 'white' : 'inherit'
          }}>
            {item.step}
          </div>
          <div>
            <h4 style={{ color: item.isSuccess ? 'var(--accent-green)' : 'inherit' }}>{item.title}</h4>
            <p className="text-subtle">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);


// --- Main App Component ---
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize state from local storage or defaults
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('wrangled_tasks_react');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Parse err:', e); }
    }
    return initialTasks;
  });

  // Sync state to local storage on change
  useEffect(() => {
    localStorage.setItem('wrangled_tasks_react', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (category, id) => {
    setTasks(prev => {
      const updatedCategory = prev[category].map(t => 
        t.id === id ? { ...t, done: !t.done } : t
      );
      return { ...prev, [category]: updatedCategory };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="header-wrapper">
        <div className="header-content">
          <div>
            <h1 className="text-accent-orange" style={{ fontSize: '2rem' }}>
              WrangLED <span style={{ color: 'var(--neutral-base)', fontWeight: 300 }}>Fast-Track</span>
            </h1>
            <p style={{ opacity: 0.8, marginTop: '0.25rem', fontSize: '0.9rem' }}>PyTexas 2025 · 6-Day Build Plan · Discord Matrix</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span>
              T-Minus 6 Days
            </div>
            <div style={{ width: '1px', height: '1rem', background: 'rgba(255,255,255,0.2)' }}></div>
            <div>Target: Monday</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        <div style={{ display: 'flex', width: '100%', maxWidth: '1200px' }}>
          {[
            { id: 'overview', label: 'Command Center' },
            { id: 'hardware', label: 'Hardware & Pi (Jesse)' },
            { id: 'software', label: 'Software & Bot (Jim)' },
            { id: 'launch', label: 'Conference Protocol' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container flex-col" style={{ flexGrow: 1 }}>
        {activeTab === 'overview' && <CommandCenter tasks={tasks} />}
        {activeTab === 'hardware' && <HardwareLane tasks={tasks} toggleTask={toggleTask} />}
        {activeTab === 'software' && <SoftwareLane tasks={tasks} toggleTask={toggleTask} />}
        {activeTab === 'launch' && <LaunchProtocol />}
      </main>
    </div>
  );
}

export default App;
