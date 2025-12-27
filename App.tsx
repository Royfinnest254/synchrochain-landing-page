
import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Terminal,
  Database,
  ShieldCheck,
  Zap,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Server,
  Activity,
  Ban,
  RotateCw,
  Trash2,
  FileText,
  Download,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShaderAnimation } from './components/ui/shader-lines';
import { ResearchVisual } from './components/ui/research-visual';
import { Footer } from './components/ui/footer';
import { SynchroChainEngine, Task, SystemNode, SystemEvent } from './lib/engine';
import { INVARIANTS } from './lib/invariants';

// --- TYPES & CONSTANTS ---

type ViewName = 'landing' | 'workbench' | 'concept' | 'about';

// --- COMPONENTS ---

const Navbar = ({ view, setView }: { view: ViewName, setView: (v: ViewName) => void }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F14]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-white font-bold text-xl tracking-tighter cursor-pointer group"
        >
          <Layers className="w-6 h-6 text-sky-500" />
          <span>SynchroChain</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[#f8fafc]">
          {['concept', 'about', 'workbench'].map((item) => (
            <button
              key={item}
              onClick={() => setView(item as ViewName)}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${view === item ? 'text-sky-400' : 'text-slate-500 hover:text-white'}`}
            >
              {item === 'workbench' ? 'Prototype' : item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// --- MANUAL WORKBENCH (AUTOMATED COORDINATOR) ---

const Workbench = () => {
  const engineRef = useRef(new SynchroChainEngine());

  // Derived UI State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [autoMode, setAutoMode] = useState(true); // Default on?

  // Initialize & Refresh
  const refreshState = () => {
    setTasks(engineRef.current.getTasks());
    setNodes(engineRef.current.getNodes());
    setEvents(engineRef.current.getEvents());
  };

  // AUTOMATED LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoMode) {
        engineRef.current.processTick();
        refreshState();
      }
    }, 100); // 10Hz Tick
    return () => clearInterval(interval);
  }, [autoMode]);

  // --- ACTIONS ---

  const handleInjectTask = () => {
    engineRef.current.manualInjectTask();
    // refreshState handles by loop or next tick
  };

  const handleAddNode = () => {
    const newId = `Node-0${nodes.length + 1}`;
    engineRef.current.manualRegisterNode(newId);
    refreshState();
  };

  const handleFailNode = (nid: string) => {
    engineRef.current.manualFailNode(nid);
    refreshState();
  };

  const handleRecoverNode = (nid: string) => {
    engineRef.current.manualRecoverNode(nid);
    refreshState();
  };

  const downloadCSV = () => {
    // EVENTS ONLY (The Source of Truth)
    const events = engineRef.current.getEvents();
    const header = "event_id,timestamp,event_type,task_id,node_id,invariant,metadata,latency_ms\n";
    const rows = events.map(e => {
      // Extract latency from metadata if possible, or we could have stored it on event?
      // Actually engine stores it in metadata string for text log, but for CSV we might want to parse it?
      // The prompt said: "Log it... metadata={'latency_ms': ...}" 
      // Currently engine.ts logs: `Completed. Latency: ${t.latency_ms}ms` in metadata string.
      // We can just dump metadata column.
      return `${e.event_id},${e.timestamp},${e.event_type},${e.task_id || ''},${e.node_id || ''},${e.invariant_id_applied || ''},"${e.metadata}",`;
    }).join("\n");

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synchrochain_events_truth.csv`;
    a.click();
  };

  return (
    <div className="bg-[#0B0F14] min-h-screen text-slate-200 font-mono text-sm pt-24 pb-20 px-4 md:px-8">

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: CONTROLS (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* INJECTION CONTROL */}
          <div className="bg-[#11161d] border border-white/10 rounded-none p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Zap className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-white uppercase tracking-widest">Workload Injection</h3>
            </div>
            <button onClick={handleInjectTask} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-sky-500/20 active:scale-[98%]">
              <Plus className="w-5 h-5" /> Inject Task
            </button>
            <div className="mt-2 text-[10px] text-slate-500 text-center">
              Coordinator will auto-assign to best node.
            </div>
          </div>

          {/* NODE FAILURES (MANUAL) */}
          <div className="bg-[#11161d] border border-white/10 rounded-none p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-white uppercase tracking-widest">Chaos Engineering</h3>
            </div>

            <div className="space-y-2">
              {nodes.map(n => (
                <div key={n.node_id} className="flex items-center justify-between p-2 bg-black/20 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${n.state === 'alive' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={n.state === 'alive' ? 'text-slate-300' : 'text-red-400 line-through'}>{n.node_id}</span>
                  </div>
                  {n.state === 'alive' ? (
                    <button onClick={() => handleFailNode(n.node_id)} className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-500/30 text-[10px] hover:bg-red-500/20 uppercase font-bold hover:text-red-200 transition-colors">KILL</button>
                  ) : (
                    <button onClick={() => handleRecoverNode(n.node_id)} className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 text-[10px] hover:bg-emerald-500/20 uppercase font-bold hover:text-emerald-200 transition-colors">RECOVER</button>
                  )}
                </div>
              ))}
              <button onClick={handleAddNode} className="w-full mt-2 py-2 border border-dashed border-slate-700 text-slate-500 text-xs hover:border-slate-500 hover:text-slate-300 transition-colors uppercase">
                + Provision Node
              </button>
            </div>
          </div>

          {/* EXPORT */}
          <button onClick={downloadCSV} className="w-full py-3 bg-[#161b22] border border-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 group">
            <Download className="w-4 h-4 group-hover:text-emerald-500 transition-colors" /> Download Log (CSV)
          </button>

        </div>

        {/* MIDDLE COLUMN: STATE BOARD (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-[#11161d] border border-white/10 rounded-none overflow-hidden h-[600px] flex flex-col">
            <div className="p-3 border-b border-white/10 bg-black/20 flex justify-between items-center shrink-0">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Active Operations</span>
              <div className="flex gap-2">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'running').length} Running</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{tasks.length} Total</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs relative">
                <thead className="bg-[#0e1217] text-slate-500 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 font-bold uppercase">ID</th>
                    <th className="p-3 font-bold uppercase">Status</th>
                    <th className="p-3 font-bold uppercase">Node</th>
                    <th className="p-3 font-bold uppercase text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.slice().reverse().map(t => (
                    <tr key={t.task_id} className={`hover:bg-white/5 transition-colors ${t.status === 'blocked' ? 'bg-red-900/5' : ''}`}>
                      <td className="p-3 font-mono text-slate-300 border-l-2 border-transparent hover:border-sky-500">{t.task_id}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className={`w-fit px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${t.status === 'running' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                              t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                t.status === 'blocked' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-slate-700/50 text-slate-400 border-slate-600/30'
                            }`}>
                            {t.status}
                          </span>
                          {t.blocked_by_invariant && <span className="text-[9px] text-red-500 mt-1 font-mono">{t.blocked_by_invariant}</span>}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{t.assigned_node || "—"}</td>
                      <td className="p-3 font-mono text-right">
                        {t.latency_ms ? (
                          <span className="text-emerald-400 font-bold">{t.latency_ms} ms</span>
                        ) : t.started_at ? (
                          <span className="text-sky-500/50 animate-pulse">Running...</span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-600 italic">No tasks active. Inject workload to begin.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: EVENT LOG (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0d1117] border border-white/10 rounded-none h-[600px] flex flex-col shadow-2xl">
            <div className="p-3 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
              <span className="font-mono text-xs font-bold text-sky-500 uppercase flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Immutable Truth
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-600 uppercase">Live Feed</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1.5 bg-[#050505]">
              {events.length === 0 && <div className="text-slate-700 italic">System initialized. Awaiting events...</div>}
              {events.slice().reverse().map(e => (
                <div key={e.event_id} className="flex gap-2 group hover:bg-white/5 p-0.5 rounded">
                  <div className="text-slate-600 min-w-[50px] opacity-50 group-hover:opacity-100">{new Date(e.timestamp).toLocaleTimeString().split(' ')[0]}</div>
                  <div className="flex-1 break-words">
                    <span className={`font-bold ${e.event_type.includes('fail') || e.event_type.includes('block') || e.event_type.includes('violation') ? 'text-red-400' :
                        e.event_type.includes('complete') ? 'text-emerald-400' :
                          e.event_type.includes('start') ? 'text-sky-400' :
                            'text-slate-300'
                      }`}>
                      [{e.event_type.toUpperCase()}]
                    </span>
                    <span className="text-slate-500 ml-1">
                      {e.task_id && <span className="text-slate-400">[{e.task_id}] </span>}
                      {e.node_id && <span className="text-slate-600">@{e.node_id} </span>}
                      {e.invariant_id_applied && <span className="text-amber-500">IV:{e.invariant_id_applied} </span>}
                      <span className="text-slate-500 opacity-80 group-hover:opacity-100">
                        {e.metadata}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- CONCEPT PAGE COMPONENT ---

const ConceptPage = () => {
  return (
    <div className="bg-[#0B0F14] min-h-screen text-[#f8fafc] font-sans pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Enhanced Background Shades */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Right Blue Glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/3 animate-pulse duration-[5000ms]" />
        {/* Bottom Left Cyan Glow */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none translate-y-1/3 -translate-x-1/4" />
        {/* Center Subtle Purple Haze */}
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] bg-indigo-900/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-32 relative z-10">

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Zap className="w-3 h-3" />
              <span>Research Prototype</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-sky-200">
                Deterministic <br />
                Coordination.
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-light max-w-xl border-l-2 border-blue-500/30 pl-6">
              SynchroChain replaces probabilistic consensus with strict, log-based causality for systems where failure is not an option.
            </p>
          </div>

          {/* Abstract Visual Side */}
          <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-[#11161d] border border-white/5 flex items-center justify-center group shadow-2xl shadow-blue-900/10">
            <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-blue-900/10 to-transparent">
              <ResearchVisual />
            </div>
            <div className="relative z-10 p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur-md">
                <ShieldCheck className="w-10 h-10 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white tracking-tight">Invariant-First Design</div>
            </div>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: "Immutable History",
              desc: "Every state change is appended to a cryptographically verifiable log. History is never rewritten, only extended."
            },
            {
              icon: Activity,
              title: "Causal Chains",
              desc: "Events link to their specific causal ancestors, allowing exact post-hoc reconstruction of the 'why' behind every state."
            },
            {
              icon: Ban,
              title: "Safety Blocking",
              desc: "When conditions are uncertain, the system defaults to a safe blocked state rather than guessing. Safety > Liveness."
            }
          ].map((card, i) => (
            <div key={i} className="group relative p-8 rounded-2xl bg-[#11161d]/80 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl duration-500" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors duration-300 shadow-inner">
                  <card.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-blue-500/50 transition-colors duration-500" />
                <div className="text-xs font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Learn More &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ABOUT PAGE COMPONENT ---

const AboutPage = () => {
  return (
    <div className="bg-[#0B0F14] min-h-screen text-[#f8fafc] font-sans pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Enhanced Background Shades */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen translate-x-1/3" />
        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-5 space-y-12 sticky top-32 h-fit">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1]">
              Behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">SynchroChain</span>
            </h1>
            <p className="text-xl text-slate-400 font-light leading-relaxed">
              An independent research initiative investigating the boundaries of distributed correctness.
            </p>
          </div>

          <div className="space-y-6 text-slate-400 text-sm leading-relaxed font-light">
            <p>
              Distributed systems often sacrifice consistency for availability. SynchroChain explores the inverse: what happens when we refuse to guess?
            </p>
            <p>
              By modeling system coordination as a strictly ordered sequence of invariant-checked events, we can eliminate entire classes of "Heisenbugs" found in eventual consistency models.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-white group-hover:text-sky-400 transition-colors">20+</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Scenarios</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-white group-hover:text-sky-400 transition-colors">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Determinism</div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT - STACKED CARDS */}
        <div className="lg:col-span-7 grid gap-6">
          {[
            {
              label: "The Mission",
              title: "Why Build This?",
              text: "To prove that complex failure modes can be handled without non-deterministic recovery logic. We aim to convert 'unknown unknowns' into explicit system states."
            },
            {
              label: "The Scope",
              title: "What This Is Not",
              text: "SynchroChain is not a blockchain, cryptocurrency, or production database. It is a pure coordination engine designed for theoretical verification and simulation."
            },
            {
              label: "The Future",
              title: "Research Goals",
              text: "We are currently expanding the engine to support DAG-based concurrency and formal verification of the Invariant Registry."
            }
          ].map((item, i) => (
            <div key={i} className="bg-[#11161d]/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all hover:bg-[#161b22] group hover:shadow-2xl hover:shadow-blue-900/5">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                <div className="shrink-0 pt-2">
                  <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-lg group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    {i + 1}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">{item.label}</div>
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed">{item.text}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Visual Filler */}
          <div className="h-[200px] rounded-2xl bg-[#0F1319] border border-white/5 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <ResearchVisual />
            </div>
            <div className="relative z-10 text-slate-500 font-mono text-xs tracking-[0.2em] uppercase">System Logic Visualization</div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- LANDING VIEW ---

const LandingView = ({ setView }: { setView: (v: ViewName) => void }) => {
  return (
    <div className="bg-[#0B0F14] overflow-hidden min-h-screen">
      <section className="relative h-screen flex items-center pt-20 px-6 max-w-7xl mx-auto">
        <div className="absolute inset-0 z-0 opacity-40">
          <ShaderAnimation />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0B0F14]/20 to-[#0B0F14] pointer-events-none" />

        <div className="relative z-10 w-full text-center md:text-left">
          <div className="max-w-5xl space-y-12 mx-auto md:mx-0">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[120px] font-black text-white leading-[0.85] tracking-tighter uppercase drop-shadow-2xl"
            >
              SynchroChain
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed mx-auto md:mx-0 border-l-2 border-sky-500/50 pl-6">
                A correctness-first coordination and observability research prototype.
              </p>
              <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-4">
                <button
                  onClick={() => setView('workbench')}
                  className="group bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  Launch Prototype <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setView('concept')}
                  className="text-slate-400 font-bold hover:text-white transition-all underline underline-offset-8 decoration-slate-700 hover:decoration-white"
                >
                  Read Concept
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B0F14] py-32 px-6 border-t border-white/5 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-8 sticky top-32 h-fit">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
              Evidence-Based <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">System Integrity</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed font-light">
              Demonstrating coordination correctness across asynchronous networks through deterministic log verification.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {[
              { title: "Correctness First", desc: "Explicit enforcement of at-most-once execution via immutable coordination logic." },
              { title: "Fault Isolation", desc: "Failures lead to deterministic halt states, preventing unsafe system drift." },
              { title: "Full Observability", desc: "Every state transition is cryptographically logged and reconstructible post-hoc." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-2xl bg-[#11161d] border border-white/5 hover:border-sky-500/20 space-y-4 transition-all hover:shadow-2xl hover:shadow-sky-900/5 group"
              >
                <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- APP ENTRY ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewName>('landing');

  useEffect(() => {
    document.body.style.backgroundColor = '#0B0F14';
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-sky-500/30 selection:text-white bg-[#0B0F14] overflow-x-hidden">
      <Navbar view={view} setView={setView} />
      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" {...pageTransitionProps}>
              <LandingView setView={setView} />
            </motion.div>
          )}
          {view === 'concept' && (
            <motion.div key="concept" {...pageTransitionProps}>
              <ConceptPage />
            </motion.div>
          )}
          {view === 'about' && (
            <motion.div key="about" {...pageTransitionProps}>
              <AboutPage />
            </motion.div>
          )}
          {view === 'workbench' && (
            <motion.div key="workbench" {...pageTransitionProps}>
              <Workbench />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer
        setView={(v) => setView(v as any)}
      />
    </div>
  );
};

// --- ANIMATION CONSTANTS ---
const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(5px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -15, filter: 'blur(5px)', transition: { duration: 0.2 } }
};

const pageTransitionProps = {
  variants: pageVariants,
  initial: "initial",
  animate: "animate",
  exit: "exit",
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export default App;
