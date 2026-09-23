// ─── Audit otomatis seluruh template soal ───────────────────────────────────
// Menguji setiap template berkali-kali untuk memastikan:
//   1. Kunci jawaban ada dan diterima oleh pemeriksa (check)
//   2. Soal pilihan (mc/graph) hanya punya SATU jawaban benar
//   3. Opsi grafik tidak ada yang kembar (agar tidak ambigu)
//   4. Semua titik target berada di dalam jangkauan sumbu grafik
//   5. Pembahasan & petunjuk tidak kosong
//
// Jalankan:  node scripts/audit-soal.mjs

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ITER = Number(process.argv[2] ?? 300);
const out = mkdtempSync(join(tmpdir(), "audit-"));

console.log("Mengompilasi modul soal…");
execSync(
  `npx tsc src/lib/templates.ts src/lib/geometry.ts src/lib/mathfmt.ts ` +
    `--outDir ${out} --module commonjs --target es2022 --skipLibCheck`,
  { stdio: "inherit" }
);
// tsc mempertahankan import relatif tanpa ekstensi → pakai require CommonJS
const { createRequire } = await import("node:module");
const req = createRequire(pathToFileURL(join(out, "x.cjs")).href);
const mod = req(join(out, "templates.js"));
const { ALL_GENERATORS } = mod;

const problems = [];
let checked = 0;

const inRange = (p, spec) =>
  p.x >= spec.xRange[0] - 1e-6 && p.x <= spec.xRange[1] + 1e-6 &&
  p.y >= spec.yRange[0] - 1e-6 && p.y <= spec.yRange[1] + 1e-6;

const specSignature = (s) =>
  JSON.stringify({
    lines: (s.lines ?? []).map((l) => [l.a, l.b, l.c, l.sign, !!l.dashed]),
    dhp: (s.dhpIneqs ?? []).map((l) => [l.a, l.b, l.c, l.sign]),
    shade: s.shadeIndices ?? [],
    pts: (s.points ?? []).map((p) => [p.p.x, p.p.y]),
  });

