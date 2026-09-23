"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  feasiblePolygon,
  lineRectSegment,
  type IneqSpec,
  type Pt,
} from "@/lib/geometry";
import type { CanvasSpec, PlotPoint } from "@/lib/templates";

// ─── Palet ───────────────────────────────────────────────────────────────────
const C = {
  grid: "#EFEFEF",
  gridBold: "#DCDCDC",
  axis: "#1A1A1A",
  line: "#2563EB",
  line2: "#DC2626",
  hatch: "rgba(100, 116, 139, 0.55)",
  hatchBg: "rgba(148, 163, 184, 0.16)",
  point: "#1A1A1A",
  good: "#10B981",
  amber: "#F59E0B",
  corner: "#7C3AED",
};

const LINE_COLORS = [C.line, C.line2, "#059669", "#D97706"];

export interface Props {
  spec: CanvasSpec;
  height?: number;
  interactive?: boolean;
  onTap?: (p: Pt, snapped: Pt) => void;
  taps?: Pt[];
  tapColor?: string;
  showTapIndex?: boolean;
  targets?: Pt[];
  revealTargets?: boolean;
  mini?: boolean;
  caption?: string;
  hideLegend?: boolean;
}

interface Transform { originX: number; originY: number; scale: number }

/** pola arsir diagonal untuk daerah BUKAN penyelesaian */
function hatchPattern(ctx: CanvasRenderingContext2D, size = 8): CanvasPattern | null {
  const p = document.createElement("canvas");
  p.width = size;
  p.height = size;
  const c = p.getContext("2d");
  if (!c) return null;
  c.fillStyle = C.hatchBg;
  c.fillRect(0, 0, size, size);
  c.strokeStyle = C.hatch;
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(0, size);
  c.lineTo(size, 0);
  c.moveTo(-1, 1);
  c.lineTo(1, -1);
  c.moveTo(size - 1, size + 1);
  c.lineTo(size + 1, size - 1);
  c.stroke();
  return ctx.createPattern(p, "repeat");
}

