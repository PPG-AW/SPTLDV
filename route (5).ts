import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const r = await db.execute(
      sql`select to_regclass('public.teachers') as t, to_regclass('public.students') as s`
    );
    const row = r.rows[0] as { t: string | null; s: string | null };
    const schemaReady = !!(row.t && row.s);
    return Response.json({
      ok: true,
      schemaReady,
      hint: schemaReady ? undefined : "Skema belum dibuat — lihat README.md bagian Setup Database.",
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
