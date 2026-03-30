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

  const [pagamentosRecebidos, despesas, pagamentosPendentes] = await Promise.all([
    prisma.pagamento.findMany({
      where: {
        status: 'RECEBIDO',
        vencimento: { gte: inicio, lte: fim },
        obra: { cliente: { userId } },
      },
      include: { obra: { include: { cliente: true } } },
    }),
    prisma.despesa.findMany({
      where: { userId, data: { gte: inicio, lte: fim } },
    }),
    prisma.pagamento.findMany({
      where: {
        status: 'PENDENTE',
        obra: { cliente: { userId } },
      },
      include: { obra: { include: { cliente: true } } },
      orderBy: { vencimento: 'asc' },
    }),
  ])

  // Agrupa por dia
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const dias = Array.from({ length: diasNoMes }, (_, i) => {
    const dia = i + 1
    const entradas = pagamentosRecebidos
      .filter(p => new Date(p.vencimento).getDate() === dia)
      .reduce((s, p) => s + p.valor, 0)
    const saidas = despesas
      .filter(d => new Date(d.data).getDate() === dia)
      .reduce((s, d) => s + d.valor, 0)
    return { dia, entradas, saidas, saldo: entradas - saidas }
  })

  // Saldo acumulado
  let acumulado = 0
  const diasComAcumulado = dias.map(d => {
    acumulado += d.saldo
    return { ...d, acumulado }
  })

  const totalEntradas = pagamentosRecebidos.reduce((s, p) => s + p.valor, 0)
  const totalSaidas = despesas.reduce((s, d) => s + d.valor, 0)
  const totalPendente = pagamentosPendentes.reduce((s, p) => s + p.valor, 0)

  const pendentes = pagamentosPendentes.map(p => ({
    id: p.id,
    valor: p.valor,
    prazo: p.prazo,
    vencimento: p.vencimento,
    cliente: p.obra.cliente.nome,
    obra: p.obra.descricao,
    vencido: new Date(p.vencimento) < new Date(),
  }))

  return NextResponse.json({
    dias: diasComAcumulado,
    pendentes,
    totalEntradas,
    totalSaidas,
    saldo: totalEntradas - totalSaidas,
    totalPendente,
  })
}
