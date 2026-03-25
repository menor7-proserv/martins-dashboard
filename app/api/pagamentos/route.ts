import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const obraId = searchParams.get('obraId')
  const pagamentos = await prisma.pagamento.findMany({
    where: obraId ? { obraId: parseInt(obraId) } : undefined,
    include: { obra: { include: { cliente: true } } },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(pagamentos)
}

export async function POST(request: Request) {
  const body = await request.json()
  const pagamento = await prisma.pagamento.create({
    data: {
      obraId: body.obraId,
      valor: body.valor,
      prazo: body.prazo,
      vencimento: new Date(body.vencimento),
      status: 'PENDENTE',
    },
  })
  return NextResponse.json(pagamento, { status: 201 })
}
