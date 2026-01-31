import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'API endpoint temporarily disabled. Please use client-side Firestore.' },
    { status: 503 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'API endpoint temporarily disabled. Please use client-side Firestore.' },
    { status: 503 }
  );
}
