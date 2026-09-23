import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  classCode: text("class_code").notNull(),
  className: text("class_name").notNull(),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("classes_code_uq").on(t.classCode),
  index("classes_teacher_idx").on(t.teacherId),
]);

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  currentSubbab: integer("current_subbab").notNull().default(1),
  completedSubbabs: jsonb("completed_subbabs")
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  streakCorrect: integer("streak_correct").notNull().default(0),
  consecutiveErrors: integer("consecutive_errors").notNull().default(0),
  status: text("status").notNull().default("AKTIF"), // AKTIF | MACET
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("students_class_name_uq").on(t.classId, t.name),
  index("students_class_idx").on(t.classId),
]);

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  teacherId: integer("teacher_id").references(() => teachers.id, { onDelete: "cascade" }),
  studentId: integer("student_id").references(() => students.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [
  index("sessions_student_idx").on(t.studentId),
  index("sessions_teacher_idx").on(t.teacherId),
]);

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  subbab: integer("subbab").notNull(),
  templateId: text("template_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  errorDetail: text("error_detail"),
  hintLevel: integer("hint_level").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("logs_student_idx").on(t.studentId),
  index("logs_subbab_idx").on(t.subbab),
]);

export const tutorSessions = pgTable("tutor_sessions", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  requesterId: integer("requester_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  tutorId: integer("tutor_id").references(() => students.id, { onDelete: "cascade" }),
  subbab: integer("subbab").notNull(),
  status: text("status").notNull().default("REQUESTED"), // REQUESTED | ACTIVE | COMPLETED | EXPIRED | CANCELLED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => [
  index("tutor_sessions_class_idx").on(t.classId),
  index("tutor_sessions_tutor_idx").on(t.tutorId),
  index("tutor_sessions_requester_idx").on(t.requesterId),
]);

export const teacherCalls = pgTable("teacher_calls", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  tutorId: integer("tutor_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("OPEN"), // OPEN | DONE
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
}, (t) => [
  index("teacher_calls_class_idx").on(t.classId),
]);

export const summativeAssessments = pgTable("summative_assessments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  soal1: jsonb("soal_1_answer").$type<Record<string, unknown>>().notNull(),
  soal2: jsonb("soal_2_answer").$type<Record<string, unknown>>().notNull(),
  scoreDetails: jsonb("score_details")
    .$type<{ key: string; label: string; earned: number; max: number }[]>()
    .notNull(),
  totalScore: integer("total_score").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("summative_student_uq").on(t.studentId),
]);

export type Teacher = typeof teachers.$inferSelect;
export type ClassRow = typeof classes.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type TutorSession = typeof tutorSessions.$inferSelect;
export type TeacherCall = typeof teacherCalls.$inferSelect;
export type SummativeAssessment = typeof summativeAssessments.$inferSelect;
