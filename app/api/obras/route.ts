import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const obras = await prisma.obra.findMany({
    include: { cliente: true, pagamentos: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(obras)
}

export async function POST(request: Request) {
  const body = await request.json()
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
