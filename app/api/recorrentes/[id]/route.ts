import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const found = await prisma.despesaRecorrente.findFirst({ where: { id: +id, userId: session.user.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const updated = await prisma.despesaRecorrente.update({
    where: { id: +id },
    data: { ativo: body.ativo !== undefined ? body.ativo : found.ativo },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const found = await prisma.despesaRecorrente.findFirst({ where: { id: +id, userId: session.user.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.despesaRecorrente.delete({ where: { id: +id } })
  return NextResponse.json({ ok: true })
}
