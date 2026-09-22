import { Activity, BarChart3, Dna, FileText, GitBranch, LucideIcon, Settings, Sparkles } from "lucide-react";

const pageConfig = {
  Activity: {
    eyebrow: "Signal activity / time-series",
    title: "Activity monitor",
    subtitle: "Live channel comparison across the current non-clinical session.",
    image: "/manus-storage/image_editor_4fc2e1b6-40d6-4743-8bab-441f4ce8ecac_1b56c006.jpg",
    icon: Activity,
    accent: "cyan",
    stats: [["Signal quality", "98.4%"], ["Peak coherence", "0.92"], ["Input faults", "02"]],
  },
  Networks: {
    eyebrow: "Network topology / graph view",
    title: "Connectivity map",
    subtitle: "A readable view of simulated regional links and strength bands.",
    image: "/manus-storage/image_editor_5a1c3186-8d2a-4bbb-abe7-20c168a22d74_27315a02.jpg",
    icon: GitBranch,
    accent: "violet",
    stats: [["Strong links", "24"], ["Moderate links", "18"], ["Weak links", "07"]],
  },
  Genetics: {
    eyebrow: "Identity layer / reference",
    title: "Genetic reference",
    subtitle: "Reference imagery is displayed as context only; no biological inference is performed.",
    image: "/manus-storage/image_editor_6d274a1d-3e7e-410b-b82f-3d7a4a7fa89e_b8ba84bc.jpg",
    icon: Dna,
    accent: "teal",
    stats: [["Reference set", "A–07"], ["Match status", "LOCAL"], ["Data egress", "NONE"]],
  },
  Analytics: {
    eyebrow: "Telemetry analysis / patterns",
    title: "Analytics workspace",
    subtitle: "Compare normalized activity, stress, and cognitive-load indicators.",
    icon: BarChart3,
    accent: "cyan",
    stats: [["Sessions", "12"], ["Baseline delta", "+6.2%"], ["Window", "24H"]],
  },
  Reports: {
    eyebrow: "Session records / audit",
    title: "Report archive",
    subtitle: "Structured exports and review notes for the current subject session.",
    icon: FileText,
    accent: "violet",
    stats: [["Latest report", "05/31"], ["Review state", "OPEN"], ["Exports", "04"]],
  },
  Settings: {
    eyebrow: "Interface controls / local",
    title: "System settings",
    subtitle: "Local-first controls for display, session behavior, and safe telemetry boundaries.",
    icon: Settings,
    accent: "teal",
    stats: [["Theme", "DARK"], ["Stream", "LOCAL"], ["Version", "2.4.1"]],
  },
} as const;

type ModuleName = keyof typeof pageConfig;
type ModuleConfig = { eyebrow: string; title: string; subtitle: string; image?: string; icon: LucideIcon; accent: string; stats: readonly (readonly [string, string])[] };

export default function ModulePage({ name, onAction }: { name: ModuleName; onAction: (message: string) => void }) {
  const config = pageConfig[name] as ModuleConfig;
  const Icon = config.icon;
  return (
    <section className={`module-page module-${config.accent}`}>
      <div className="module-page-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> {config.eyebrow}</div>
        <h2>{config.title}</h2>
        <p>{config.subtitle}</p>
        <div className="module-stats">
          {config.stats.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
        </div>
        <div className="module-actions">
          <button onClick={() => onAction(`${name} view refreshed`)}><Sparkles size={14} /> REFRESH VIEW</button>
          <button onClick={() => onAction(`${name} export queued`)}><FileText size={14} /> EXPORT SNAPSHOT</button>
        </div>
      </div>
      <div className="module-page-visual">
        {config.image ? <img src={config.image} alt={`${name} visualization`} /> : <div className="module-placeholder"><Icon size={52} /><div className="placeholder-grid" /><span>LOCAL TELEMETRY MODULE</span></div>}
        <div className="module-visual-overlay"><span><i /> MODULE READY</span><b>FIELD 07—A</b></div>
      </div>
    </section>
  );
}

export { pageConfig };
