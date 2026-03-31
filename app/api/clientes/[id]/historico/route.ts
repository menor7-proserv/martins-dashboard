import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const cliente = await prisma.cliente.findFirst({
    where: { id: parseInt(id), userId },
    include: {
      obras: {
        include: { pagamentos: { orderBy: { vencimento: 'asc' } } },
        orderBy: { data: 'desc' },
      },
    },
  })

  if (!cliente) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const totalObras = cliente.obras.reduce((s, o) => s + o.valorTotal, 0)
  const totalRecebido = cliente.obras
    .flatMap(o => o.pagamentos)
    .filter(p => p.status === 'RECEBIDO')
    .reduce((s, p) => s + p.valor, 0)
  const totalPendente = cliente.obras
    .flatMap(o => o.pagamentos)
    .filter(p => p.status === 'PENDENTE')
    .reduce((s, p) => s + p.valor, 0)

  return NextResponse.json({ cliente, totalObras, totalRecebido, totalPendente })
}
