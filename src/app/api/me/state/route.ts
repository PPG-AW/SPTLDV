import { NextResponse } from "next/server";
import { getSessionIdentity } from "@/lib/auth";
import { getStudentFullState, touchStudent } from "@/lib/tutor";

export async function GET() {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await touchStudent(identity.student.id);
  const fresh = { ...identity.student, lastActiveAt: new Date() };
  const state = await getStudentFullState(fresh);
  return NextResponse.json(state);
}
