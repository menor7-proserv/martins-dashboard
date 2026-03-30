import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const hoje = new Date()
  const em7dias = new Date()
  em7dias.setDate(em7dias.getDate() + 7)

  const [vencidos, vencendoEm7] = await Promise.all([
    prisma.pagamento.findMany({
      where: {
        status: 'PENDENTE',
        vencimento: { lt: hoje },
        obra: { cliente: { userId } },
      },
      include: { obra: { include: { cliente: true } } },
      orderBy: { vencimento: 'asc' },
    }),
    prisma.pagamento.findMany({
      where: {
        status: 'PENDENTE',
        vencimento: { gte: hoje, lte: em7dias },
        obra: { cliente: { userId } },
      },
      include: { obra: { include: { cliente: true } } },
      orderBy: { vencimento: 'asc' },
    }),
  ])

  return NextResponse.json({
    vencidos: vencidos.map(p => ({
      id: p.id, valor: p.valor, vencimento: p.vencimento,
      cliente: p.obra.cliente.nome, obra: p.obra.descricao,
    })),
    vencendoEm7: vencendoEm7.map(p => ({
      id: p.id, valor: p.valor, vencimento: p.vencimento,
      cliente: p.obra.cliente.nome, obra: p.obra.descricao,
    })),
    totalVencido: vencidos.reduce((s, p) => s + p.valor, 0),
    totalVencendo: vencendoEm7.reduce((s, p) => s + p.valor, 0),
  })
}
