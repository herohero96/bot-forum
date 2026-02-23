import { NextResponse } from 'next/server';
import { bots } from '@/bots';

export async function GET() {
  return NextResponse.json(bots);
}
