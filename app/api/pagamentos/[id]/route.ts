import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const pagamento = await prisma.pagamento.findFirst({ where: { id: parseInt(id), obra: { cliente: { userId } } } })
  if (!pagamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const data: Record<string, unknown> = {}
  if (body.status !== undefined) data.status = body.status
  if (body.valor !== undefined) data.valor = body.valor
  if (body.vencimento !== undefined) data.vencimento = new Date(body.vencimento)
  if (body.prazo !== undefined) data.prazo = body.prazo
  const updated = await prisma.pagamento.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const pagamento = await prisma.pagamento.findFirst({ where: { id: parseInt(id), obra: { cliente: { userId } } } })
  if (!pagamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.pagamento.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
