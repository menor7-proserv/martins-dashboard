import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// POST /api/recorrentes/gerar — gera ContasPagar do mês/ano para todas as recorrentes ativas
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const mes: number = body.mes
  const ano: number = body.ano

  const recorrentes = await prisma.despesaRecorrente.findMany({
    where: { userId, ativo: true },
  })

  // Evita duplicar: verifica contas que já existem nesse mês com mesmo valor+descricao
  const inicioMes = new Date(ano, mes - 1, 1)
  const fimMes = new Date(ano, mes, 0, 23, 59, 59)
  const existentes = await prisma.contaPagar.findMany({
    where: { userId, vencimento: { gte: inicioMes, lte: fimMes } },
    select: { descricao: true, valor: true },
  })
  const existentesSet = new Set(existentes.map(e => `${e.descricao}|${e.valor}`))

  const novas = recorrentes.filter(r => !existentesSet.has(`${r.descricao}|${r.valor}`))

  if (novas.length === 0) return NextResponse.json({ geradas: 0, msg: 'Todas já foram geradas' })

  const criadas = await Promise.all(
    novas.map(r => {
      const dia = Math.min(r.diaVencto, new Date(ano, mes, 0).getDate())
      return prisma.contaPagar.create({
        data: {
          userId,
          descricao: r.descricao,
          categoria: r.categoria,
          valor: r.valor,
          vencimento: new Date(ano, mes - 1, dia),
        },
      })
    })
  )

  return NextResponse.json({ geradas: criadas.length })
}
