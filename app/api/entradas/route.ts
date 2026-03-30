import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)
  const entradas = await prisma.entradaAvulsa.findMany({
    where: { userId, data: { gte: inicio, lte: fim } },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(entradas)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const entrada = await prisma.entradaAvulsa.create({
    data: {
      userId,
      descricao: body.descricao,
      valor: parseFloat(body.valor),
      data: new Date(body.data),
    },
  })
  return NextResponse.json(entrada)
}
