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

  const obrasNoMes = await prisma.obra.aggregate({
    where: { data: { gte: inicio, lte: fim }, cliente: { userId } },
    _sum: { valorTotal: true },
  })

  const pagamentosRecebidos = await prisma.pagamento.aggregate({
    where: { status: 'RECEBIDO', vencimento: { gte: inicio, lte: fim }, obra: { cliente: { userId } } },
    _sum: { valor: true },
  })

  const despesas = await prisma.despesa.aggregate({
    where: { data: { gte: inicio, lte: fim }, userId },
    _sum: { valor: true },
  })

  const despesasPorCategoria = await prisma.despesa.groupBy({
    by: ['categoria'],
    where: { data: { gte: inicio, lte: fim }, userId },
    _sum: { valor: true },
  })

  const contasAReceber = await prisma.pagamento.groupBy({
    by: ['prazo'],
    where: { status: 'PENDENTE', obra: { cliente: { userId } } },
    _sum: { valor: true },
    _count: true,
  })

  const totalReceber = await prisma.pagamento.aggregate({
    where: { status: 'PENDENTE', obra: { cliente: { userId } } },
    _sum: { valor: true },
  })

  const meta = await prisma.meta.findUnique({ where: { mes_ano_userId: { mes, ano, userId } } })

  const historico = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(ano, mes - 1 - i, 1)
      const m = d.getMonth() + 1
      const a = d.getFullYear()
      const ini = new Date(a, m - 1, 1)
      const fim2 = new Date(a, m, 0, 23, 59, 59)
      return Promise.all([
        prisma.obra.aggregate({ where: { data: { gte: ini, lte: fim2 }, cliente: { userId } }, _sum: { valorTotal: true } }),
        prisma.despesa.aggregate({ where: { data: { gte: ini, lte: fim2 }, userId }, _sum: { valor: true } }),
      ]).then(([obras, desp]) => ({
        mes: m, ano: a,
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
