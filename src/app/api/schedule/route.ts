import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';
import { StoreScheduleConfig } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const storeSchedule = await serverStorage.getStoreSchedule();
    return NextResponse.json({ storeSchedule });
  } catch (err) {
    console.error('Erro na rota GET /api/schedule:', err);
    return NextResponse.json(
      { error: 'Falha ao buscar horário de funcionamento' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeSchedule } = body as { storeSchedule: StoreScheduleConfig };

    if (!storeSchedule || !Array.isArray(storeSchedule.schedule)) {
      return NextResponse.json(
        { error: 'Dados de horário de funcionamento inválidos' },
        { status: 400 }
      );
    }

    const updated = await serverStorage.updateStoreSchedule(storeSchedule);
    return NextResponse.json({ success: true, storeSchedule: updated });
  } catch (err) {
    console.error('Erro na rota PUT /api/schedule:', err);
    return NextResponse.json(
      { error: 'Falha ao atualizar horário de funcionamento' },
      { status: 500 }
    );
  }
}
