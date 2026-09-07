import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/server/storage';
import { AdminUser } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await serverStorage.getUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error('Erro na rota GET /api/users:', err);
    return NextResponse.json({ error: 'Falha ao buscar usuários' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { users } = body as { users: AdminUser[] };

    if (!Array.isArray(users)) {
      return NextResponse.json({ error: 'Lista de usuários inválida' }, { status: 400 });
    }

    await serverStorage.updateUsers(users);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro na rota PUT /api/users:', err);
    return NextResponse.json({ error: 'Falha ao atualizar usuários' }, { status: 500 });
  }
}
