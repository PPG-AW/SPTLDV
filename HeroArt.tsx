"use client";

import { useEffect, useRef } from "react";

/** Kanvas hero: bidang Kartesius monokrom dengan garis & arsiran menyapu halus. */
export default function HeroArt({ dark = true }: { dark?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = (tms: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0) return;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const t = reduced ? 0.4 : (tms % 16000) / 16000;
      const cx = w * 0.5;
      const cy = h * 0.62;
      const scale = Math.min(w, h) / 14;

      // grid
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
      ctx.lineWidth = 1;
      for (let x = -7; x <= 7; x++) {
        ctx.beginPath();
        ctx.moveTo(cx + x * scale, 0);
        ctx.lineTo(cx + x * scale, h);
        ctx.stroke();
      }
      for (let y = -7; y <= 7; y++) {
        ctx.beginPath();
        ctx.moveTo(0, cy + y * scale);
        ctx.lineTo(w, cy + y * scale);
        ctx.stroke();
      }

      // dua garis pembatas statis
      const lines: { a: number; b: number; c: number; dashed?: boolean }[] = [
        { a: 1, b: 1, c: 5 },
        { a: 2, b: 1, c: 7 },
      ];
      const xForY = (l: { a: number; b: number; c: number }, yCart: number) => (l.c - l.b * yCart) / l.a;
      const yForX = (l: { a: number; b: number; c: number }, xCart: number) => (l.c - l.a * xCart) / l.b;

      // DHP segi empat (0,0),(x-int kecil),(intersect),(y-int kecil)
      const corners = [
        { x: 0, y: 0 },
        { x: Math.min(5, 3.5), y: 0 },
        { x: 2, y: 3 },
        { x: 0, y: 5 },
      ];
      const pulse = 0.28 + 0.1 * Math.sin(t * Math.PI * 2);
      ctx.beginPath();
      corners.forEach((p, i) => {
        const px = cx + p.x * scale;
        const py = cy - p.y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = `rgba(147, 51, 234, ${pulse})`;
      ctx.fill();

      for (const l of lines) {
        ctx.strokeStyle = dark ? "#3B82F6" : "#1D4ED8";
        ctx.lineWidth = 2.4;
        ctx.setLineDash(l.dashed ? [8, 6] : []);
        ctx.beginPath();
        ctx.moveTo(cx + xForY(l, -7) * scale, cy + 7 * scale);
        ctx.lineTo(cx + xForY(l, 7) * scale, cy - 7 * scale);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // titik pojok berdenyut
      corners.forEach((p, i) => {
        const r = 3.2 + 1.4 * Math.sin(t * Math.PI * 2 + i * 1.3);
        ctx.beginPath();
        ctx.arc(cx + p.x * scale, cy - p.y * scale, Math.max(1.5, r), 0, Math.PI * 2);
        ctx.fillStyle = dark ? "#FBBF24" : "#F59E0B";
        ctx.fill();
      });

      // garis tujuan menyapu (garis selidik)
      const k = 1 + 3.2 * t;
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.5)" : "rgba(26,26,26,0.45)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      // f = x + y = k  →  garis dengan gradien -1
      ctx.moveTo(cx + (k - 7) * scale, cy + 7 * scale);
      ctx.lineTo(cx + (k + 7) * scale, cy - 7 * scale);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!reduced) rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dark]);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />;
}
