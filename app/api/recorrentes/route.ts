import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const recorrentes = await prisma.despesaRecorrente.findMany({
    where: { userId: session.user.id },
    orderBy: { diaVencto: 'asc' },
  })
  return NextResponse.json(recorrentes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const recorrente = await prisma.despesaRecorrente.create({
    data: {
      userId: session.user.id,
      descricao: body.descricao,
      categoria: body.categoria,
      valor: parseFloat(body.valor),
      diaVencto: parseInt(body.diaVencto),
    },
  })
  return NextResponse.json(recorrente, { status: 201 })
}
