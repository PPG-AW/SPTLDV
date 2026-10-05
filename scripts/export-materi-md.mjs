// ─── Ekspor seluruh materi + contoh soal ke MATERI.md ───────────────────────
// Dokumen dihasilkan langsung dari kode agar selalu sinkron.
// Jalankan:  node scripts/export-materi-md.mjs

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const out = mkdtempSync(join(tmpdir(), "md-export-"));
console.log("Mengompilasi modul materi & soal…");
execSync(
  `npx tsc src/lib/templates.ts src/lib/geometry.ts src/lib/mathfmt.ts src/lib/curriculum.ts ` +
    `--outDir ${out} --module commonjs --target es2022 --skipLibCheck`,
  { stdio: "inherit" }
);

const req = createRequire(pathToFileURL(join(out, "x.cjs")).href);
const { SUBBABS, getSubbab } = req(join(out, "curriculum.js"));
const { generateByTemplate, templateIdsFor } = req(join(out, "templates.js"));
const { eqStr } = req(join(out, "mathfmt.js"));
rmSync(out, { recursive: true, force: true });

// ── util ─────────────────────────────────────────────────────────────────────
const SYM = { "<=": "≤", ">=": "≥", "<": "<", ">": ">" };
const KIND = {
  mc: "Pilihan Ganda",
  fill: "Isian Singkat",
  points: "Ketuk Titik pada Grafik",
  graph: "Pilih Grafik yang Benar",
  "region-tap": "Ketuk Titik di Dalam DHP",
};

const fmt = (s) =>
  String(s ?? "")
    .replace(/frac\(([^,()]+),([^()]+)\)/g, "$1/$2")
    .trim();

const fence = (s) => (s ? "```\n" + fmt(s) + "\n```" : "");

const fn = (n) => String(n).replace(/-/g, "−");

function canvasDesc(spec) {
  if (!spec) return "";
  const parts = [];
  parts.push(`Bidang koordinat x ∈ [${fn(spec.xRange[0])}, ${fn(spec.xRange[1])}], y ∈ [${fn(spec.yRange[0])}, ${fn(spec.yRange[1])}].`);
  const lines = spec.lines ?? [];
  if (lines.length) {
    parts.push(
      "Garis yang digambar: " +
        lines
          .map((l) => {
            const rel = l.sign ? SYM[l.sign] : "=";
            const dash = l.dashed ? "putus-putus" : "penuh";
            return `${eqStr(l.a, l.b, l.c, rel)} (garis ${dash})`;
          })
          .join(";  ") +
        "."
    );
  }
  if (spec.dhpIneqs?.length) {
    parts.push(
      "DHP (daerah yang diarsir berwarna) dibatasi oleh: " +
        spec.dhpIneqs.map((l) => eqStr(l.a, l.b, l.c, SYM[l.sign])).join(";  ") +
        "."
    );
  }
  if (spec.shadeIndices?.length) {
    parts.push("Daerah penyelesaian ditandai dengan arsiran berwarna.");
  }
  if (spec.points?.length) {
    parts.push(
      "Titik penanda: " +
        spec.points.map((p) => `(${fn(p.p.x)}, ${fn(p.p.y)})${p.label ? ` (${p.label})` : ""}`).join(", ") +
        "."
    );
  }
  if (spec.crosshair) {
    parts.push(`Titik uji bertanda silang di (${fn(spec.crosshair.x)}, ${fn(spec.crosshair.y)}).`);
  }
  return parts.join(" ");
}

function hintBlock(label, h) {
  const t = fmt(h);
  if (t.includes("\n")) return `**${label}**\n\n${fence(t)}`;
  return `**${label}** ${t}`;
}

