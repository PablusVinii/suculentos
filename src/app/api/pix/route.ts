import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';
import { PixConfig } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pixConfig = await serverStorage.getPixConfig();
    return NextResponse.json({ pixConfig });
  } catch (err) {
    console.error('Erro na rota GET /api/pix:', err);
    return NextResponse.json({ error: 'Falha ao buscar configuração PIX' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pixConfig } = body as { pixConfig: PixConfig };

    if (!pixConfig || typeof pixConfig.key !== 'string') {
      return NextResponse.json({ error: 'Dados de configuração PIX inválidos' }, { status: 400 });
    }

    const updated = await serverStorage.updatePixConfig(pixConfig);
    return NextResponse.json({ success: true, pixConfig: updated });
  } catch (err) {
    console.error('Erro na rota PUT /api/pix:', err);
    return NextResponse.json({ error: 'Falha ao atualizar configuração PIX' }, { status: 500 });
  }
}
