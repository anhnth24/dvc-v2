import { NextResponse } from 'next/server';

export async function GET(_req: Request, context: { params: { path: string[] } }) {
  return NextResponse.json({ proxy: context.params.path ?? [] });
}

export async function POST(_req: Request, context: { params: { path: string[] } }) {
  return NextResponse.json({ proxy: context.params.path ?? [], method: 'POST' });
}
