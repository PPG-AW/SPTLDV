// ─── Demo seed (dipakai oleh /api/setup; idempoten — hanya jika guru kosong) ─
import { randomBytes, scryptSync } from "crypto";
import { db } from "@/db";
import {
  activityLogs,
  classes,
  students,
  summativeAssessments,
  teacherCalls,
  teachers,
  tutorSessions,
} from "@/db/schema";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export interface SeedResult {
  seeded: boolean;
  teacherName?: string;
  teacherPassword?: string;
  classCode?: string;
  studentPassword?: string;
  studentCount?: number;
}

export async function runDemoSeed(): Promise<SeedResult> {
  const existing = await db.select({ id: teachers.id }).from(teachers).limit(1);
  if (existing.length > 0) return { seeded: false };

  const [teacher] = await db
    .insert(teachers)
    .values({ name: "Pak Budi Santoso", passwordHash: hashPassword("guru123") })
    .returning();

  const [cls] = await db
    .insert(classes)
    .values({ teacherId: teacher.id, classCode: "MTK-XA-2024", className: "Matematika X-A" })
    .returning();

  const roster: [string, number, number[], number, number, string][] = [
    ["Dewi Lestari", 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0, 0, "AKTIF"],
    ["Citra Ayu", 10, [1, 2, 3, 4, 5, 6, 7, 8, 9], 2, 0, "AKTIF"],
    ["Andi Pratama", 9, [1, 2, 3, 4, 5, 6, 7, 8], 1, 0, "AKTIF"],
    ["Kirana Putri", 7, [1, 2, 3, 4, 5, 6], 0, 1, "AKTIF"],
    ["Eko Nugroho", 6, [1, 2, 3, 4, 5], 2, 0, "AKTIF"],
    ["Fajar Ramadhan", 6, [1, 2, 3, 4, 5], 0, 0, "AKTIF"],
    ["Gita Savitri", 5, [1, 2, 3, 4], 1, 0, "AKTIF"],
    ["Hani Maheswari", 4, [1, 2, 3], 0, 3, "MACET"],
    ["Ilham Firdaus", 3, [1, 2], 0, 1, "AKTIF"],
    ["Joko Widarto", 3, [1, 2], 1, 0, "AKTIF"],
    ["Laras Sinta", 2, [1], 0, 2, "AKTIF"],
    ["Made Wirawan", 1, [], 0, 0, "AKTIF"],
  ];

  const pw = hashPassword("siswa123");
  const ids: Record<string, number> = {};
  for (const [name, cur, done, streak, errors, status] of roster) {
    const [s] = await db
      .insert(students)
      .values({
        name,
        passwordHash: pw,
        classId: cls.id,
        currentSubbab: cur,
        completedSubbabs: done,
        streakCorrect: streak,
        consecutiveErrors: errors,
        status,
        lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 30000)),
      })
      .returning();
    ids[name] = s.id;
  }

  const ERRORS: Record<number, string[]> = {
    2: ["Tertukar! Sumbu X berbentuk (p, 0) dan sumbu Y berbentuk (0, q)."],
    3: ["Jenis garis salah: tanda ≤/≥ memakai garis penuh.", "Arsiran berada di sisi garis yang salah. Uji titik (0, 0)!"],
    4: ["Sisi arsiran terbalik. Uji titik (0, 0) untuk menentukan sisi yang benar."],
    7: ["Menghitung perpotongan garis di LUAR DHP sebagai titik pojok."],
    8: ["Salah menjumlahkan saat eliminasi (tanda minus)."],
  };
  const names = Object.keys(ids);
  for (const name of names) {
    const sid = ids[name];
    const my = roster.find((r) => r[0] === name)!;
    const maxSub = Math.min(my[1], 8);
    for (let i = 0; i < 7; i++) {
      const sub = 1 + Math.floor(Math.random() * maxSub);
      const isCorrect = Math.random() < 0.62;
      const bank = ERRORS[sub];
      await db.insert(activityLogs).values({
        studentId: sid,
        subbab: sub,
        templateId: `${sub}.${1 + Math.floor(Math.random() * 3)}`,
        isCorrect,
        errorDetail: isCorrect ? null : bank ? bank[Math.floor(Math.random() * bank.length)] : "Jawaban belum tepat.",
        hintLevel: Math.floor(Math.random() * 3),
        durationSeconds: 20 + Math.floor(Math.random() * 140),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 6 * 3600_000)),
      });
    }
  }
  await db.insert(activityLogs).values([
    {
      studentId: ids["Hani Maheswari"], subbab: 4, templateId: "4.2", isCorrect: false,
      errorDetail: "Sisi arsiran terbalik. Uji titik (0, 0) untuk menentukan sisi yang benar.",
      hintLevel: 2, durationSeconds: 75,
    },
    {
      studentId: ids["Hani Maheswari"], subbab: 4, templateId: "4.3", isCorrect: false,
      errorDetail: "Arsiran berada di sisi garis yang salah. Uji titik (0, 0)!",
      hintLevel: 3, durationSeconds: 92,
    },
  ]);

  await db.insert(tutorSessions).values({
    classId: cls.id,
    requesterId: ids["Hani Maheswari"],
    tutorId: ids["Citra Ayu"],
    subbab: 4,
    status: "ACTIVE",
    startedAt: new Date(Date.now() - 240_000),
  });

  await db.insert(teacherCalls).values({
    classId: cls.id,
    tutorId: ids["Citra Ayu"],
    message: "Minta konfirmasi: penjelasan irisan DHP ke Hani",
  });

  await db.insert(summativeAssessments).values({
    studentId: ids["Dewi Lestari"],
    soal1: {},
    soal2: {},
    scoreDetails: [
      { key: "variabel", label: "Identifikasi variabel", earned: 15, max: 15 },
      { key: "kendala", label: "Menyusun kendala", earned: 20, max: 20 },
      { key: "grafik", label: "Grafik & jenis garis", earned: 15, max: 20 },
      { key: "pojok", label: "Titik pojok DHP", earned: 20, max: 20 },
      { key: "optimum", label: "Nilai maksimum & minimum", earned: 18, max: 25 },
    ],
    totalScore: 88,
  });

  return {
    seeded: true,
    teacherName: "Pak Budi Santoso",
    teacherPassword: "guru123",
    classCode: "MTK-XA-2024",
    studentPassword: "siswa123",
    studentCount: roster.length,
  };
}
