import { NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await serverStorage.getSyncData();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erro na rota GET /api/sync:', err);
    return NextResponse.json({ error: 'Falha na sincronização' }, { status: 500 });
  }
}
