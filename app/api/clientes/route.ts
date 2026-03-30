import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const clientes = await prisma.cliente.findMany({
    where: { userId },
    include: { obras: { include: { pagamentos: true } } },
    orderBy: { criadoEm: 'desc' },
  })
  return NextResponse.json(clientes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const cliente = await prisma.cliente.create({
    data: { nome: body.nome, telefone: body.telefone ?? null, userId },
  })
  return NextResponse.json(cliente, { status: 201 })
}
