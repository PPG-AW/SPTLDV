import { cookies } from "next/headers";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import {
  classes,
  sessions,
  students,
  teachers,
  type ClassRow,
  type Student,
  type Teacher,
} from "@/db/schema";

const COOKIE_NAME = "sptldv_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 32);
  const real = Buffer.from(hash, "hex");
  return test.length === real.length && timingSafeEqual(test, real);
}

export async function createSession(identity: { teacherId?: number; studentId?: number }) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    token,
    teacherId: identity.teacherId ?? null,
    studentId: identity.studentId ?? null,
    expiresAt,
  });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(COOKIE_NAME);
}

export type SessionIdentity =
  | { type: "student"; student: Student; classRow: ClassRow }
  | { type: "teacher"; teacher: Teacher };

export async function getSessionIdentity(): Promise<SessionIdentity | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const session = rows[0];
  if (!session) return null;

  if (session.studentId) {
    const s = await db.select().from(students).where(eq(students.id, session.studentId)).limit(1);
    const student = s[0];
    if (!student) return null;
    const c = await db.select().from(classes).where(eq(classes.id, student.classId)).limit(1);
    const classRow = c[0];
    if (!classRow) return null;
    return { type: "student", student, classRow };
  }

  if (session.teacherId) {
    const t = await db.select().from(teachers).where(eq(teachers.id, session.teacherId)).limit(1);
    const teacher = t[0];
    if (!teacher) return null;
    return { type: "teacher", teacher };
  }

  return null;
}
