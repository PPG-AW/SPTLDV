import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/lib/auth";
import { getStudentFullState } from "@/lib/tutor";
import StudentApp, { type StudentState } from "@/components/StudentApp";

export const dynamic = "force-dynamic";

export default async function Belajar() {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") redirect("/");
  const state = (await getStudentFullState(identity.student)) as unknown as StudentState;
  return <StudentApp initial={state} />;
}
