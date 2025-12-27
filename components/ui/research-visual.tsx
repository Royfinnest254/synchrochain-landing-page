
"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function ResearchVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(100, 100, 200);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Extremely faint blue wireframe for research-grade feel
    const material = new THREE.LineBasicMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.08 
    });

    const size = 350;
    const segments = 15;
    const step = size / segments;

    for (let p = 0; p < 3; p++) {
      const planeY = (p - 1) * 60;
      const geometry = new THREE.BufferGeometry();
      const points = [];

      for (let i = 0; i <= segments; i++) {
        const offset = i * step - size / 2;
        points.push(new THREE.Vector3(-size / 2, planeY, offset));
        points.push(new THREE.Vector3(size / 2, planeY, offset));
        points.push(new THREE.Vector3(offset, planeY, -size / 2));
        points.push(new THREE.Vector3(offset, planeY, size / 2));
      }

      geometry.setFromPoints(points);
      const grid = new THREE.LineSegments(geometry, material);
      grid.rotation.x = p * 0.05;
      group.add(grid);
    }

    const nodeGeometry = new THREE.SphereGeometry(0.8, 4, 4);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.1 });
    for(let i=0; i<8; i++) {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.set(
        (Math.random() - 0.5) * size,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * size
      );
      group.add(mesh);
    }

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      group.rotation.y += 0.0001; 
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
      nodeGeometry.dispose();
      nodeMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
