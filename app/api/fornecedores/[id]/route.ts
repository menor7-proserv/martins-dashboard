import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const found = await prisma.fornecedor.findFirst({ where: { id: +id, userId: session.user.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const updated = await prisma.fornecedor.update({
    where: { id: +id },
    data: { nome: body.nome, telefone: body.telefone ?? null, categoria: body.categoria ?? null },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const found = await prisma.fornecedor.findFirst({ where: { id: +id, userId: session.user.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.fornecedor.delete({ where: { id: +id } })
  return NextResponse.json({ ok: true })
}
