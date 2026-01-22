
import React from 'react';
import { ShieldCheck, AlertTriangle, Eye, Zap, Cpu, Fingerprint } from 'lucide-react';

export function Features() {
    return (
        <section className="py-24 bg-[#020617] text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="mx-auto max-w-5xl space-y-16 px-6 relative z-10">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <div className="flex justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-sky-500 border border-sky-500/20 bg-sky-500/10 px-3 py-1 rounded-full">
                            Evidence-Based
                        </span>
                    </div>
                    <h2 className="text-balance text-4xl font-black lg:text-5xl tracking-tighter text-white">
                        System Integrity
                    </h2>
                    <p className="text-slate-400 text-lg font-light leading-relaxed">
                        Demonstrating coordination correctness across asynchronous networks through deterministic log verification.
                    </p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-slate-800/50 divide-x divide-y border border-slate-800/50 *:p-10 sm:grid-cols-2 lg:grid-cols-3 bg-slate-950/40 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="space-y-4 group hover:bg-blue-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="size-5 text-blue-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Correctness First</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Explicit enforcement of at-most-once execution via immutable coordination logic.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-rose-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-5 text-rose-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Fault Isolation</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Failures lead to deterministic halt states, preventing unsafe system drift.</p>
                    </div>
                    <div className="space-y-4 group hover:bg-emerald-500/5 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                            <Eye className="size-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Full Observability</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed">Every state transition is cryptographically logged and reconstructible post-hoc.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

