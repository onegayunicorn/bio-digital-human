import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  CircleHelp,
  Download,
  Dna,
  FileText,
  Gauge,
  GitBranch,
  Menu,
  Minus,
  Network,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ScanLine,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Wifi,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import ModulePage from "../components/ModulePage";

type NavItem = {
  label: string;
  icon: typeof Brain;
};

const navItems: NavItem[] = [
  { label: "Overview", icon: Brain },
  { label: "Activity", icon: Activity },
  { label: "Networks", icon: Network },
  { label: "Genetics", icon: Dna },
  { label: "Analytics", icon: BarChart3 },
  { label: "Reports", icon: FileText },
  { label: "Settings", icon: Settings },
];

const initialVitals = [
  { label: "Heart rate", value: 72, unit: "BPM", trend: "up" },
  { label: "Brain activity", value: 87, unit: "%", trend: "wave" },
  { label: "Oxygen level", value: 96, unit: "%", trend: "flat" },
  { label: "Respiratory rate", value: 16, unit: "RPM", trend: "down" },
];

const regions = [
  ["Frontal lobe", 82],
  ["Parietal lobe", 79],
  ["Temporal lobe", 67],
  ["Occipital lobe", 71],
  ["Cerebellum", 85],
  ["Brain stem", 90],
] as const;

const waves = [
  { name: "Alpha", hz: "8–12 Hz", color: "cyan", points: "0,19 8,11 16,24 24,9 32,28 40,12 48,22 56,7 64,21 72,13 80,25 88,10 96,18 104,8 112,20 120,12" },
  { name: "Beta", hz: "12–30 Hz", color: "violet", points: "0,15 6,22 12,8 18,27 24,5 30,24 36,12 42,28 48,7 54,23 60,10 66,27 72,8 78,21 84,13 90,26 96,9 104,20 112,11 120,23" },
  { name: "Gamma", hz: "30–100 Hz", color: "pink", points: "0,19 5,7 10,25 15,4 20,27 25,10 30,21 35,3 40,25 45,9 50,26 55,6 60,22 65,8 70,28 75,5 80,25 85,10 90,22 95,7 100,24 105,9 112,26 120,11" },
  { name: "Delta", hz: "0.5–4 Hz", color: "blue", points: "0,18 12,15 18,6 27,11 35,25 45,22 52,10 61,8 70,21 79,25 88,15 95,6 104,14 112,22 120,17" },
  { name: "Theta", hz: "4–8 Hz", color: "teal", points: "0,17 10,8 20,24 30,12 40,18 50,6 60,25 70,14 80,20 90,9 100,24 110,13 120,19" },
];

