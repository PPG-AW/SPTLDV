// ─── Geometri Kartesius murni (dipakai client & server) ──────────────────────

export interface Pt {
  x: number;
  y: number;
}

export type Sign = "<=" | ">=" | "<" | ">";

export interface LineSpec {
  a: number; // ax + by = c
  b: number;
  c: number;
  dashed?: boolean;
  color?: string;
}

export interface IneqSpec extends LineSpec {
  sign: Sign;
}

export const SIGN_SYMBOL: Record<Sign, string> = {
  "<=": "≤",
  ">=": "≥",
  "<": "<",
  ">": ">",
};

/** nilai ruas kiri dikurangi kanan: a·x + b·y − c */
export function lineValue(l: LineSpec, p: Pt): number {
  return l.a * p.x + l.b * p.y - l.c;
}

export function satisfies(p: Pt, ineq: IneqSpec, eps = 1e-7): boolean {
  const v = lineValue(ineq, p);
  if (ineq.sign === "<=" || ineq.sign === "<") return v <= eps;
  return v >= -eps;
}

/** sisi mana yang "benar": nilai +1 jika sisi ≤, -1 jika sisi ≥ (untuk clipping) */
function keepSign(sign: Sign): number {
  return sign === "<=" || sign === "<" ? 1 : -1;
}

/**
 * Potong poligon dengan setengah bidang dari sebuah pertidaksamaan.
 * Implementasi Sutherland–Hodgman terhadap satu pembatas.
 */
export function clipHalfPlane(poly: Pt[], ineq: IneqSpec): Pt[] {
  if (poly.length === 0) return poly;
  const k = keepSign(ineq.sign);
  const val = (p: Pt) => k * lineValue(ineq, p);
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = val(cur) >= -1e-9;
    const prevIn = val(prev) >= -1e-9;
    if (curIn !== prevIn) {
      const v1 = val(prev);
      const v2 = val(cur);
      const t = v1 / (v1 - v2);
      out.push({ x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) });
    }
    if (curIn) out.push(cur);
  }
  return out;
}

/** Poligon daerah penyelesaian (DHP) dalam jendela pandang. */
export function feasiblePolygon(
  ineqs: IneqSpec[],
  xRange: [number, number],
  yRange: [number, number]
): Pt[] {
  let poly: Pt[] = [
    { x: xRange[0], y: yRange[0] },
    { x: xRange[1], y: yRange[0] },
    { x: xRange[1], y: yRange[1] },
    { x: xRange[0], y: yRange[1] },
  ];
  for (const ineq of ineqs) {
    poly = clipHalfPlane(poly, ineq);
    if (poly.length === 0) break;
  }
  return poly;
}

/** Ruas garis tak hingga yang terpotong oleh jendela pandang (untuk digambar). */
export function lineRectSegment(
  l: LineSpec,
  xRange: [number, number],
  yRange: [number, number]
): [Pt, Pt] | null {
  const pts: Pt[] = [];
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const push = (x: number, y: number) => {
    if (
      x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9 &&
      !pts.some((p) => Math.abs(p.x - x) < 1e-9 && Math.abs(p.y - y) < 1e-9)
    ) {
      pts.push({ x, y });
    }
  };
  if (Math.abs(l.b) > 1e-12) {
    push(x0, (l.c - l.a * x0) / l.b);
    push(x1, (l.c - l.a * x1) / l.b);
  }
  if (Math.abs(l.a) > 1e-12) {
    push((l.c - l.b * y0) / l.a, y0);
    push((l.c - l.b * y1) / l.a, y1);
  }
  if (pts.length < 2) return null;
  return [pts[0], pts[1]];
}

/** Titik potong dua garis; null jika sejajar. */
export function intersectLines(l1: LineSpec, l2: LineSpec): Pt | null {
  const d = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(d) < 1e-12) return null;
  return {
    x: (l1.c * l2.b - l2.c * l1.b) / d,
    y: (l1.a * l2.c - l2.a * l1.c) / d,
  };
}

/**
 * Titik-titik pojok DHP: semua titik potong pasangan garis pembatas
 * yang layak terhadap seluruh kendala (unik).
 */
export function cornerPoints(ineqs: IneqSpec[]): Pt[] {
  const corners: Pt[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < ineqs.length; i++) {
    for (let j = i + 1; j < ineqs.length; j++) {
      const p = intersectLines(ineqs[i], ineqs[j]);
      if (!p) continue;
      if (!ineqs.every((q) => satisfies(p, q, 1e-7))) continue;
      const rx = Math.round(p.x * 1000) / 1000;
      const ry = Math.round(p.y * 1000) / 1000;
      const key = `${rx},${ry}`;
      if (seen.has(key)) continue;
      seen.add(key);
      corners.push({ x: rx, y: ry });
    }
  }
  return corners;
}

/** Bangun garis dari dua titik (mengembalikan koefisien integer jika memungkinkan). */
export function lineFromPoints(p1: Pt, p2: Pt): LineSpec | null {
  const a = p2.y - p1.y;
  const b = p1.x - p2.x;
  const c = a * p1.x + b * p1.y;
  if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) return null;
  return { a, b, c };
}

/** Garis dari titik potong sumbu: (p, 0) dan (0, q) → qx + py = pq */
export function lineFromIntercepts(p: number, q: number): LineSpec {
  return { a: q, b: p, c: p * q };
}

/** Titik potong garis dengan sumbu x dan y (null jika sejajar sumbu tsb). */
export function axisIntercepts(l: LineSpec): { x: Pt | null; y: Pt | null } {
  return {
    x: Math.abs(l.a) > 1e-12 ? { x: l.c / l.a, y: 0 } : null,
    y: Math.abs(l.b) > 1e-12 ? { x: 0, y: l.c / l.b } : null,
  };
}

/** Ringkasan garis dalam bentuk teks Indonesia, mis. "2x + 3y = 12". */
export function lineToString(l: LineSpec, sign = "="): string {
  const parts: string[] = [];
  const pushTerm = (coef: number, sym: string) => {
    if (coef === 0) return;
    const abs = Math.abs(coef);
    const mag = abs === 1 && sym !== "" ? "" : String(abs);
    if (parts.length === 0) {
      parts.push(`${coef < 0 ? "−" : ""}${mag}${sym}`);
    } else {
      parts.push(`${coef < 0 ? "−" : "+"} ${mag}${sym}`);
    }
  };
  pushTerm(l.a, "x");
  pushTerm(l.b, "y");
  if (parts.length === 0) parts.push("0");
  return `${parts.join(" ")} ${sign} ${l.c}`;
}

export function ineqToString(ineq: IneqSpec): string {
  return lineToString(ineq, SIGN_SYMBOL[ineq.sign]);
}

export function fmtNum(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return String(r).replace(".", ",");
}
