import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const obraId = searchParams.get('obraId')
  const pagamentos = await prisma.pagamento.findMany({
    where: obraId
      ? { obraId: parseInt(obraId), obra: { cliente: { userId } } }
      : { obra: { cliente: { userId } } },
    include: { obra: { include: { cliente: true } } },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(pagamentos)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()
  const obra = await prisma.obra.findFirst({ where: { id: body.obraId, cliente: { userId } } })
  if (!obra) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const pagamento = await prisma.pagamento.create({
    data: { obraId: body.obraId, valor: body.valor, prazo: body.prazo, vencimento: new Date(body.vencimento), status: 'PENDENTE' },
  })
  return NextResponse.json(pagamento, { status: 201 })
}
