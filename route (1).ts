import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

async function ownedClass(id: number, teacherId: number) {
  const [cls] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, id), eq(classes.teacherId, teacherId)))
    .limit(1);
  return cls ?? null;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  const { id } = await context.params;
  const classId = Number(id);
  if (!classId) return err("ID tidak valid");
  const cls = await ownedClass(classId, identity.teacher.id);
  if (!cls) return err("Rombel tidak ditemukan.", 404);

  let body: { className?: string; isLocked?: boolean };
  try {
    body = await req.json();
  } catch {
    return err("Body tidak valid");
  }
  const set: Partial<{ className: string; isLocked: boolean }> = {};
  if (typeof body.className === "string" && body.className.trim().length >= 3) {
    set.className = body.className.trim();
  }
  if (typeof body.isLocked === "boolean") set.isLocked = body.isLocked;
  if (Object.keys(set).length === 0) return err("Tidak ada perubahan.");
  await db.update(classes).set(set).where(eq(classes.id, classId));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  const { id } = await context.params;
  const classId = Number(id);
  const cls = await ownedClass(classId, identity.teacher.id);
  if (!cls) return err("Rombel tidak ditemukan.", 404);
  await db.delete(classes).where(eq(classes.id, classId));
  return NextResponse.json({ ok: true });
}
