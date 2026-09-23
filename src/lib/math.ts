// Math utilities for LINIERKu

// Seeded random number generator (mulberry32)
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash string to number (for seed generation)
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Integer range [min, max] inclusive
export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Pick from array
export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Shuffle array (Fisher-Yates)
export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// GCD
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Sign symbol for display
export function signSymbol(a: number): string {
  return a >= 0 ? '+' : '−';
}

// Format coefficient for display (e.g. "2x", "-3y", "x")
export function formatCoeff(c: number, variable: string, first = false): string {
  if (c === 0) return '';
  const abs = Math.abs(c);
  const sign = c > 0 ? (first ? '' : ' + ') : (first ? '−' : ' − ');
  const coeff = abs === 1 ? '' : `${abs}`;
  return `${sign}${coeff}${variable}`;
}

// Format inequality sign
export function ineqSign(sign: '<' | '>' | '<=' | '>='): string {
  const map: Record<string, string> = { '<': '<', '>': '>', '<=': '≤', '>=': '≥' };
  return map[sign] || sign;
}

// Build equation string: ax + by = c
export function buildEquation(a: number, b: number, c: number): string {
  return `${formatCoeff(a, 'x', true)}${formatCoeff(b, 'y', false)} = ${c}`;
}

// Build inequality string: ax + by ≤ c
export function buildInequality(a: number, b: number, c: number, sign: '<' | '>' | '<=' | '>='): string {
  return `${formatCoeff(a, 'x', true)}${formatCoeff(b, 'y', false)} ${ineqSign(sign)} ${c}`;
}

// Check if two lines are parallel (a1*b2 == a2*b1)
export function areParallel(a1: number, b1: number, a2: number, b2: number): boolean {
  return a1 * b2 === a2 * b1;
}

// Find intersection of two lines: a1x + b1y = c1 and a2x + b2y = c2
export function lineIntersection(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): { x: number; y: number } | null {
  const det = a1 * b2 - a2 * b1;
  if (det === 0) return null; // parallel
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  return { x, y };
}

// Check if point is integer
export function isInteger(n: number): boolean {
  return Number.isInteger(n);
}

// Test if point satisfies inequality
export function testPoint(x: number, y: number, a: number, b: number, c: number, sign: '<' | '>' | '<=' | '>='): boolean {
  const val = a * x + b * y;
  switch (sign) {
    case '<': return val < c;
    case '>': return val > c;
    case '<=': return val <= c;
    case '>=': return val >= c;
  }
}

// Compute all corner points of a feasible region defined by a set of inequalities
export function computeCornerPoints(
  constraints: { a: number; b: number; c: number; sign: '<=' | '>=' }[]
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const n = constraints.length;

  // Check intersections of every pair of lines
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const li = constraints[i];
      const lj = constraints[j];
      const inter = lineIntersection(li.a, li.b, li.c, lj.a, lj.b, lj.c);
      if (inter && isInteger(inter.x) && isInteger(inter.y)) {
        // Check if this point satisfies all constraints
        let valid = true;
        for (const c of constraints) {
          if (!testPoint(inter.x, inter.y, c.a, c.b, c.c, c.sign)) {
            valid = false;
            break;
          }
        }
        if (valid) {
          // Avoid duplicates
          if (!points.some(p => p.x === inter.x && p.y === inter.y)) {
            points.push(inter);
          }
        }
      }
    }
  }

  return points;
}

// Format a point for display
export function formatPoint(x: number, y: number): string {
  return `(${x}, ${y})`;
}