function Sparkline({ variant = "wave", color = "cyan" }: { variant?: string; color?: string }) {
  const points = variant === "up"
    ? "0,24 10,21 18,25 28,12 38,20 49,17 60,24 72,8 83,16 95,5 106,19 120,10"
    : variant === "flat"
      ? "0,17 9,15 18,18 28,16 39,18 50,14 60,18 72,15 84,17 95,13 108,17 120,15"
      : variant === "down"
        ? "0,8 10,18 20,7 30,22 40,12 50,26 60,9 70,21 80,12 92,26 104,11 112,22 120,14"
        : "0,21 10,9 20,25 30,4 40,21 50,12 60,27 70,8 80,19 90,11 100,24 110,7 120,18";

  return (
    <svg className={`sparkline ${color}`} viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Panel({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return <section className={`panel ${glow ? "panel-glow" : ""} ${className}`}>{children}</section>;
}

function RingMetric({ value, label, tone }: { value: number; label: string; tone: "cyan" | "violet" | "teal" }) {
  const style = { "--ring-progress": `${value * 3.6}deg` } as React.CSSProperties;
  return (
    <div className="ring-metric">
      <div className={`ring ring-${tone}`} style={style}>
        <div className="ring-inner">
          <strong>{value}<small>%</small></strong>
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [isLive, setIsLive] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [range, setRange] = useState("24h");
  const [notice, setNotice] = useState("Live stream connected");
  const [vitals, setVitals] = useState(initialVitals);
  const [installPrompt, setInstallPrompt] = useState<(Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null>(null);

  useEffect(() => {
    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    toast(choice.outcome === "accepted" ? "NeuroScan installed" : "Install prompt dismissed");
  };

  const pageCopy = useMemo(() => {
    const copy: Record<string, { eyebrow: string; title: string }> = {
      Overview: { eyebrow: "Live analysis / subject overview", title: "Neural state at a glance" },
      Activity: { eyebrow: "Live analysis / signal activity", title: "Signal activity monitor" },
      Networks: { eyebrow: "Live analysis / neural topology", title: "Connectivity map" },
      Genetics: { eyebrow: "Live analysis / identity layer", title: "Genetic reference layer" },
      Analytics: { eyebrow: "Live analysis / patterns", title: "Telemetry analytics" },
      Reports: { eyebrow: "Live analysis / records", title: "Session reports" },
      Settings: { eyebrow: "Live analysis / system controls", title: "Interface settings" },
    };
    return copy[activeNav];
  }, [activeNav]);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice("Live stream connected"), 2200);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setVitals(initialVitals);
    toast("View reset to baseline");
  };

  const handleExport = () => {
    const payload = { subject: "AX-7G", session: "7G-842-19", range, live: isLive, vitals, regions, capturedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neuroscan-session-7G-842-19.json";
    link.click();
    URL.revokeObjectURL(url);
    toast("Session data exported");
  };

  const handleLiveToggle = () => {
    setIsLive((current) => !current);
    toast(isLive ? "Analysis paused" : "Analysis resumed");
  };

  const adjustZoom = (delta: number) => setZoom((current) => Math.min(130, Math.max(75, current + delta)));

  return (
    <div className="neuro-shell">
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />
      <header className="topbar">
        <div className="brand-mark">
          <div className="brand-orbit"><ScanLine size={18} /></div>
          <div>
            <div className="brand-name">NEUROSCAN <span>INTERFACE</span></div>
            <div className="brand-version">v2.4.1 / non-clinical telemetry</div>
          </div>
        </div>
        <div className="topbar-center"><Activity size={17} /> LIVE ANALYSIS <span className="live-pip" /></div>
        <div className="system-status"><span className="status-dot" /> SYSTEM STATUS <strong>ONLINE</strong>{installPrompt && <button className="install-button" onClick={installApp}>INSTALL APP</button>}<button className="icon-button mobile-menu" onClick={() => setMobileNavOpen((current) => !current)} aria-label="Toggle navigation"><Menu size={20} /></button></div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-head"><span>MODULES</span><button className="icon-button close-mobile" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={16} /></button></div>
          <nav>
            {navItems.map(({ label, icon: Icon }) => (
              <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setMobileNavOpen(false); toast(`${label} module selected`); }}>
                <Icon size={19} strokeWidth={1.6} /><span>{label}</span>{activeNav === label && <span className="nav-signal" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-foot"><div className="secure-badge"><Wifi size={14} /><span>LOCAL-FIRST<br /><b>SESSION SECURE</b></span></div></div>
        </aside>

        <main className="main-content">
          <div className="page-intro">
            <div><div className="eyebrow"><span className="eyebrow-line" /> {pageCopy.eyebrow}</div><h1>{pageCopy.title}</h1></div>
            <div className="range-control"><span>WINDOW</span><select value={range} onChange={(event) => { setRange(event.target.value); toast(`Window changed to ${event.target.value.toUpperCase()}`); }} aria-label="Analysis time window"><option value="24h">24 HOURS</option><option value="7d">7 DAYS</option><option value="30d">30 DAYS</option></select><ChevronRight size={15} /></div>
          </div>

          {activeNav !== "Overview" && <ModulePage name={activeNav as "Activity" | "Networks" | "Genetics" | "Analytics" | "Reports" | "Settings"} onAction={toast} />}

          <div className="overview-grid">
            <Panel className="subject-panel"><div className="panel-kicker">SUBJECT PROFILE <CircleHelp size={13} /></div><div className="subject-content"><div className="avatar-ring"><UserRound size={28} /></div><div><div className="subject-id">AX-7G <span className="verified"><Sparkles size={11} /> verified</span></div><div className="subject-meta"><span>ID <b>7G-842-19</b></span><span>AGE <b>29</b></span><span>SESSION <b>05/31/2024</b></span></div></div></div></Panel>
            <Panel className="progress-panel" glow><div className="progress-header"><div className="panel-kicker">SCAN PROGRESS</div><strong>78<span>%</span></strong></div><div className="progress-track"><div className="progress-fill" /></div><div className="progress-meta"><span>ESTIM. COMPLETION</span><b>00:02:14</b><span className="progress-live"><i /> STREAMING</span></div></Panel>
          </div>

          <div className="dashboard-grid">
            <div className="center-column">
              <Panel className="brain-panel" glow>
                <div className="scan-corner top-left" /><div className="scan-corner top-right" /><div className="scan-corner bottom-left" /><div className="scan-corner bottom-right" />
                <div className="brain-panel-header"><span><span className="pulse-dot" /> NEURAL FIELD / LIVE</span><span className="field-id">FIELD 07—A</span></div>
                <div className="brain-viewport" style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}>
                  <img src="/manus-storage/neuroscan-reference_5dc10871.jpg" alt="Neural scan visual reference" />
                  <div className="brain-image-shade" /><div className="scan-grid" /><div className="target-ring ring-a" /><div className="target-ring ring-b" /><div className="target-crosshair" />
                </div>
                <div className="brain-readout"><div><span className="readout-label">COHERENCE</span><b>0.92</b></div><div><span className="readout-label">FIELD LOAD</span><b>68%</b></div><div className="readout-status"><i /> NOMINAL</div></div>
              </Panel>

              <div className="lower-panels">
                <Panel className="region-panel"><div className="panel-title-row"><div><div className="panel-kicker">BRAIN REGIONS</div><h2>Regional activation</h2></div><Brain size={18} /></div><div className="region-list">{regions.map(([name, value]) => <div className="region-row" key={name}><div className="region-label"><span>{name}</span><b>{value}%</b></div><div className="region-track"><span style={{ width: `${value}%` }} /></div></div>)}</div><button className="text-link" onClick={() => { setActiveNav("Analytics"); toast("Opening regional analytics"); }}>DETAILED VIEW <ChevronRight size={14} /></button></Panel>
                <Panel className="wave-panel"><div className="panel-title-row"><div><div className="panel-kicker">NEURAL ACTIVITY</div><h2>Band spectrum</h2></div><Gauge size={18} /></div><div className="wave-list">{waves.map((wave) => <div className="wave-row" key={wave.name}><div><b>{wave.name}</b><span>{wave.hz}</span></div><svg viewBox="0 0 120 32" preserveAspectRatio="none" className={`wave-chart ${wave.color}`}><polyline points={wave.points} fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" /></svg></div>)}</div><button className="text-link" onClick={() => { setActiveNav("Activity"); toast("Opening full spectrum"); }}>FULL SPECTRUM <ChevronRight size={14} /></button></Panel>
              </div>
            </div>

            <div className="right-column">
              <Panel className="vitals-panel"><div className="panel-title-row"><div><div className="panel-kicker">VITALS</div><h2>Physiological readout</h2></div><Activity size={18} /></div><div className="vitals-list">{vitals.map((vital) => <div className="vital-row" key={vital.label}><div><span>{vital.label}</span><div className="vital-number">{vital.value}<small>{vital.unit}</small></div></div><Sparkline variant={vital.trend} color={vital.trend === "wave" ? "violet" : "cyan"} /></div>)}</div></Panel>
              <Panel className="insight-panel"><div className="panel-kicker">SESSION INSIGHT</div><div className="insight-icon"><Sparkles size={17} /></div><h2>Focused, stable state</h2><p>Signal coherence is trending above the session baseline. All monitored channels remain within the simulated operating envelope.</p><button onClick={() => toast("Insight marked for review")} className="small-button">MARK FOR REVIEW <ChevronRight size={14} /></button></Panel>
            </div>
          </div>

          <div className="metrics-row"><Panel className="metric-panel"><div className="panel-kicker">COGNITIVE LOAD <span className="metric-time">LIVE</span></div><div className="metric-body"><RingMetric value={68} label="OPTIMAL" tone="cyan" /><div className="metric-legend"><span><i className="legend-high" /> HIGH</span><span><i className="legend-mid" /> MEDIUM</span><span><i className="legend-low" /> LOW</span></div></div><Sparkline variant="flat" color="cyan" /></Panel><Panel className="metric-panel connectivity"><div className="panel-kicker">NEURAL CONNECTIVITY <GitBranch size={14} /></div><div className="network-orb"><div className="orb-core" /><div className="orb-node n1" /><div className="orb-node n2" /><div className="orb-node n3" /><div className="orb-node n4" /><div className="orb-line l1" /><div className="orb-line l2" /><div className="orb-line l3" /><div className="orb-line l4" /></div><div className="connectivity-meta"><span><i className="legend-strong" /> STRONG</span><span><i className="legend-moderate" /> MODERATE</span><span><i className="legend-weak" /> WEAK</span></div><button className="small-button" onClick={() => { setActiveNav("Networks"); toast("Network view selected"); }}>VIEW NETWORK <ChevronRight size={14} /></button></Panel><Panel className="metric-panel"><div className="panel-kicker">STRESS LEVEL <span className="metric-time">LOW</span></div><div className="metric-body"><RingMetric value={32} label="LOW" tone="teal" /><div className="metric-note"><span>below threshold</span><b>−8.4%</b><small>vs. last session</small></div></div><Sparkline variant="down" color="teal" /></Panel></div>
        </main>
      </div>

      <footer className="control-dock"><button onClick={() => { setRotation((current) => (current + 90) % 360); toast(`Neural field rotated ${((rotation + 90) % 360)}°`); }}><RotateCcw size={16} /> ROTATE</button><div className="zoom-control"><button onClick={() => adjustZoom(-10)} aria-label="Zoom out"><ZoomOut size={16} /></button><span>{zoom}%</span><button onClick={() => adjustZoom(10)} aria-label="Zoom in"><ZoomIn size={16} /></button></div><button className={`pause-button ${isLive ? "" : "paused"}`} onClick={handleLiveToggle}>{isLive ? <Pause size={17} /> : <Play size={17} />} {isLive ? "PAUSE" : "RESUME"}</button><button onClick={handleReset}><RotateCcw size={16} /> RESET VIEW</button><button className="export-button" onClick={handleExport}><Download size={16} /> EXPORT DATA</button></footer>
      <div className="toast" role="status"><span className="toast-pulse" />{notice}</div>
    </div>
  );
}

export { Minus, Plus, Search };