// ── render satu template soal ────────────────────────────────────────────────
function renderQuestion(tid) {
  const q = generateByTemplate(tid);
  if (!q) return "";
  const L = [];
  L.push(`#### Template ${q.templateId} — ${KIND[q.kind] ?? q.kind}`);
  L.push("");
  L.push(`> Contoh di bawah adalah **hasil acak**. Angka soal berubah setiap kali siswa mengerjakan, tetapi struktur, langkah petunjuk, dan jenis pembahasannya selalu sama.`);
  L.push("");
  L.push(`**Soal:** ${fmt(q.prompt)}`);
  L.push("");
  if (q.math) {
    L.push("```");
    L.push(fmt(q.math));
    L.push("```");
    L.push("");
  }

  if (q.kind === "mc") {
    const opts = q.mcOptions ?? [];
    L.push("Pilihan jawaban:");
    L.push("");
    opts.forEach((o, i) => {
      const mark = o.id === q.answerKey ? " ✅ (kunci)" : "";
      L.push(`${String.fromCharCode(65 + i)}. ${fmt(o.label)}${mark}`);
    });
    L.push("");
  }

  if (q.kind === "graph") {
    const specs = q.graphOptions ?? [];
    L.push(`Empat grafik (A–D) ditampilkan sebagai pilihan. Deskripsi tiap grafik:`);
    L.push("");
    specs.forEach((s, i) => {
      const mark = i === q.answerKey ? " ✅ (kunci)" : "";
      L.push(`**${String.fromCharCode(65 + i)}**${mark} — ${canvasDesc(s)}`);
      L.push("");
    });
  }

  if (q.kind === "fill") {
    L.push("Kolom isian: " + (q.fillFields ?? []).map((f) => `**${f.label}**`).join(", "));
    L.push("");
    const keys = Object.entries(q.answerKey ?? {})
      .map(([k, v]) => `${k} = ${fn(v)}`)
      .join(", ");
    L.push(`**Kunci:** ${keys}`);
    L.push("");
  }

  if (q.kind === "points") {
    L.push(`Siswa mengetuk ${q.needPoints} titik pada grafik (toleransi ±0,55 satuan). ${canvasDesc(q.canvas)}`);
    L.push("");
    const targets = (q.answerKey ?? []).map((t) => `(${fn(t.x)}, ${fn(t.y)})`).join(", ");
    L.push(`**Kunci (titik yang harus diketuk):** ${targets}`);
    L.push("");
  }

  if (q.kind === "region-tap") {
    L.push(
      `Siswa mengetuk satu titik berkoordinat bulat yang harus berada di dalam DHP. ${canvasDesc(q.canvas)}`
    );
    L.push("");
    const sample = (q.answerKey ?? [])[0];
    if (sample) L.push(`**Contoh titik yang benar:** (${fn(sample.x)}, ${fn(sample.y)}) — semua titik di dalam DHP diterima.`);
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("**Petunjuk bertahap (H1 → H3) — tidak pernah membocorkan jawaban akhir:**");
  L.push("");
  q.hints.forEach((h, i) => L.push(hintBlock(`H${i + 1}.`, h)));
  L.push("");
  L.push("**Pembahasan lengkap (ditampilkan setelah siswa menjawab):**");
  L.push("");
  if (q.explainSteps) L.push(fence(q.explainSteps));
  L.push(`**Kesimpulan:** ${fmt(q.explain)}`);
  L.push("");
  return L.join("\n");
}

// ── susun dokumen ────────────────────────────────────────────────────────────
const MD = [];
MD.push("# Materi & Latihan Soal — Sistem Pertidaksamaan Linear Dua Variabel");
MD.push("");
MD.push("> Platform **SPtLDV.belajar** · Matematika Fase E (Kelas X)");
MD.push(">");
MD.push("> Dokumen ini berisi **seluruh materi** dan **30 template latihan soal** yang dipakai platform.");
MD.push("> Soal latihan di-generate secara acak — contoh di sini adalah satu hasil generate untuk diperiksa.");
MD.push("> Untuk memperbarui dokumen ini setelah mengubah kode, jalankan: `node scripts/export-materi-md.mjs`");
MD.push("");
MD.push("---");
MD.push("");

// ringkasan tabel
MD.push("## Ringkasan 10 Sub-Bab");
MD.push("");
MD.push("| # | Judul | Rujukan Level | Fokus Materi | Simulasi |");
MD.push("|---|-------|---------------|--------------|----------|");
SUBBABS.forEach((sb) => {
  MD.push(`| ${sb.id} | ${sb.title} | ${sb.levelRef} | ${sb.focus} | ${sb.simulation ? "Ada" : "—"} |`);
});
MD.push("");
MD.push("## Ringkasan 30 Template Latihan");
MD.push("");
MD.push("| Template | Jenis Soal | Inti Soal |");
MD.push("|----------|------------|-----------|");
for (const sb of SUBBABS) {
  for (const tid of templateIdsFor(sb.id)) {
    const q = generateByTemplate(tid);
    if (!q) continue;
    const core = fmt(q.prompt).replace(/\|/g, "/").slice(0, 90);
    MD.push(`| ${tid} | ${KIND[q.kind]} | ${core}… |`);
  }
}
MD.push("");
MD.push("---");
MD.push("");

// detail per sub-bab
for (const sb of SUBBABS) {
  MD.push(`## Sub-Bab ${sb.id} — ${sb.title}`);
  MD.push("");
  MD.push(`**Rujukan level:** ${sb.levelRef} · **Fokus:** ${sb.focus}`);
  MD.push("");
  MD.push("### Materi");
  MD.push("");
  sb.materi.forEach((m, i) => {
    MD.push(`#### Bagian ${i + 1} — ${m.title}`);
    MD.push("");
    MD.push(fmt(m.body));
    MD.push("");
    if (m.list) {
      m.list.forEach((item, j) => MD.push(`${j + 1}. ${fmt(item)}`));
      MD.push("");
    }
    if (m.table) {
      MD.push("| " + m.table.header.join(" | ") + " |");
      MD.push("|" + m.table.header.map(() => "---").join("|") + "|");
      m.table.rows.forEach((row) => MD.push("| " + row.map((c) => fmt(c)).join(" | ") + " |"));
      MD.push("");
    }
    if (m.steps) {
      MD.push(fence(m.steps));
      MD.push("");
    }
    if (m.math) {
      MD.push("```");
      m.math.forEach((line) => MD.push(fmt(line)));
      MD.push("```");
      MD.push("");
    }
    if (m.tip) {
      MD.push(`> **Tips:** ${fmt(m.tip)}`);
      MD.push("");
    }
  });

  MD.push("### Video Pembelajaran");
  MD.push("");
  if (sb.videoNote) {
    MD.push(`> ${sb.videoNote}`);
    MD.push("");
  }
  const vidId = sb.videoId ?? getSubbab(7).videoId;
  MD.push(`- **YouTube:** https://youtu.be/${vidId}`);
  MD.push(`- **Embed:** https://www.youtube-nocookie.com/embed/${vidId}`);
  MD.push("");
  MD.push("### Contoh Soal & Pembahasan Bertahap");
  MD.push("");
  MD.push(`**Soal:** ${fmt(sb.contoh.soal)}`);
  MD.push("");
  if (sb.contoh.math) {
    MD.push("```");
    MD.push(fmt(sb.contoh.math.join("   ;   ")));
    MD.push("```");
    MD.push("");
  }
  sb.contoh.stages.forEach((s, i) => {
    MD.push(`**Langkah ${i + 1} — ${s.label}**`);
    MD.push("");
    MD.push(fmt(s.explain));
    MD.push("");
    if (s.steps) {
      MD.push(fence(s.steps));
      MD.push("");
    }
  });
  MD.push(`> ✅ **Jawaban akhir:** ${fmt(sb.contoh.jawaban)}`);
  MD.push("");

  MD.push("### Simulasi Interaktif");
  MD.push("");
  MD.push(
    sb.simulation
      ? `Tersedia simulasi **${sb.simulation}** yang dapat diacak ulang oleh siswa.`
      : "Sub-bab ini tidak memiliki simulasi khusus."
  );
  MD.push("");

  MD.push("### Latihan Formatif (mastery: 3 benar beruntun)");
  MD.push("");
  MD.push(
    "Aturan: jawaban salah mengganti soal baru dan menghitung ulang dari nol; dua kali salah berturut-turut memunculkan tombol **Minta Bantuan Tutor Sebaya**; tiga kali salah berturut-turut mengubah status siswa menjadi **MACET**."
  );
  MD.push("");
  for (const tid of templateIdsFor(sb.id)) {
    MD.push(renderQuestion(tid));
  }
  MD.push("---");
  MD.push("");
}

writeFileSync("MATERI.md", MD.join("\n"), "utf8");
console.log(`✓ MATERI.md berhasil dibuat (${MD.join("\n").split("\n").length} baris).`);
