import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const cliente = await prisma.cliente.findFirst({ where: { id: parseInt(id), userId } })
  if (!cliente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const updated = await prisma.cliente.update({
    where: { id: parseInt(id) },
    data: { nome: body.nome, telefone: body.telefone },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const cliente = await prisma.cliente.findFirst({ where: { id: parseInt(id), userId } })
  if (!cliente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.cliente.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
