
"use client"
import React from 'react';
import { Waitlist } from './ui/waitlist';

export const WaitlistDemo = () => {
    return (
        <div className="w-full py-20 flex flex-col justify-center items-center bg-[#0B0F14] border-t border-white/5">
            <div className="text-center mb-8">
                <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    Serenity UI Integration
                </div>
                <h3 className="text-slate-400 text-sm font-mono">Component Preview</h3>
            </div>
            <div className="w-full max-w-2xl px-6">
                <Waitlist mode="dark" />
            </div>
        </div>
    );
};