for (const [subbab, gens] of Object.entries(ALL_GENERATORS)) {
  for (let gi = 0; gi < gens.length; gi++) {
    for (let it = 0; it < ITER; it++) {
      let q;
      try {
        q = gens[gi]();
      } catch (e) {
        problems.push(`[SB${subbab} gen#${gi}] generator melempar error: ${e.message}`);
        break;
      }
      checked++;
      const id = `${q.templateId} (${q.kind})`;
      const key = q.check.key;

      // 1. kunci jawaban harus ada
      if (key === undefined || key === null) {
        problems.push(`[${id}] tidak punya kunci jawaban`);
        continue;
      }
      // 2. kunci harus diterima
      const res = q.check(key);
      if (!res.ok) {
        problems.push(`[${id}] kunci DITOLAK oleh pemeriksa: ${JSON.stringify(key)} — ${res.note ?? ""} | soal: ${q.math ?? q.prompt.slice(0, 60)}`);
        continue;
      }
      // 3. pilihan ganda: tepat satu yang benar
      if (q.kind === "mc") {
        const opts = q.mcOptions ?? [];
        if (opts.length < 2) problems.push(`[${id}] opsi kurang dari 2`);
        const okCount = opts.filter((o) => q.check(o.id).ok).length;
        if (okCount !== 1) problems.push(`[${id}] jumlah opsi benar = ${okCount} (harus 1)`);
        const labels = new Set(opts.map((o) => o.label));
        if (labels.size !== opts.length) problems.push(`[${id}] ada opsi dengan teks kembar: ${opts.map((o) => o.label).join(" | ")}`);
      }
      // 4. pilihan grafik: satu benar + tidak kembar + titik dalam jangkauan
      if (q.kind === "graph") {
        const specs = q.graphOptions ?? [];
        if (specs.length < 2) problems.push(`[${id}] opsi grafik kurang dari 2`);
        const okCount = specs.map((_, i) => q.check(i).ok).filter(Boolean).length;
        if (okCount !== 1) problems.push(`[${id}] jumlah grafik benar = ${okCount} (harus 1)`);
        const sigs = specs.map(specSignature);
        if (new Set(sigs).size !== sigs.length) {
          problems.push(`[${id}] ada dua grafik IDENTIK (ambigu) | soal: ${q.math}`);
        }
        specs.forEach((s, i) => {
          for (const p of s.points ?? []) {
            if (!inRange(p.p, s)) problems.push(`[${id}] titik opsi ${i} di luar jangkauan sumbu`);
          }
        });
      }
      // 5. isian: kunci berupa angka berhingga
      if (q.kind === "fill") {
        for (const f of q.fillFields ?? []) {
          const v = key[f.key];
          if (typeof v !== "number" || !Number.isFinite(v)) {
            problems.push(`[${id}] kunci isian "${f.key}" tidak valid: ${v}`);
          }
        }
        // jawaban asal harus ditolak
        const bogus = {};
        for (const f of q.fillFields ?? []) bogus[f.key] = 99999;
        if (q.check(bogus).ok) problems.push(`[${id}] jawaban asal diterima`);
      }
      // 6. ketuk titik: target harus muat di kanvas
      if (q.kind === "points" || q.kind === "region-tap") {
        const spec = q.canvas;
        if (!spec) problems.push(`[${id}] tidak punya kanvas`);
        else for (const t of key) {
          if (!inRange(t, spec)) {
            problems.push(`[${id}] target (${t.x}, ${t.y}) di luar jangkauan [${spec.xRange}]×[${spec.yRange}]`);
          }
        }
        if (q.kind === "points" && (key.length !== q.needPoints)) {
          problems.push(`[${id}] jumlah target (${key.length}) ≠ needPoints (${q.needPoints})`);
        }
      }
      // 7. petunjuk & pembahasan
      if (!q.hints || q.hints.length !== 3 || q.hints.some((h) => !h || !h.trim())) {
        problems.push(`[${id}] petunjuk H1–H3 tidak lengkap`);
      }

      // 7b. PETUNJUK TIDAK BOLEH MEMBOCORKAN JAWABAN
      const hintText = (q.hints ?? []).join("\n");
      if (/>\s*Jadi\b/i.test(hintText)) {
        problems.push(`[${id}] petunjuk memuat kalimat kesimpulan ("Jadi …")`);
      }
      if (q.kind === "fill") {
        // Kebocoran sejati = baris kesimpulan dengan VARIABEL SENDIRIAN di ruas kiri,
        // mis. "x = 6". Persamaan soal seperti "x − y = 2" bukan kebocoran.
        for (const [k, v] of Object.entries(key)) {
          const val = String(v).replace("-", "[−-]");
          const vn = k === "v" || k === "max" || k === "min" ? "(f|nilai|maksimum|minimum)" : k;
          const leak = new RegExp(`^\\s*${vn}\\s*=\\s*${val}\\s*$`, "im");
          if (leak.test(hintText)) {
            problems.push(`[${id}] petunjuk membocorkan hasil akhir ${k} = ${v}`);
          }
        }
        // bentuk "f(a, b) = nilai" juga termasuk membocorkan
        if (/^\s*f\([^)]*\)\s*=\s*[−-]?\d+\s*$/m.test(hintText)) {
          problems.push(`[${id}] petunjuk memuat hasil evaluasi fungsi tujuan`);
        }
      }
      if (q.kind === "mc") {
        const correctLabel = (q.mcOptions ?? []).find((o) => o.id === key)?.label ?? "";
        if (correctLabel.length >= 6 && hintText.includes(correctLabel)) {
          problems.push(`[${id}] petunjuk menyebut opsi jawaban secara utuh: "${correctLabel}"`);
        }
        if (/\b(jawabannya adalah|yaitu opsi|pilih opsi)\b/i.test(hintText)) {
          problems.push(`[${id}] petunjuk menunjuk langsung opsi jawaban`);
        }
      }
      if (q.kind === "points" || q.kind === "region-tap") {
        for (const t of key) {
          const pat = new RegExp(`\\(\\s*${String(t.x).replace("-", "[−-]")}\\s*,\\s*${String(t.y).replace("-", "[−-]")}\\s*\\)`);
          if (pat.test(hintText)) {
            problems.push(`[${id}] petunjuk menyebut koordinat target (${t.x}, ${t.y})`);
          }
        }
      }
      if (!q.explain || !q.explain.trim()) problems.push(`[${id}] pembahasan kosong`);
      if (q.prompt.includes("undefined") || (q.math ?? "").includes("undefined") || (q.explain ?? "").includes("undefined")) {
        problems.push(`[${id}] memuat teks "undefined"`);
      }
      if (/\b1x\b|\b1y\b/.test(`${q.math ?? ""} ${q.explain}`)) {
        problems.push(`[${id}] penulisan "1x"/"1y" masih muncul: ${q.math}`);
      }
    }
  }
}

rmSync(out, { recursive: true, force: true });

const unique = [...new Set(problems)];
console.log(`\nSoal diperiksa : ${checked}`);
console.log(`Masalah unik   : ${unique.length}`);
if (unique.length) {
  console.log("\n── DAFTAR MASALAH ──");
  unique.slice(0, 40).forEach((p) => console.log("  ✗", p));
  process.exit(1);
}
console.log("\n✓ Semua template lolos audit: setiap soal punya tepat satu jawaban yang valid.");
