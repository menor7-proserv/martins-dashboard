import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))
  const meta = await prisma.meta.findUnique({ where: { mes_ano: { mes, ano } } })
  return NextResponse.json(meta)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const meta = await prisma.meta.upsert({
    where: { mes_ano: { mes: body.mes, ano: body.ano } },
    update: { metaFaturamento: body.metaFaturamento, metaLucro: body.metaLucro },
    create: { mes: body.mes, ano: body.ano, metaFaturamento: body.metaFaturamento, metaLucro: body.metaLucro },
  })
  return NextResponse.json(meta)
}
