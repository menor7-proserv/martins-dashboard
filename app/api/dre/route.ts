import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function calcDre(mes: number, ano: number, userId: string) {
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  const [obras, despesasPorCat] = await Promise.all([
    prisma.obra.aggregate({
      where: { data: { gte: inicio, lte: fim }, cliente: { userId } },
      _sum: { valorTotal: true },
      _count: true,
    }),
    prisma.despesa.groupBy({
      by: ['categoria'],
      where: { data: { gte: inicio, lte: fim }, userId },
      _sum: { valor: true },
    }),
  ])

  const catMap: Record<string, number> = {}
  for (const d of despesasPorCat) catMap[d.categoria] = d._sum.valor ?? 0

  const receitaBruta   = obras._sum.valorTotal ?? 0
  const impostos       = catMap['IMPOSTOS']    ?? 0
  const receitaLiquida = receitaBruta - impostos
  const material       = catMap['MATERIAL']    ?? 0
  const maoDeObra      = catMap['MAO_DE_OBRA'] ?? 0
  const custoServicos  = material + maoDeObra
  const lucroBruto     = receitaLiquida - custoServicos
  const transporte     = catMap['TRANSPORTE']  ?? 0
  const despesasOp     = transporte
  const lucroOp        = lucroBruto - despesasOp
  const lucroLiquido   = lucroOp

  const margemBruta   = receitaLiquida > 0 ? (lucroBruto   / receitaLiquida) * 100 : 0
  const margemOp      = receitaLiquida > 0 ? (lucroOp      / receitaLiquida) * 100 : 0
  const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0

  return { mes, ano, qtdObras: obras._count, receitaBruta, impostos, receitaLiquida, material, maoDeObra, custoServicos, lucroBruto, margemBruta, transporte, despesasOp, lucroOp, margemOp, lucroLiquido, margemLiquida }
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))

  const [atual, historico] = await Promise.all([
    calcDre(mes, ano, userId),
    Promise.all(Array.from({ length: 6 }, (_, i) => {
      const d = new Date(ano, mes - 1 - i, 1)
      return calcDre(d.getMonth() + 1, d.getFullYear(), userId)
    })),
  ])

  return NextResponse.json({ atual, historico: historico.reverse() })
}
