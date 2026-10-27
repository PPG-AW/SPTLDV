import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";
import TeacherApp from "@/components/TeacherApp";

export const dynamic = "force-dynamic";

export default async function DashboardGuru() {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") redirect("/guru");

  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.teacherId, identity.teacher.id))
    .orderBy(classes.id);
  const counts = await db
    .select({ classId: students.classId, n: sql<number>`count(*)::int` })
    .from(students)
    .groupBy(students.classId);
  const countMap = new Map(counts.map((c) => [c.classId, c.n]));
  const enriched = rows.map((c) => ({ ...c, studentCount: countMap.get(c.id) ?? 0 }));

  return <TeacherApp teacherName={identity.teacher.name} initialClasses={enriched} />;
}
