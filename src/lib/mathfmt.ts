// ─── Format penulisan matematika (tanda minus tipografis, pecahan bertingkat,
//     langkah pengerjaan bertahap dengan tanda "=" sejajar) ───────────────────
//
// Sintaks teks langkah:
//   • Baris diawali ">"  → kalimat penjelas (bukan persamaan)
//   • frac(a,b)          → ditampilkan sebagai pecahan atas–bawah
//   • Baris lain dipecah pada tanda "=" pertama agar "=" sejajar antar-baris

export const MINUS = "−";

export function neg(n: number): string {
  return n < 0 ? `${MINUS}${Math.abs(n)}` : String(n);
}

export function num(n: number): string {
  if (Number.isInteger(n)) return neg(n);
  const r = Math.round(n * 1000) / 1000;
  return (r < 0 ? MINUS : "") + String(Math.abs(r)).replace(".", ",");
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Token pecahan; otomatis menjadi bilangan bulat bila habis dibagi. */
export function frac(n: number, d: number): string {
  if (d === 0) return "∞";
  if (n % d === 0) return neg(n / d);
  // rapikan tanda: negatif selalu di pembilang
  let N = n, D = d;
  if (D < 0) { N = -N; D = -D; }
  const g = gcd(N, D);
  return `frac(${neg(N / g)},${D / g})`;
}

/** Suku tunggal: 1x → x, −1y → −y, 0 → "" */
export function term(coef: number, sym: string, first: boolean): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const mag = abs === 1 && sym ? "" : String(abs);
  if (first) return `${coef < 0 ? MINUS : ""}${mag}${sym}`;
  return `${coef < 0 ? ` ${MINUS} ` : " + "}${mag}${sym}`;
}

/** "2x + 3y", "−7x + 2y", "x − y" */
export function linExpr(a: number, b: number): string {
  const first = term(a, "x", true);
  const second = term(b, "y", first === "");
  const s = `${first}${second}`;
  return s === "" ? "0" : s;
}

/** "2x + 3y = 12" atau dengan relasi lain */
export function eqStr(a: number, b: number, c: number, rel = "="): string {
  return `${linExpr(a, b)} ${rel} ${neg(c)}`;
}

/** Substitusi nilai ke satu variabel: 3y → 3(0) */
function subst(coef: number, value: number, first: boolean): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  // koefisien 1 dan nilai tak-negatif cukup ditulis apa adanya: "+ 4", bukan "+ (4)"
  const body = abs === 1
    ? (value < 0 ? `(${neg(value)})` : String(value))
    : `${abs}(${neg(value)})`;
  if (first) return `${coef < 0 ? MINUS : ""}${body}`;
  return `${coef < 0 ? ` ${MINUS} ` : " + "}${body}`;
}

/** Langkah lengkap mencari titik potong sumbu X (y = 0). */
export function stepsInterceptX(a: number, b: number, c: number): string {
  const L: string[] = [];
  L.push(eqStr(a, b, c));
  L.push("> Titik potong sumbu X dicari saat y = 0, maka:");
  L.push(`${term(a, "x", true)}${subst(b, 0, false)} = ${neg(c)}`);
  L.push(`${term(a, "x", true)} = ${neg(c)}`);
  L.push(`x = ${frac(c, a)}`);
  if (c % a !== 0) L.push(`x = ${num(c / a)}`);
  L.push(`> Jadi titik potong sumbu X adalah (${num(c / a)}, 0).`);
  return L.join("\n");
}

/** Langkah lengkap mencari titik potong sumbu Y (x = 0). */
export function stepsInterceptY(a: number, b: number, c: number): string {
  const L: string[] = [];
  L.push(eqStr(a, b, c));
  L.push("> Titik potong sumbu Y dicari saat x = 0, maka:");
  L.push(`${subst(a, 0, true)}${term(b, "y", false)} = ${neg(c)}`);
  L.push(`${term(b, "y", true)} = ${neg(c)}`);
  L.push(`y = ${frac(c, b)}`);
  if (c % b !== 0) L.push(`y = ${num(c / b)}`);
  L.push(`> Jadi titik potong sumbu Y adalah (0, ${num(c / b)}).`);
  return L.join("\n");
}

export interface Lin { a: number; b: number; c: number }

/**
 * METODE CAMPURAN: eliminasi lebih dahulu, lalu substitusi.
 * Mengembalikan teks langkah lengkap + titik potongnya.
 */
