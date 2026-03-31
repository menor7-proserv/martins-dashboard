import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json({ clientes: [], obras: [], despesas: [] })

  const [clientes, obras, despesas] = await Promise.all([
    prisma.cliente.findMany({
      where: {
        userId,
        OR: [
          { nome: { contains: q } },
          { telefone: { contains: q } },
        ],
      },
      take: 5,
    }),
    prisma.obra.findMany({
      where: {
        cliente: { userId },
        descricao: { contains: q },
      },
      include: { cliente: { select: { id: true, nome: true } } },
      take: 5,
    }),
    prisma.despesa.findMany({
      where: {
        userId,
        descricao: { contains: q },
      },
      orderBy: { data: 'desc' },
      take: 5,
    }),
  ])

  return NextResponse.json({ clientes, obras, despesas })
}
