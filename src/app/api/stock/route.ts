import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';
import { Ingredient, Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stock = await serverStorage.getStock();
    return NextResponse.json(stock);
  } catch (err) {
    console.error('Erro na rota GET /api/stock:', err);
    return NextResponse.json({ error: 'Falha ao buscar estoque' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, products } = body as {
      ingredients: Ingredient[];
      products: Product[];
    };

    if (!Array.isArray(ingredients) || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Formato de estoque inválido' }, { status: 400 });
    }

    await serverStorage.updateStock(ingredients, products);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro na rota PUT /api/stock:', err);
    return NextResponse.json({ error: 'Falha ao salvar estoque' }, { status: 500 });
  }
}
