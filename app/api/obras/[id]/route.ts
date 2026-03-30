import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const obra = await prisma.obra.findFirst({ where: { id: parseInt(id), cliente: { userId } } })
  if (!obra) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const updated = await prisma.obra.update({
    where: { id: parseInt(id) },
    data: { descricao: body.descricao, valorTotal: body.valorTotal, data: new Date(body.data), status: body.status },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const obra = await prisma.obra.findFirst({ where: { id: parseInt(id), cliente: { userId } } })
  if (!obra) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.obra.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
