import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  // Faturamento: soma de obras abertas no período
  const obrasNoMes = await prisma.obra.aggregate({
    where: { data: { gte: inicio, lte: fim } },
    _sum: { valorTotal: true },
  })

  // Pagamentos já recebidos no período
  const pagamentosRecebidos = await prisma.pagamento.aggregate({
    where: { status: 'RECEBIDO', vencimento: { gte: inicio, lte: fim } },
    _sum: { valor: true },
  })

  // Despesas do período
  const despesas = await prisma.despesa.aggregate({
    where: { data: { gte: inicio, lte: fim } },
    _sum: { valor: true },
  })

  // Despesas por categoria
  const despesasPorCategoria = await prisma.despesa.groupBy({
    by: ['categoria'],
    where: { data: { gte: inicio, lte: fim } },
    _sum: { valor: true },
  })

  // Contas a receber (PENDENTE) por prazo
  const contasAReceber = await prisma.pagamento.groupBy({
    by: ['prazo'],
    where: { status: 'PENDENTE' },
    _sum: { valor: true },
    _count: true,
  })

  const totalReceber = await prisma.pagamento.aggregate({
    where: { status: 'PENDENTE' },
    _sum: { valor: true },
  })

  // Meta do mês
  const meta = await prisma.meta.findUnique({ where: { mes_ano: { mes, ano } } })

  // Últimos 6 meses para gráfico
  const historico = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(ano, mes - 1 - i, 1)
      const m = d.getMonth() + 1
      const a = d.getFullYear()
      const ini = new Date(a, m - 1, 1)
      const fim2 = new Date(a, m, 0, 23, 59, 59)
      return Promise.all([
        prisma.obra.aggregate({ where: { data: { gte: ini, lte: fim2 } }, _sum: { valorTotal: true } }),
        prisma.despesa.aggregate({ where: { data: { gte: ini, lte: fim2 } }, _sum: { valor: true } }),
      ]).then(([obras, desp]) => ({
        mes: m,
        ano: a,
        faturamento: obras._sum.valorTotal ?? 0,
        despesas: desp._sum.valor ?? 0,
        lucro: (obras._sum.valorTotal ?? 0) - (desp._sum.valor ?? 0),
      }))
    })
  )

  const faturamento = obrasNoMes._sum.valorTotal ?? 0
  const totalDespesas = despesas._sum.valor ?? 0
  const lucro = faturamento - totalDespesas
  const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0

  return NextResponse.json({
    periodo: { mes, ano },
    faturamento,
    despesas: totalDespesas,
    lucro,
    margem,
    recebido: pagamentosRecebidos._sum.valor ?? 0,
    despesasPorCategoria,
    contasAReceber,
    totalAReceber: totalReceber._sum.valor ?? 0,
    meta,
    historico: historico.reverse(),
  })
}
