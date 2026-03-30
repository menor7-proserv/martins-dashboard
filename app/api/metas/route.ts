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
  const meta = await prisma.meta.findUnique({ where: { mes_ano_userId: { mes, ano, userId } } })
  return NextResponse.json(meta)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const meta = await prisma.meta.upsert({
    where: { mes_ano_userId: { mes: body.mes, ano: body.ano, userId } },
    update: { metaFaturamento: body.metaFaturamento, metaLucro: body.metaLucro },
    create: { mes: body.mes, ano: body.ano, userId, metaFaturamento: body.metaFaturamento, metaLucro: body.metaLucro },
  })
  return NextResponse.json(meta)
}
