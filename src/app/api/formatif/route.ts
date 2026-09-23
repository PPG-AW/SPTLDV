import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { attempts, progres } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateQuestion, makeSeed } from '@/lib/generator';
import { BINTANG_LULUS } from '@/config/aturan';
import { ensureTables } from '@/db';

let tablesEnsured = false;

export async function GET(req: Request) {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subbabNo = parseInt(searchParams.get('subbab') || '0');
  const attemptKe = parseInt(searchParams.get('attempt') || '1');

  if (!subbabNo || subbabNo < 1 || subbabNo > 10) {
    return NextResponse.json({ error: 'Invalid subbab' }, { status: 400 });
  }

  // Generate or retrieve question
  const seed = makeSeed(String(session.userId), 'formatif', subbabNo, attemptKe);
  
  // Check if already attempted with this seed
  const existing = await db
    .select()
    .from(attempts)
    .where(and(
      eq(attempts.siswa_id, session.userId),
      eq(attempts.jenis, 'formatif'),
      eq(attempts.subbab_no, subbabNo),
      eq(attempts.seed, seed)
    ));

  let question;
  if (existing.length > 0) {
    // Return existing question (without kunci/jawaban)
    const payload = existing[0].payload as any;
    question = {
      tampilan: payload.tampilan,
      tipe: payload.tipe,
      opsi: payload.opsi,
      hint: payload.hint,
    };
  } else {
    // Generate new question
    question = generateQuestion(subbabNo, seed);
    
    // Store in database (without sending kunci to client)
    await db.insert(attempts).values({
      siswa_id: session.userId,
      jenis: 'formatif',
      subbab_no: subbabNo,
      seed,
      payload: question as any,
    });
  }

  // Get current progress
  const progresData = await db
    .select()
    .from(progres)
    .where(and(eq(progres.siswa_id, session.userId), eq(progres.subbab_no, subbabNo)));

  const currentBenar = progresData.length > 0 ? progresData[0].benar : 0;

  return NextResponse.json({
    question: {
      tampilan: question.tampilan,
      tipe: question.tipe,
      opsi: question.opsi,
      hint: question.hint,
    },
    progress: {
      benar: currentBenar,
      lulus: currentBenar >= BINTANG_LULUS,
    },
  });
}

export async function POST(req: Request) {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subbab_no, attempt, jawaban, hint_terpakai } = await req.json();

    // Get the attempt record
    const seed = makeSeed(String(session.userId), 'formatif', subbab_no, attempt);
    const attemptRecord = await db
      .select()
      .from(attempts)
      .where(and(
        eq(attempts.siswa_id, session.userId),
        eq(attempts.jenis, 'formatif'),
        eq(attempts.subbab_no, subbab_no),
        eq(attempts.seed, seed)
      ));

    if (attemptRecord.length === 0) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const payload = attemptRecord[0].payload as any;
    
    // Verify answer server-side
    const isCorrect = payload.jawabanBenar === jawaban;

    // Update attempt record
    await db.update(attempts)
      .set({
        jawaban,
        benar: isCorrect,
        hint_terpakai: hint_terpakai || 0,
      })
      .where(eq(attempts.id, attemptRecord[0].id));

    // Update progress if correct
    if (isCorrect) {
      const progresData = await db
        .select()
        .from(progres)
        .where(and(eq(progres.siswa_id, session.userId), eq(progres.subbab_no, subbab_no)));

      if (progresData.length === 0) {
        await db.insert(progres).values({
          siswa_id: session.userId,
          subbab_no,
          terbuka_at: new Date(),
          benar: 1,
        });
      } else {
        const newBenar = Math.min(progresData[0].benar + 1, BINTANG_LULUS);
        await db.update(progres)
          .set({
            benar: newBenar,
            lulus_at: newBenar >= BINTANG_LULUS ? new Date() : progresData[0].lulus_at,
          })
          .where(and(eq(progres.siswa_id, session.userId), eq(progres.subbab_no, subbab_no)));

        // Unlock next subbab
        if (newBenar >= BINTANG_LULUS && subbab_no < 10) {
          const nextProgres = await db
            .select()
            .from(progres)
            .where(and(eq(progres.siswa_id, session.userId), eq(progres.subbab_no, subbab_no + 1)));

          if (nextProgres.length === 0) {
            await db.insert(progres).values({
              siswa_id: session.userId,
              subbab_no: subbab_no + 1,
              terbuka_at: new Date(),
              benar: 0,
            });
          } else if (!nextProgres[0].terbuka_at) {
            await db.update(progres)
              .set({ terbuka_at: new Date() })
              .where(and(eq(progres.siswa_id, session.userId), eq(progres.subbab_no, subbab_no + 1)));
          }
        }
      }
    }

    return NextResponse.json({
      correct: isCorrect,
      pembahasan: isCorrect ? undefined : payload.langkah,
    });
  } catch (error) {
    console.error('Submit formatif error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
