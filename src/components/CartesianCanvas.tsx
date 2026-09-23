"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  feasiblePolygon,
  lineRectSegment,
  type IneqSpec,
  type Pt,
} from "@/lib/geometry";
import type { CanvasSpec, PlotPoint } from "@/lib/templates";

// ─── Warna sesuai spesifikasi desain ─────────────────────────────────────────
const C = {
  grid: "#ECECEC",
  gridBold: "#D9D9D9",
  axis: "#1A1A1A",
  line: "#2563EB",
  shade: "rgba(59, 130, 246, 0.25)",
  shadeSoft: "rgba(59, 130, 246, 0.14)",
  dhp: "rgba(147, 51, 234, 0.45)",
  dhpStroke: "rgba(147, 51, 234, 0.9)",
  point: "#1A1A1A",
  good: "#10B981",
  bad: "#EF4444",
  amber: "#F59E0B",
};

export interface CanvasHandle {
  toCart: (px: number, py: number) => Pt;
}

interface Props {
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
}

interface Transform {
  originX: number;
  originY: number;
  scale: number;
  w: number;
  h: number;
  pad: number;
}

function isAxisLine(l: IneqSpec): boolean {
  return (l.a === 1 && l.b === 0 && l.c === 0) || (l.a === 0 && l.b === 1 && l.c === 0);
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
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<Transform | null>(null);

  const draw = useCallback(() => {
    const canvas = ref.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = wrap.clientWidth;
    const h = Math.max(180, height);
    if (w === 0) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const [x0, x1] = spec.xRange;
    const [y0, y1] = spec.yRange;
    const pad = mini ? 14 : 26;
    const scale = Math.min((w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0));
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    const originX = w / 2 - midX * scale;
    const originY = h / 2 + midY * scale;
    transformRef.current = { originX, originY, scale, w, h, pad };

    const PX = (x: number) => originX + x * scale;
    const PY = (y: number) => originY - y * scale;

    // latar
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = C.gridBold;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // ── grid ──
    ctx.lineWidth = 1;
    ctx.font = "10px 'IBM Plex Mono', ui-monospace, monospace";
    for (let gx = Math.ceil(x0); gx <= Math.floor(x1); gx++) {
      const px = Math.round(PX(gx)) + 0.5;
      ctx.strokeStyle = gx === 0 ? C.gridBold : C.grid;
      ctx.beginPath();
      ctx.moveTo(px, 2);
      ctx.lineTo(px, h - 2);
      ctx.stroke();
      if (!mini && gx !== 0 && Math.abs(gx) <= Math.max(x1, x0)) {
        ctx.fillStyle = "#9CA3AF";
        ctx.textAlign = "center";
        if (PY(0) > h - 14) ctx.fillText(String(gx), px, h - 8);
        else ctx.fillText(String(gx), px, Math.min(PY(0) + 14, h - 8));
      }
    }
    for (let gy = Math.ceil(y0); gy <= Math.floor(y1); gy++) {
      const py = Math.round(PY(gy)) + 0.5;
      ctx.strokeStyle = gy === 0 ? C.gridBold : C.grid;
      ctx.beginPath();
      ctx.moveTo(2, py);
      ctx.lineTo(w - 2, py);
      ctx.stroke();
      if (!mini && gy !== 0) {
        ctx.fillStyle = "#9CA3AF";
        ctx.textAlign = "right";
        if (PX(0) < 20) ctx.fillText(String(gy), 18, py + 3);
        else ctx.fillText(String(gy), PX(0) - 6, py + 3);
      }
    }

    // ── sumbu ──
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 1.6;
    if (y0 <= 0 && y1 >= 0) {
      ctx.beginPath();
      ctx.moveTo(2, PY(0));
      ctx.lineTo(w - 2, PY(0));
      ctx.stroke();
      // panah
      ctx.beginPath();
      ctx.moveTo(w - 2, PY(0));
      ctx.lineTo(w - 9, PY(0) - 4);
      ctx.moveTo(w - 2, PY(0));
      ctx.lineTo(w - 9, PY(0) + 4);
      ctx.stroke();
      ctx.fillStyle = C.axis;
      ctx.textAlign = "left";
      ctx.fillText("x", w - 16, PY(0) - 6);
    }
    if (x0 <= 0 && x1 >= 0) {
      ctx.beginPath();
      ctx.moveTo(PX(0), h - 2);
      ctx.lineTo(PX(0), 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PX(0), 2);
      ctx.lineTo(PX(0) - 4, 9);
      ctx.moveTo(PX(0), 2);
      ctx.lineTo(PX(0) + 4, 9);
      ctx.stroke();
      ctx.fillStyle = C.axis;
      ctx.textAlign = "left";
      ctx.fillText("y", PX(0) + 6, 14);
    }

    // ── arsiran individual ──
    const lines = spec.lines ?? [];
    for (const idx of spec.shadeIndices ?? []) {
      const l = lines[idx];
      if (!l) continue;
      const poly = feasiblePolygon([l], spec.xRange, spec.yRange);
      if (poly.length >= 3) {
        ctx.fillStyle = C.shade;
        ctx.beginPath();
        ctx.moveTo(PX(poly[0].x), PY(poly[0].y));
        for (const p of poly.slice(1)) ctx.lineTo(PX(p.x), PY(p.y));
        ctx.closePath();
        ctx.fill();
      }
    }

    // ── DHP (irisan) ──
    if (spec.dhpIneqs && spec.dhpIneqs.length > 0) {
      // lapis lembut untuk tiap kendala non-sumbu
      for (const ineq of spec.dhpIneqs) {
        if (isAxisLine(ineq)) continue;
        const poly = feasiblePolygon([ineq], spec.xRange, spec.yRange);
        if (poly.length >= 3) {
          ctx.fillStyle = C.shadeSoft;
          ctx.beginPath();
          ctx.moveTo(PX(poly[0].x), PY(poly[0].y));
          for (const p of poly.slice(1)) ctx.lineTo(PX(p.x), PY(p.y));
          ctx.closePath();
          ctx.fill();
        }
      }
      const dhp = feasiblePolygon(spec.dhpIneqs, spec.xRange, spec.yRange);
      if (dhp.length >= 2) {
        ctx.fillStyle = C.dhp;
        ctx.beginPath();
        ctx.moveTo(PX(dhp[0].x), PY(dhp[0].y));
        for (const p of dhp.slice(1)) ctx.lineTo(PX(p.x), PY(p.y));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = C.dhpStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // garis batas sumbu dari DHP
        ctx.strokeStyle = C.axis;
        ctx.lineWidth = 1.2;
      }
    }

    // ── garis pembatas ──
    for (const l of lines) {
      const seg = lineRectSegment(l, spec.xRange, spec.yRange);
      if (!seg) continue;
      ctx.strokeStyle = l.color ?? C.line;
      ctx.lineWidth = mini ? 2.2 : 3;
      ctx.setLineDash(l.dashed ? [8, 6] : []);
      ctx.beginPath();
      ctx.moveTo(PX(seg[0].x), PY(seg[0].y));
      ctx.lineTo(PX(seg[1].x), PY(seg[1].y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── crosshair titik uji ──
    if (spec.crosshair) {
      const p = spec.crosshair;
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(PX(p.x), PY(p.y), 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PX(p.x) - 14, PY(p.y));
      ctx.lineTo(PX(p.x) + 14, PY(p.y));
      ctx.moveTo(PX(p.x), PY(p.y) - 14);
      ctx.lineTo(PX(p.x), PY(p.y) + 14);
      ctx.stroke();
    }

    // ── titik statis ──
    const drawPoint = (ptDef: PlotPoint, idx?: number) => {
      const { p } = ptDef;
      ctx.beginPath();
      ctx.arc(PX(p.x), PY(p.y), mini ? 4 : 5, 0, Math.PI * 2);
      if (ptDef.hollow) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = ptDef.color ?? C.point;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = ptDef.color ?? C.point;
        ctx.fill();
      }
      const label = ptDef.label ?? (idx !== undefined ? String(idx + 1) : undefined);
      if (label) {
        ctx.font = `${mini ? 8 : 11}px 'IBM Plex Mono', ui-monospace, monospace`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (!ptDef.hollow && label.length <= 2) ctx.fillText(label, PX(p.x), PY(p.y) + 0.5);
        else if (ptDef.label) {
          ctx.font = `${mini ? 9 : 11}px 'Inter', sans-serif`;
          ctx.fillStyle = C.point;
          ctx.fillText(ptDef.label, PX(p.x) + 4, PY(p.y) - 12);
        }
        ctx.textBaseline = "alphabetic";
      }
    };
    (spec.points ?? []).forEach((pp) => drawPoint(pp));

    // ── target (reveal) ──
    if (revealTargets) {
      for (const t of targets) {
        ctx.beginPath();
        ctx.arc(PX(t.x), PY(t.y), 8, 0, Math.PI * 2);
        ctx.strokeStyle = C.good;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // ── ketukan pengguna ──
    taps.forEach((t, i) => {
      ctx.beginPath();
      ctx.arc(PX(t.x), PY(t.y), mini ? 5 : 7, 0, Math.PI * 2);
      ctx.fillStyle = tapColor;
      ctx.fill();
      if (showTapIndex) {
        ctx.font = `bold ${mini ? 8 : 11}px 'Inter', sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), PX(t.x), PY(t.y) + 0.5);
        ctx.textBaseline = "alphabetic";
      }
    });
  }, [spec, height, mini, taps, tapColor, showTapIndex, revealTargets, targets]);

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
    const t = transformRef.current;
    if (!canvas || !t) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // transformasi pixel → kartesius
    const xCart = (px - t.originX) / t.scale;
    const yCart = (t.originY - py) / t.scale;
    const snapped = { x: Math.round(xCart), y: Math.round(yCart) };
    const within =
      xCart >= spec.xRange[0] - 0.01 &&
      xCart <= spec.xRange[1] + 0.01 &&
      yCart >= spec.yRange[0] - 0.01 &&
      yCart <= spec.yRange[1] + 0.01;
    if (!within) return;
    onTap({ x: xCart, y: yCart }, {
      x: Math.max(spec.xRange[0], Math.min(spec.xRange[1], snapped.x)),
      y: Math.max(spec.yRange[0], Math.min(spec.yRange[1], snapped.y)),
    });
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
