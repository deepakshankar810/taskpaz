import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'AI features temporarily disabled.' },
    { status: 503 }
  );
}
