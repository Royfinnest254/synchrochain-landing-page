
import React from 'react';
import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react';

export function Features() {
    return (
        <section className="py-24 bg-[#020617] text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="mx-auto max-w-5xl space-y-16 px-6 relative z-10">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-black lg:text-6xl tracking-tighter">
                        The Foundation for <span className="text-blue-500">Atomic Coordination</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-light leading-relaxed">
                        SynchroChain is evolving beyond simple task management. It provides a robust, verifiable coordination layer that guarantees systemic correctness at scale.
                    </p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-slate-800/50 divide-x divide-y border border-slate-800/50 *:p-10 sm:grid-cols-2 lg:grid-cols-3 bg-slate-950/40 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="space-y-4 group hover:bg-blue-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Zap className="size-5 text-blue-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Zero-Leak</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Strict enforcement of task ownership to prevent value leakage or double-spend conditions.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-indigo-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Cpu className="size-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Parallelism</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">High-performance matrix logic allows for massively concurrent state transitions.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-emerald-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Fingerprint className="size-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Verifiable</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Every event is cryptographically hashed and appended to a permanent, immutable log.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-amber-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Pencil className="size-5 text-amber-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Adaptive</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Coordination rules can be dynamically updated without interrupting active execution streams.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-rose-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Settings2 className="size-5 text-rose-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Precision</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Granular control over node assignments and fault tolerance thresholds.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-cyan-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Sparkles className="size-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Predictive</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Early detection of potential coordination bottlenecks using real-time telemetry.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
