import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Check, Shield, Eye, Zap, Lock, Database, GitBranch, Layers, Terminal, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Footer } from './components/ui/footer';
import { Workbench } from './components/Workbench';
import { WaitlistSection } from './components/WaitlistSection';
import { ShaderAnimation, GridShader } from './components/ui/shader-lines';
import { ChatSection } from './components/ChatSection';

type ViewName = 'landing' | 'workbench' | 'concept' | 'about';

// Curated Unsplash photos - real photography
const PHOTOS = {
  serverRack: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  dataCenter: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  circuitBoard: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  networkCables: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
  serverRoom: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  codeScreen: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  techAbstract: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  engineering: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
};

// Consistent nav
const Nav = ({ view, setView }: { view: ViewName; setView: (v: ViewName) => void }) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/[0.04]">
    <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <button onClick={() => setView('landing')} className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/[0.06] rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-white/80" />
        </div>
        <span className="text-white font-medium tracking-tight">SynchroChain</span>
      </button>

      <nav className="flex items-center gap-6">
        {(['concept', 'workbench', 'about'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`text-sm capitalize transition-colors ${view === item ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  </header>
);

// Photo component with overlay
const Photo = ({ src, label, className = '' }: { src: string; label: string; className?: string }) => (
  <div className={`relative overflow-hidden rounded-xl group ${className}`}>
    <img
      src={src}
      alt={label}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <div className="absolute bottom-4 left-4">
      <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{label}</span>
    </div>
  </div>
);

// Feature card
const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-colors"
  >
    <div className="w-10 h-10 bg-white/[0.04] rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-white/70" />
    </div>
    <h3 className="text-white font-medium mb-2">{title}</h3>
    <p className="text-sm text-white/40 leading-relaxed">{description}</p>
  </motion.div>
);

// Landing page
const Landing = ({ setView }: { setView: (v: ViewName) => void }) => (
  <div className="min-h-screen bg-[#0a0a0b]">

    {/* Hero */}
    <section className="min-h-screen relative pt-24">
      {/* Shader background */}
      <div className="absolute inset-0">
        <ShaderAnimation />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0b]/50 to-[#0a0a0b]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="min-h-[85vh] flex flex-col justify-center">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-3 text-xs text-white/40 uppercase tracking-[0.15em]">
              <span className="w-6 h-px bg-white/20" />
              Research Prototype
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-light text-white leading-[1.1] mb-8"
          >
            Coordination<br />
            <span className="text-white/35">before consensus.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 max-w-xl mb-10 leading-relaxed"
          >
            A research prototype exploring correctness-first distributed execution.
            No consensus overhead. Full observability. Deterministic fault handling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => setView('workbench')}
              className="group px-6 py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-all flex items-center gap-2"
            >
              Open Workbench
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setView('concept')}
              className="px-6 py-3 text-white/50 text-sm hover:text-white transition-colors flex items-center gap-2"
            >
              Read Documentation
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 right-[10%] w-80 h-80 border border-white/[0.04] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-[20%] w-2 h-2 bg-blue-500/50 rounded-full" />
    </section>

    {/* Photo hero */}
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Photo src={PHOTOS.serverRack} label="Infrastructure" className="aspect-[4/3]" />
          <div className="grid grid-rows-2 gap-4">
            <Photo src={PHOTOS.dataCenter} label="Distributed Systems" className="aspect-[8/3]" />
            <Photo src={PHOTOS.circuitBoard} label="Precision Engineering" className="aspect-[8/3]" />
          </div>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-4 tracking-wide">
          Photography by Unsplash contributors
        </p>
      </div>
    </section>

    {/* What it does */}
    <section className="py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mb-16">
          <h2 className="text-3xl font-light text-white mb-4">
            What does SynchroChain do?
          </h2>
          <p className="text-white/40 leading-relaxed">
            It coordinates task execution across distributed nodes while guaranteeing
            that each task runs exactly once—even when nodes fail.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            icon={Check}
            title="At-most-once execution"
            description="Tasks never run twice. Duplicate submissions are blocked at intake before assignment."
          />
          <FeatureCard
            icon={Shield}
            title="Deterministic blocking"
            description="When safety cannot be verified, the system waits. No silent corruption or data loss."
          />
          <FeatureCard
            icon={Eye}
            title="Full audit trail"
            description="Every state transition is logged immutably. Complete execution history is reconstructable."
          />
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl font-light text-white mb-6">
              How it works
            </h2>
            <div className="space-y-6">
              {[
                { num: '01', title: 'Task submission', desc: 'Tasks enter through a single coordination point with deduplication.' },
                { num: '02', title: 'Matrix assignment', desc: 'Each task maps to exactly one node via a binary assignment matrix.' },
                { num: '03', title: 'Execution & logging', desc: 'Every state transition is hash-chained for tamper detection.' },
                { num: '04', title: 'Fault handling', desc: 'Node failures trigger safe-wait states. No automatic retries.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <span className="text-sm font-mono text-white/20">{step.num}</span>
                  <div>
                    <h3 className="text-white font-medium mb-1">{step.title}</h3>
                    <p className="text-sm text-white/40">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Photo src={PHOTOS.networkCables} label="Network Layer" className="aspect-square" />
        </div>
      </div>
    </section>

    {/* Technical capabilities */}
    <section className="py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-light text-white mb-4">
          Technical capabilities
        </h2>
        <p className="text-white/40 mb-12 max-w-xl">
          Built for correctness, not speed. Every feature serves the core invariant.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard icon={Lock} title="Hash-chained logs" description="SHA-256 linked events with Rokich anchors for efficient verification." />
          <FeatureCard icon={Database} title="Binary matrix" description="Structural enforcement of single-assignment invariant." />
          <FeatureCard icon={GitBranch} title="State machine" description="Six formal states with deterministic transitions." />
          <FeatureCard icon={Terminal} title="Full export" description="CSV and JSON export of tasks, events, and chain data." />
        </div>
      </div>
    </section>

    {/* More photos */}
    <section className="py-20 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Photo src={PHOTOS.codeScreen} label="Observability" className="aspect-[4/3]" />
          <Photo src={PHOTOS.techAbstract} label="Data Flow" className="aspect-[4/3]" />
          <Photo src={PHOTOS.engineering} label="Engineering" className="aspect-[4/3]" />
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '6', label: 'Task states', sub: 'Formal lifecycle' },
            { value: '12', label: 'Invariants', sub: 'Enforced always' },
            { value: '3', label: 'Fault modes', sub: 'Handled safely' },
            { value: '100%', label: 'Reconstructable', sub: 'From logs alone' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-light text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/70 mb-0.5">{stat.label}</div>
              <div className="text-xs text-white/30">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-32 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-light text-white mb-6">
          See it in action
        </h2>
        <p className="text-white/40 mb-10 max-w-md mx-auto">
          The workbench lets you submit tasks, inject failures,
          and observe how the system maintains correctness.
        </p>
        <button
          onClick={() => setView('workbench')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
        >
          Launch Workbench
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>

    {/* Waitlist */}
    <div className="border-t border-white/[0.04]">
      <WaitlistSection />
    </div>
  </div>
);

// Concept page - matches landing style
const Concept = () => (
  <div className="min-h-screen bg-[#0a0a0b] pt-28 pb-24">
    <div className="max-w-3xl mx-auto px-6">

      <header className="mb-16">
        <span className="inline-flex items-center gap-3 text-xs text-white/40 uppercase tracking-[0.15em] mb-6">
          <span className="w-6 h-px bg-white/20" />
          Documentation
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-white leading-tight mb-6">
          The core concept
        </h1>
        <p className="text-lg text-white/50">
          Why coordination matters more than consensus speed.
        </p>
      </header>

      {/* Hero photo */}
      <Photo src={PHOTOS.dataCenter} label="Distributed Infrastructure" className="aspect-[2/1] mb-16" />

      <article className="space-y-16">

        <section>
          <h2 className="text-2xl font-light text-white mb-6">The problem</h2>
          <p className="text-white/50 leading-relaxed mb-4">
            When a node fails mid-execution, you face a fundamental question:
            did the task complete or not? Without definitive evidence, systems typically choose one of two bad options:
          </p>
          <div className="space-y-3 pl-4 border-l border-white/10">
            <p className="text-white/40">→ Assume failure and retry (risking double execution)</p>
            <p className="text-white/40">→ Assume success and continue (risking data loss)</p>
          </div>
          <p className="text-white/50 leading-relaxed mt-4">
            Both lead to silent corruption—the kind that surfaces weeks later
            when the numbers don't add up.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-light text-white mb-6">The approach</h2>
          <p className="text-white/50 leading-relaxed mb-4">
            SynchroChain takes a different stance: <strong className="text-white/70">when uncertain, block</strong>.
          </p>
          <p className="text-white/50 leading-relaxed">
            This is deliberately conservative. Tasks wait. Throughput drops.
            But the invariant holds: no task executes more than once, and
            every execution is verifiable from the logs.
          </p>
        </section>

        {/* Inline photo */}
        <Photo src={PHOTOS.codeScreen} label="Event Logging" className="aspect-[2/1]" />

        <section>
          <h2 className="text-2xl font-light text-white mb-6">Key mechanisms</h2>
          <div className="grid gap-6">
            {[
              { icon: Lock, title: 'Hash-chained event log', desc: 'Every state transition is recorded with a cryptographic link to the previous event. Tampering is detectable.' },
              { icon: Database, title: 'Binary assignment matrix', desc: 'Each task maps to exactly one primary node. The mapping is enforced structurally, not by convention.' },
              { icon: Clock, title: 'Safe-wait states', desc: 'Tasks that cannot be verified enter a blocked state until an operator intervenes with evidence.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="w-10 h-10 bg-white/[0.04] rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <blockquote className="text-xl text-white/70 italic text-center">
            "A system that can prove what happened is more valuable
            than a system that's merely fast."
          </blockquote>
        </section>

        <section>
          <h2 className="text-2xl font-light text-white mb-6">What this is not</h2>
          <p className="text-white/50 leading-relaxed mb-4">
            To be clear about scope:
          </p>
          <ul className="space-y-2 text-white/40">
            <li>• Not a blockchain or cryptocurrency</li>
            <li>• No proof-of-work, proof-of-stake, or tokens</li>
            <li>• Not optimized for high throughput</li>
            <li>• Not production-ready</li>
          </ul>
          <p className="text-white/50 leading-relaxed mt-4">
            The "chain" in SynchroChain refers to the hash-linked event log structure,
            not a distributed ledger.
          </p>
        </section>
      </article>
    </div>
  </div>
);

// About page - matches landing style
const About = () => (
  <div className="min-h-screen bg-[#0a0a0b] pt-28 pb-24">
    <div className="max-w-3xl mx-auto px-6">

      <header className="mb-16">
        <span className="inline-flex items-center gap-3 text-xs text-white/40 uppercase tracking-[0.15em] mb-6">
          <span className="w-6 h-px bg-white/20" />
          About
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-white leading-tight">
          Research context
        </h1>
      </header>

      <Photo src={PHOTOS.engineering} label="Engineering Focus" className="aspect-[2/1] mb-16" />

      <div className="space-y-12">

        <section>
          <h2 className="text-xl font-medium text-white mb-4">What this is</h2>
          <p className="text-white/50 leading-relaxed">
            SynchroChain is a research prototype—not a product. It explores whether
            coordination-first design can solve reliability problems that
            consensus-based systems struggle with. The focus is on correctness
            and observability over throughput.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-white mb-4">Motivation</h2>
          <p className="text-white/50 leading-relaxed">
            Most "exactly-once delivery" guarantees fail in practice. Systems handle
            this through retries and deduplication—which works until nodes fail at
            inconvenient moments. This project explores what happens when you
            prioritize correctness over progress.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-white mb-4">Origin</h2>
          <p className="text-white/50 leading-relaxed">
            The project started in late 2023 after observing patterns of silent
            failures in distributed systems. The current prototype demonstrates
            the core concepts. Production readiness is not a near-term goal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-white mb-4">Current status</h2>
          <p className="text-white/50 leading-relaxed mb-6">
            The workbench is functional but simplified. It demonstrates task
            coordination, fault injection, and the hash-chained event log.
            More sophisticated scenarios are planned.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/[0.06]">
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Version</div>
              <div className="text-white">1.1 Research Preview</div>
            </div>
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Initiated by</div>
              <div className="text-white">Roy Chumba</div>
            </div>
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Started</div>
              <div className="text-white">Late 2023</div>
            </div>
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2">License</div>
              <div className="text-white">MIT</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
);

// Main App
const App: React.FC = () => {
  const [view, setView] = useState<ViewName>('landing');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20">
      <Nav view={view} setView={setView} />

      {view === 'landing' && <Landing setView={setView} />}
      {view === 'concept' && <Concept />}
      {view === 'about' && <About />}
      {view === 'workbench' && <Workbench />}

      {view !== 'workbench' && <Footer setView={(v) => setView(v as ViewName)} />}

      {/* Global Chat Assistant */}
      <ChatSection />
    </div>
  );
};

export default App;
