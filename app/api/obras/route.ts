import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const obras = await prisma.obra.findMany({
    where: { cliente: { userId } },
    include: { cliente: true, pagamentos: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(obras)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const cliente = await prisma.cliente.findFirst({ where: { id: body.clienteId, userId } })
  if (!cliente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const obra = await prisma.obra.create({
    data: {
      clienteId: body.clienteId,
      descricao: body.descricao,
      valorTotal: body.valorTotal,
      data: new Date(body.data),
      status: body.status ?? 'ABERTA',
    },
    include: { cliente: true },
  })
  return NextResponse.json(obra, { status: 201 })
}
