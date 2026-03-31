import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  const where: Record<string, unknown> = { userId }
  if (status) where.status = status
  if (mes && ano) {
    where.vencimento = {
      gte: new Date(+ano, +mes - 1, 1),
      lte: new Date(+ano, +mes, 0, 23, 59, 59),
    }
  }

  const contas = await prisma.contaPagar.findMany({
    where,
    include: {
      fornecedor: { select: { id: true, nome: true } },
      obra: { select: { id: true, descricao: true } },
    },
    orderBy: { vencimento: 'asc' },
  })

  const totalPendente = contas.filter(c => c.status === 'PENDENTE').reduce((s, c) => s + c.valor, 0)
  const totalPago = contas.filter(c => c.status === 'PAGO').reduce((s, c) => s + c.valor, 0)
  const vencidas = contas.filter(c => c.status === 'PENDENTE' && new Date(c.vencimento) < new Date()).length

  return NextResponse.json({ contas, totalPendente, totalPago, vencidas })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const conta = await prisma.contaPagar.create({
    data: {
      userId: session.user.id,
      descricao: body.descricao,
      categoria: body.categoria,
      valor: parseFloat(body.valor),
      vencimento: new Date(body.vencimento),
      fornecedorId: body.fornecedorId ? +body.fornecedorId : null,
      obraId: body.obraId ? +body.obraId : null,
    },
    include: { fornecedor: { select: { id: true, nome: true } } },
  })
  return NextResponse.json(conta, { status: 201 })
}
