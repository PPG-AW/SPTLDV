// ─── Seed demo: 1 guru, 1 rombel, 12 siswa dengan progres bervariasi ────────
// Jalankan:  node scripts/seed.mjs
// Idempoten — berhenti jika tabel teachers sudah berisi.

import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
const pool = new pg.Pool({ connectionString: url });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

const arr = (a) => JSON.stringify(a);

async function main() {
  const { rows } = await pool.query("select count(*)::int as n from teachers");
  if (rows[0].n > 0) {
    console.log("Seed dilewati: data guru sudah ada.");
    await pool.end();
    return;
  }

  const teacher = await pool.query(
    "insert into teachers (name, password_hash) values ($1,$2) returning id",
    ["Pak Budi Santoso", hashPassword("guru123")]
  );
  const teacherId = teacher.rows[0].id;

  const cls = await pool.query(
    "insert into classes (teacher_id, class_code, class_name, is_locked) values ($1,$2,$3,false) returning id",
    [teacherId, "MTK-XA-2024", "Matematika X-A"]
  );
  const classId = cls.rows[0].id;

  const roster = [
    // [nama, currentSubbab, completed[], streak, errors, status]
    ["Dewi Lestari", 10, [1,2,3,4,5,6,7,8,9,10], 0, 0, "AKTIF"],
    ["Citra Ayu", 10, [1,2,3,4,5,6,7,8,9], 2, 0, "AKTIF"],
    ["Andi Pratama", 9, [1,2,3,4,5,6,7,8], 1, 0, "AKTIF"],
    ["Kirana Putri", 7, [1,2,3,4,5,6], 0, 1, "AKTIF"],
    ["Eko Nugroho", 6, [1,2,3,4,5], 2, 0, "AKTIF"],
    ["Fajar Ramadhan", 6, [1,2,3,4,5], 0, 0, "AKTIF"],
    ["Gita Savitri", 5, [1,2,3,4], 1, 0, "AKTIF"],
    ["Hani Maheswari", 4, [1,2,3], 0, 3, "MACET"],
    ["Ilham Firdaus", 3, [1,2], 0, 1, "AKTIF"],
    ["Joko Widarto", 3, [1,2], 1, 0, "AKTIF"],
    ["Laras Sinta", 2, [1], 0, 2, "AKTIF"],
    ["Made Wirawan", 1, [], 0, 0, "AKTIF"],
  ];

  const ids = {};
  for (const [name, cur, done, streak, errors, status] of roster) {
    const r = await pool.query(
      `insert into students (name, password_hash, class_id, current_subbab, completed_subbabs, streak_correct, consecutive_errors, status, last_active_at)
       values ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9) returning id`,
      [name, hashPassword("siswa123"), classId, cur, arr(done), streak, errors, status,
       new Date(Date.now() - Math.floor(Math.random() * 30000))]
    );
    ids[name] = r.rows[0].id;
  }

  // Log aktivitas (untuk analitik miskonsepsi)
  const ERRORS = {
    2: ["Tertukar! Sumbu X berbentuk (p, 0) dan sumbu Y berbentuk (0, q).", "Nilai \"titik potong Y\" belum tepat."],
    3: ["Jenis garis salah: tanda ≤/≥ memakai garis penuh.", "Arsiran berada di sisi garis yang salah. Uji titik (0, 0)!", "Lupa membagi saat isolasi variabel."],
    4: ["Sisi arsiran terbalik. Uji titik (0, 0) untuk menentukan sisi yang benar.", "Salah substitusi titik uji."],
    7: ["Menghitung perpotongan garis di LUAR DHP sebagai titik pojok.", "Melewatkan titik pojok di sumbu."],
    8: ["Salah menjumlahkan saat eliminasi (tanda minus).", "Tertukar antara nilai x dan y."],
  };
  const templates = ["1.1","2.1","2.3","3.1","3.2","4.2","4.3","7.2","8.1"];
  const logRows = [];
  const names = Object.keys(ids);
  for (const name of names) {
    const sid = ids[name];
    const my = roster.find((r) => r[0] === name);
    const maxSub = Math.min(my[1], 8);
    for (let i = 0; i < 9; i++) {
      const sub = 1 + Math.floor(Math.random() * maxSub);
      const isCorrect = Math.random() < 0.62;
      const bank = ERRORS[sub];
      const detail = isCorrect ? null : bank ? bank[Math.floor(Math.random() * bank.length)] : "Jawaban belum tepat.";
      logRows.push([sid, sub, templates[Math.floor(Math.random() * templates.length)], isCorrect, detail,
        Math.floor(Math.random() * 3), 20 + Math.floor(Math.random() * 140),
        new Date(Date.now() - Math.floor(Math.random() * 6 * 3600_000))]);
    }
  }
  // pastikan Hani macet tercatat di subbab 4
  logRows.push([ids["Hani Maheswari"], 4, "4.2", false, "Sisi arsiran terbalik. Uji titik (0, 0) untuk menentukan sisi yang benar.", 2, 75, new Date()]);
  logRows.push([ids["Hani Maheswari"], 4, "4.3", false, "Arsiran berada di sisi garis yang salah. Uji titik (0, 0)!", 3, 92, new Date()]);

  for (const r of logRows) {
    await pool.query(
      `insert into activity_logs (student_id, subbab, template_id, is_correct, error_detail, hint_level, duration_seconds, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      r
    );
  }

  // Sesi tutor aktif: Citra (tutor) membimbing Hani (macet sub-bab 4)
  await pool.query(
    `insert into tutor_sessions (class_id, requester_id, tutor_id, subbab, status, started_at)
     values ($1,$2,$3,$4,'ACTIVE', $5)`,
    [classId, ids["Hani Maheswari"], ids["Citra Ayu"], 4, new Date(Date.now() - 240_000)]
  );

  // Panggilan guru dari tutor
  await pool.query(
    "insert into teacher_calls (class_id, tutor_id, message) values ($1,$2,$3)",
    [classId, ids["Citra Ayu"], "Minta konfirmasi: penjelasan irisann DHP ke Hani"]
  );

  // Nilai sumatif Dewi (88)
  await pool.query(
    `insert into summative_assessments (student_id, soal_1_answer, soal_2_answer, score_details, total_score)
     values ($1,'{}'::jsonb,'{}'::jsonb,$2::jsonb,$3)`,
    [ids["Dewi Lestari"], arr([
      { key: "variabel", label: "Identifikasi variabel", earned: 15, max: 15 },
      { key: "kendala", label: "Menyusun kendala", earned: 20, max: 20 },
      { key: "grafik", label: "Grafik & jenis garis", earned: 15, max: 20 },
      { key: "pojok", label: "Titik pojok DHP", earned: 20, max: 20 },
      { key: "optimum", label: "Nilai maksimum & minimum", earned: 18, max: 25 },
    ]), 88]
  );

  console.log("Seed selesai.");
  console.log("Guru    : Pak Budi Santoso / guru123");
  console.log("Kelas   : Matematika X-A · kode MTK-XA-2024");
  console.log("Siswa   : 12 akun · password siswa123 (mis. 'Hani Maheswari')");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
