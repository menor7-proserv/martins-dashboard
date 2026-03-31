import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''

  const obras = await prisma.obra.findMany({
    where: {
      cliente: { userId },
      ...(status ? { status } : {}),
    },
    include: {
      cliente: { select: { id: true, nome: true } },
      pagamentos: true,
      despesas: true,
      contasPagar: true,
    },
    orderBy: { data: 'desc' },
  })

  const result = obras.map(o => {
    const recebido = o.pagamentos.filter(p => p.status === 'RECEBIDO').reduce((s, p) => s + p.valor, 0)
    const pendente = o.pagamentos.filter(p => p.status === 'PENDENTE').reduce((s, p) => s + p.valor, 0)
    const custosDespesas = o.despesas.reduce((s, d) => s + d.valor, 0)
    const custosAP = o.contasPagar.filter(c => c.status === 'PAGO').reduce((s, c) => s + c.valor, 0)
    const custoTotal = custosDespesas + custosAP
    const margemBruta = o.valorTotal > 0 ? ((o.valorTotal - custoTotal) / o.valorTotal) * 100 : 0
    const lucro = o.valorTotal - custoTotal
    return {
      id: o.id,
      descricao: o.descricao,
      cliente: o.cliente.nome,
      clienteId: o.cliente.id,
      status: o.status,
      data: o.data,
      valorTotal: o.valorTotal,
      recebido,
      pendente,
      custoTotal,
      lucro,
      margemBruta,
      qtdDespesas: o.despesas.length + o.contasPagar.length,
    }
  })

  const totalFaturamento = result.reduce((s, o) => s + o.valorTotal, 0)
  const totalCusto = result.reduce((s, o) => s + o.custoTotal, 0)
  const totalLucro = result.reduce((s, o) => s + o.lucro, 0)
  const margemMedia = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0

  return NextResponse.json({ obras: result, totalFaturamento, totalCusto, totalLucro, margemMedia })
}
