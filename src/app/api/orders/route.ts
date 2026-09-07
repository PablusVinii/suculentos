import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const order = await serverStorage.getOrderByCode(code);
      if (!order) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    const orders = await serverStorage.getOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Erro na rota GET /api/orders:', err);
    return NextResponse.json({ error: 'Falha ao buscar pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = body as Order;

    if (!order || !order.id || !order.customerName) {
      return NextResponse.json({ error: 'Dados do pedido inválidos' }, { status: 400 });
    }

    const created = await serverStorage.createOrder(order);
    return NextResponse.json({ success: true, order: created }, { status: 201 });
  } catch (err) {
    console.error('Erro na rota POST /api/orders:', err);
    return NextResponse.json({ error: 'Falha ao criar pedido no servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }

    const deleted = await serverStorage.deleteOrder(id);
    return NextResponse.json({ success: true, deleted, id });
  } catch (err) {
    console.error('Erro na rota DELETE /api/orders:', err);
    return NextResponse.json({ error: 'Falha ao excluir pedido' }, { status: 500 });
  }
}
