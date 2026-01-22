"use client";

import React from "react";
import { Layers } from "lucide-react";

interface FooterProps {
  setView: (view: 'landing' | 'workbench' | 'concept' | 'about') => void;
}

export function Footer({ setView }: FooterProps) {
  return (
    <footer className="w-full bg-[#0a0a0b] border-t border-white/[0.04] py-16 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <button
              onClick={() => { setView('landing'); window.scrollTo(0, 0); }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-8 bg-white/[0.06] rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white/80" />
              </div>
              <span className="text-white font-medium tracking-tight">SynchroChain</span>
            </button>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              A research prototype exploring correctness-first coordination
              in distributed systems.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">
              Navigate
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: 'Home', view: 'landing' },
                { label: 'Concept', view: 'concept' },
                { label: 'Workbench', view: 'workbench' },
                { label: 'About', view: 'about' },
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => { setView(item.view as any); window.scrollTo(0, 0); }}
                  className="text-sm text-white/50 hover:text-white transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">
              Status
            </h4>
            <div className="space-y-2 text-sm text-white/40">
              <p>Research Preview</p>
              <p>Version 1.1</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © 2025 SynchroChain Research. Independent project.
          </p>
          <p className="text-xs text-white/20">
            Photography via Unsplash
          </p>
        </div>
      </div>
    </footer>
  );
}
