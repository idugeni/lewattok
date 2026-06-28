"use client";

import { useEffect, useState, useRef } from "react";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Aurora blobs
      const blobs = [
        { x: 0.3, y: 0.3, r: 250, color: "129, 140, 248", speed: 0.0004, phase: 0 },
        { x: 0.7, y: 0.5, r: 200, color: "167, 139, 250", speed: 0.0005, phase: 2 },
        { x: 0.5, y: 0.7, r: 180, color: "196, 181, 253", speed: 0.0003, phase: 4 },
      ];

      for (const blob of blobs) {
        const bx = w * blob.x + Math.sin(time * blob.speed + blob.phase) * 80;
        const by = h * blob.y + Math.cos(time * blob.speed * 0.7 + blob.phase) * 60;
        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, blob.r);
        gradient.addColorStop(0, `rgba(${blob.color}, 0.12)`);
        gradient.addColorStop(0.5, `rgba(${blob.color}, 0.04)`);
        gradient.addColorStop(1, `rgba(${blob.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      if (!prefersReduced) {
        time += 16;
        animId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [mounted]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
      aria-hidden="true"
    />
  );
}
