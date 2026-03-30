import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')
  const categoria = searchParams.get('categoria')

  const where: Record<string, unknown> = { userId }
  if (mes && ano) {
    where.data = {
      gte: new Date(parseInt(ano), parseInt(mes) - 1, 1),
      lte: new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59),
    }
  }
  if (categoria) where.categoria = categoria

  const despesas = await prisma.despesa.findMany({ where, orderBy: { data: 'desc' } })
  return NextResponse.json(despesas)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const despesa = await prisma.despesa.create({
    data: { categoria: body.categoria, descricao: body.descricao, valor: body.valor, data: new Date(body.data), userId },
  })
  return NextResponse.json(despesa, { status: 201 })
}
