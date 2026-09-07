import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const status = body.status as OrderStatus;

    if (!status) {
      return NextResponse.json({ error: 'Status não informado' }, { status: 400 });
    }

    const updated = await serverStorage.updateOrderStatus(id, status);

    if (!updated) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error('Erro na rota PATCH /api/orders/[id]/status:', err);
    return NextResponse.json({ error: 'Falha ao atualizar status' }, { status: 500 });
  }
}