export function stepsMixedMethod(
  l1: Lin,
  l2: Lin,
  opts: { eliminate?: "x" | "y" } = {}
): { text: string; x: number; y: number } {
  const L: string[] = [];
  const which = opts.eliminate ?? "x";
  const k1 = which === "x" ? l1.a : l1.b;
  const k2 = which === "x" ? l2.a : l2.b;
  const g = gcd(k1, k2);
  const m1 = Math.abs(k2 / g);
  const m2 = Math.abs(k1 / g);

  L.push("> Persamaan garis pembatas:");
  L.push(`${eqStr(l1.a, l1.b, l1.c)}   …(1)`);
  L.push(`${eqStr(l2.a, l2.b, l2.c)}   …(2)`);
  L.push(`> LANGKAH 1 — ELIMINASI ${which}:`);

  const s1 = { a: l1.a * m1, b: l1.b * m1, c: l1.c * m1 };
  const s2 = { a: l2.a * m2, b: l2.b * m2, c: l2.c * m2 };
  if (m1 !== 1 && m2 !== 1) {
    L.push(`> Samakan koefisien ${which}: kalikan persamaan (1) dengan ${m1} dan persamaan (2) dengan ${m2}.`);
  } else if (m1 !== 1) {
    L.push(`> Samakan koefisien ${which}: kalikan persamaan (1) dengan ${m1}.`);
  } else if (m2 !== 1) {
    L.push(`> Samakan koefisien ${which}: kalikan persamaan (2) dengan ${m2}.`);
  } else {
    L.push(`> Koefisien ${which} pada kedua persamaan sudah sama, jadi dapat langsung dieliminasi.`);
  }
  L.push(eqStr(s1.a, s1.b, s1.c));
  L.push(eqStr(s2.a, s2.b, s2.c));

  const kk1 = which === "x" ? s1.a : s1.b;
  const kk2 = which === "x" ? s2.a : s2.b;
  const sameSign = Math.sign(kk1) === Math.sign(kk2);
  L.push(
    sameSign
      ? `> Koefisien ${which} bertanda sama → KURANGKAN persamaan (1) − (2):`
      : `> Koefisien ${which} berlawanan tanda → JUMLAHKAN persamaan (1) + (2):`
  );
  const A = sameSign ? s1.a - s2.a : s1.a + s2.a;
  const B = sameSign ? s1.b - s2.b : s1.b + s2.b;
  const C = sameSign ? s1.c - s2.c : s1.c + s2.c;
  const other = which === "x" ? "y" : "x";
  const koefOther = which === "x" ? B : A;
  L.push(`${term(koefOther, other, true)} = ${neg(C)}`);
  const otherVal = C / koefOther;
  if (Math.abs(koefOther) !== 1) {
    L.push(`${other} = ${frac(C, koefOther)}`);
    if (C % koefOther !== 0) L.push(`${other} = ${num(otherVal)}`);
  } else {
    L.push(`${other} = ${num(otherVal)}`);
  }

  L.push(`> LANGKAH 2 — SUBSTITUSI ${other} = ${num(otherVal)} ke persamaan (1):`);
  let x = 0, y = 0;
  if (which === "x") {
    y = otherVal;
    // l1.a x + l1.b y = l1.c
    L.push(`${term(l1.a, "x", true)}${subst(l1.b, y, false)} = ${neg(l1.c)}`);
    const rhs = l1.c - l1.b * y;
    if (l1.b !== 0) L.push(`${term(l1.a, "x", true)} = ${neg(l1.c)} ${l1.b * y < 0 ? "+" : MINUS} ${Math.abs(l1.b * y)}`);
    L.push(`${term(l1.a, "x", true)} = ${neg(rhs)}`);
    x = rhs / l1.a;
    if (Math.abs(l1.a) !== 1) {
      L.push(`x = ${frac(rhs, l1.a)}`);
      if (rhs % l1.a !== 0) L.push(`x = ${num(x)}`);
    } else if (l1.a === -1) {
      L.push(`x = ${num(x)}`);
    }
  } else {
    x = otherVal;
    L.push(`${subst(l1.a, x, true)}${term(l1.b, "y", false)} = ${neg(l1.c)}`);
    const rhs = l1.c - l1.a * x;
    if (l1.a !== 0) L.push(`${term(l1.b, "y", true)} = ${neg(l1.c)} ${l1.a * x < 0 ? "+" : MINUS} ${Math.abs(l1.a * x)}`);
    L.push(`${term(l1.b, "y", true)} = ${neg(rhs)}`);
    y = rhs / l1.b;
    if (Math.abs(l1.b) !== 1) {
      L.push(`y = ${frac(rhs, l1.b)}`);
      if (rhs % l1.b !== 0) L.push(`y = ${num(y)}`);
    } else if (l1.b === -1) {
      L.push(`y = ${num(y)}`);
    }
  }
  L.push(`> Jadi titik potong kedua garis adalah (${num(x)}, ${num(y)}).`);
  return { text: L.join("\n"), x, y };
}

/** Langkah uji titik ke sebuah pertidaksamaan. */
export function stepsTestPoint(
  a: number, b: number, c: number, rel: string, px: number, py: number
): { text: string; ok: boolean; lhs: number } {
  const lhs = a * px + b * py;
  const ok =
    rel === "≤" ? lhs <= c : rel === "≥" ? lhs >= c : rel === "<" ? lhs < c : lhs > c;
  const L: string[] = [];
  L.push(`${linExpr(a, b)} ${rel} ${neg(c)}`);
  L.push(`> Substitusikan titik (${num(px)}, ${num(py)}):`);
  L.push(`${subst(a, px, true)}${subst(b, py, false)} ${rel} ${neg(c)}`);
  L.push(`${neg(a * px)} ${b * py < 0 ? MINUS : "+"} ${Math.abs(b * py)} ${rel} ${neg(c)}`);
  L.push(`${neg(lhs)} ${rel} ${neg(c)}   → ${ok ? "BENAR" : "SALAH"}`);
  return { text: L.join("\n"), ok, lhs };
}