export default function CartesianCanvas({
  spec,
  height = 320,
  interactive = false,
  onTap,
  taps = [],
  tapColor = C.point,
  showTapIndex = false,
  targets = [],
  revealTargets = false,
  mini = false,
  caption,
  hideLegend = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tRef = useRef<Transform | null>(null);

  const draw = useCallback(() => {
    const canvas = ref.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = wrap.clientWidth;
    const h = Math.max(150, height);
    if (w === 0) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const [x0, x1] = spec.xRange;
    const [y0, y1] = spec.yRange;
    const pad = mini ? 16 : 28;
    const scale = Math.min((w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0));
    const originX = w / 2 - ((x0 + x1) / 2) * scale;
    const originY = h / 2 + ((y0 + y1) / 2) * scale;
    tRef.current = { originX, originY, scale };
    const PX = (x: number) => originX + x * scale;
    const PY = (y: number) => originY - y * scale;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = C.gridBold;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // ── label sumbu adaptif: pilih langkah agar label tidak menumpuk ──
    const span = Math.max(x1 - x0, y1 - y0);
    const stepUnit = span <= 10 ? 1 : span <= 20 ? 2 : span <= 40 ? 5 : 10;
    const minGapPx = mini ? 22 : 26;
    const step = Math.max(stepUnit, Math.ceil(minGapPx / scale));
    const fontSize = mini ? 8.5 : 10.5;
    ctx.font = `${fontSize}px 'IBM Plex Mono', ui-monospace, monospace`;

    // grid
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(x0); gx <= Math.floor(x1); gx++) {
      const px = Math.round(PX(gx)) + 0.5;
      ctx.strokeStyle = gx === 0 ? C.gridBold : C.grid;
      ctx.beginPath();
      ctx.moveTo(px, 2);
      ctx.lineTo(px, h - 2);
      ctx.stroke();
    }
    for (let gy = Math.ceil(y0); gy <= Math.floor(y1); gy++) {
      const py = Math.round(PY(gy)) + 0.5;
      ctx.strokeStyle = gy === 0 ? C.gridBold : C.grid;
      ctx.beginPath();
      ctx.moveTo(2, py);
      ctx.lineTo(w - 2, py);
      ctx.stroke();
    }

    // ── ARSIRAN = BUKAN daerah penyelesaian (lewat lapisan offscreen) ──
    const shadeIneqs: IneqSpec[] =
      spec.dhpIneqs && spec.dhpIneqs.length
        ? spec.dhpIneqs
        : (spec.shadeIndices ?? []).map((i) => (spec.lines ?? [])[i]).filter(Boolean);

    if (shadeIneqs.length > 0) {
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const oc = off.getContext("2d");
      if (oc) {
        oc.setTransform(dpr, 0, 0, dpr, 0, 0);
        const pat = hatchPattern(oc, mini ? 6 : 8);
        oc.fillStyle = pat ?? C.hatchBg;
        oc.fillRect(0, 0, w, h);
        // "lubangi" daerah penyelesaian supaya tampil bersih
        const keep = feasiblePolygon(shadeIneqs, spec.xRange, spec.yRange);
        if (keep.length >= 3) {
          oc.globalCompositeOperation = "destination-out";
          oc.beginPath();
          oc.moveTo(PX(keep[0].x), PY(keep[0].y));
          for (const p of keep.slice(1)) oc.lineTo(PX(p.x), PY(p.y));
          oc.closePath();
          oc.fill();
          oc.globalCompositeOperation = "source-over";
        }
        ctx.drawImage(off, 0, 0, w, h);
        // garis tepi daerah penyelesaian
        if (keep.length >= 3) {
          ctx.strokeStyle = "rgba(16,185,129,0.85)";
          ctx.lineWidth = mini ? 1.4 : 2;
          ctx.beginPath();
          ctx.moveTo(PX(keep[0].x), PY(keep[0].y));
          for (const p of keep.slice(1)) ctx.lineTo(PX(p.x), PY(p.y));
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    // ── sumbu ──
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 1.7;
    if (y0 <= 0 && y1 >= 0) {
      ctx.beginPath();
      ctx.moveTo(2, PY(0));
      ctx.lineTo(w - 2, PY(0));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w - 2, PY(0)); ctx.lineTo(w - 10, PY(0) - 4);
      ctx.moveTo(w - 2, PY(0)); ctx.lineTo(w - 10, PY(0) + 4);
      ctx.stroke();
      ctx.fillStyle = C.axis;
      ctx.textAlign = "right";
      ctx.fillText("x", w - 12, PY(0) - 6);
    }
    if (x0 <= 0 && x1 >= 0) {
      ctx.beginPath();
      ctx.moveTo(PX(0), h - 2);
      ctx.lineTo(PX(0), 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PX(0), 2); ctx.lineTo(PX(0) - 4, 10);
      ctx.moveTo(PX(0), 2); ctx.lineTo(PX(0) + 4, 10);
      ctx.stroke();
      ctx.fillStyle = C.axis;
      ctx.textAlign = "left";
      ctx.fillText("y", PX(0) + 6, 13);
    }

    // ── angka pada sumbu (selalu tampil, termasuk pada grafik mini) ──
    ctx.fillStyle = "#6B7280";
    const axisY = y0 <= 0 && y1 >= 0 ? PY(0) : h - 4;
    const axisX = x0 <= 0 && x1 >= 0 ? PX(0) : 4;
    ctx.textAlign = "center";
    for (let gx = Math.ceil(x0 / step) * step; gx <= x1; gx += step) {
      if (gx === 0) continue;
      const px = PX(gx);
      if (px < 10 || px > w - 10) continue;
      const py = Math.min(axisY + fontSize + 3, h - 3);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(px - 8, py - fontSize, 16, fontSize + 2);
      ctx.fillStyle = "#6B7280";
      ctx.fillText(String(gx), px, py);
    }
    ctx.textAlign = "right";
    for (let gy = Math.ceil(y0 / step) * step; gy <= y1; gy += step) {
      if (gy === 0) continue;
      const py = PY(gy);
      if (py < 10 || py > h - 6) continue;
      const px = Math.max(axisX - 5, 16);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(px - 15, py - fontSize / 2 - 2, 17, fontSize + 3);
      ctx.fillStyle = "#6B7280";
      ctx.fillText(String(gy), px, py + fontSize / 2 - 1);
    }
    if (x0 <= 0 && x1 >= 0 && y0 <= 0 && y1 >= 0) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#9CA3AF";
      ctx.fillText("0", PX(0) - 4, PY(0) + fontSize + 2);
    }

    // ── garis pembatas ──
    (spec.lines ?? []).forEach((l, i) => {
      const seg = lineRectSegment(l, spec.xRange, spec.yRange);
      if (!seg) return;
      ctx.strokeStyle = l.color ?? LINE_COLORS[i % LINE_COLORS.length];
      ctx.lineWidth = mini ? 2.2 : 3;
      ctx.setLineDash(l.dashed ? [8, 6] : []);
      ctx.beginPath();
      ctx.moveTo(PX(seg[0].x), PY(seg[0].y));
      ctx.lineTo(PX(seg[1].x), PY(seg[1].y));
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // ── crosshair titik uji ──
    if (spec.crosshair) {
      const p = spec.crosshair;
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(PX(p.x), PY(p.y), 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PX(p.x) - 14, PY(p.y)); ctx.lineTo(PX(p.x) + 14, PY(p.y));
      ctx.moveTo(PX(p.x), PY(p.y) - 14); ctx.lineTo(PX(p.x), PY(p.y) + 14);
      ctx.stroke();
    }

    // ── titik statis ──
    for (const pp of spec.points ?? []) {
      const { p } = pp;
      ctx.beginPath();
      ctx.arc(PX(p.x), PY(p.y), mini ? 4 : 5.5, 0, Math.PI * 2);
      if (pp.hollow) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = pp.color ?? C.point;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      } else {
        ctx.fillStyle = pp.color ?? C.point;
        ctx.fill();
      }
      if (pp.label && !mini) {
        ctx.font = `600 ${fontSize + 0.5}px 'Inter', sans-serif`;
        const tw = ctx.measureText(pp.label).width;
        const lx = Math.min(PX(p.x) + 8, w - tw - 5);
        const ly = Math.max(PY(p.y) - 9, 12);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillRect(lx - 2, ly - fontSize, tw + 4, fontSize + 4);
        ctx.fillStyle = pp.color ?? C.point;
        ctx.textAlign = "left";
        ctx.fillText(pp.label, lx, ly);
      }
    }

    if (revealTargets) {
      for (const t of targets) {
        ctx.beginPath();
        ctx.arc(PX(t.x), PY(t.y), 8.5, 0, Math.PI * 2);
        ctx.strokeStyle = C.good;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // ── ketukan siswa ──
    taps.forEach((t, i) => {
      ctx.beginPath();
      ctx.arc(PX(t.x), PY(t.y), mini ? 5 : 7.5, 0, Math.PI * 2);
      ctx.fillStyle = tapColor;
      ctx.fill();
      if (showTapIndex) {
        ctx.font = `bold ${mini ? 8 : 10.5}px 'Inter', sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), PX(t.x), PY(t.y) + 0.5);
        ctx.textBaseline = "alphabetic";
      }
    });

    // ── legenda arsiran ──
    if (shadeIneqs.length > 0 && !hideLegend && !mini) {
      const label = "Arsiran = BUKAN daerah penyelesaian";
      ctx.font = "600 9.5px 'Inter', sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(255,255,255,0.93)";
      ctx.fillRect(w - tw - 14, h - 19, tw + 10, 15);
      ctx.strokeStyle = "#E5E5E5";
      ctx.lineWidth = 1;
      ctx.strokeRect(w - tw - 14.5, h - 19.5, tw + 10, 15);
      ctx.fillStyle = "#525252";
      ctx.textAlign = "left";
      ctx.fillText(label, w - tw - 9, h - 8);
    }
  }, [spec, height, mini, taps, tapColor, showTapIndex, revealTargets, targets, hideLegend]);

  useEffect(() => {
    draw();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !onTap) return;
    const canvas = ref.current;
    const t = tRef.current;
    if (!canvas || !t) return;
    const rect = canvas.getBoundingClientRect();
    const xCart = (e.clientX - rect.left - t.originX) / t.scale;
    const yCart = (t.originY - (e.clientY - rect.top)) / t.scale;
    const within =
      xCart >= spec.xRange[0] - 0.4 && xCart <= spec.xRange[1] + 0.4 &&
      yCart >= spec.yRange[0] - 0.4 && yCart <= spec.yRange[1] + 0.4;
    if (!within) return;
    onTap(
      { x: xCart, y: yCart },
      {
        x: Math.max(spec.xRange[0], Math.min(spec.xRange[1], Math.round(xCart))),
        y: Math.max(spec.yRange[0], Math.min(spec.yRange[1], Math.round(yCart))),
      }
    );
  };

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <canvas
        ref={ref}
        onPointerDown={handlePointer}
        className={`block w-full rounded-xl ${interactive ? "cursor-crosshair touch-none" : ""}`}
        style={{ height }}
        aria-label={caption ?? "Bidang koordinat Kartesius"}
      />
      {interactive && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium tracking-wide text-white">
          Ketuk titik pada grid
        </div>
      )}
    </div>
  );
}

export function vibrate(pattern: number | number[] = 50) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* abaikan */
  }
}
