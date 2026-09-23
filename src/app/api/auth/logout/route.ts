import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/server-helpers';

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
