
"use client";

import React, { useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import * as THREE from "three";

interface FooterProps {
  setView: (view: 'landing' | 'workbench' | 'concept' | 'about') => void;
}

const FooterBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 80, 250);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Deep tech blue / muted cyan logic
    const material = new THREE.LineBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.12 
    });

    const size = 2500; 
    const segments = 60;
    const step = size / segments;

    const geometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const offset = i * step - size / 2;
      points.push(new THREE.Vector3(-size / 2, 0, offset));
      points.push(new THREE.Vector3(size / 2, 0, offset));
      points.push(new THREE.Vector3(offset, 0, -size / 2));
      points.push(new THREE.Vector3(offset, 0, size / 2));
    }

    geometry.setFromPoints(points);
    const grid = new THREE.LineSegments(geometry, material);
    grid.rotation.x = Math.PI / 12;
    group.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      group.rotation.y += 0.00015; 
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export function Footer({ setView }: FooterProps) {
  return (
    <footer className="relative w-full bg-[#0B0F14] border-t border-white/5 py-24 px-8 text-slate-400 font-sans overflow-hidden">
      <FooterBackground />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
        <div className="space-y-6">
          <div 
            onClick={() => { setView('landing'); window.scrollTo(0,0); }} 
            className="flex items-center gap-2 text-white font-bold text-xl tracking-tighter cursor-pointer group w-fit"
          >
            <Layers className="w-6 h-6 text-sky-500" />
            <span>SynchroChain</span>
          </div>
          <div className="text-sm font-light leading-relaxed text-slate-500 max-w-xs space-y-1">
            <p>© 2025 SynchroChain</p>
            <p>Independent research prototype</p>
            <p>Founder: Roy Chumba</p>
          </div>
        </div>

        <div className="flex flex-col md:items-center space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 mb-2">Navigation</h4>
          <nav className="flex flex-col md:items-center gap-3 text-xs font-bold uppercase tracking-widest">
            <button onClick={() => { setView('landing'); window.scrollTo(0,0); }} className="hover:text-white transition-colors w-fit">Home</button>
            <button onClick={() => { setView('concept'); window.scrollTo(0,0); }} className="hover:text-white transition-colors w-fit">Concept</button>
            <button onClick={() => { setView('workbench'); window.scrollTo(0,0); }} className="hover:text-white transition-colors w-fit">Prototype</button>
            <button onClick={() => { setView('about'); window.scrollTo(0,0); }} className="hover:text-white transition-colors w-fit">About</button>
          </nav>
        </div>

        <div className="md:text-right flex flex-col md:items-end space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 mb-2">Technical</h4>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Research-Grade Prototype v0.5.0
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/10 to-transparent opacity-50" />
    </footer>
  );
}
