import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const despesa = await prisma.despesa.findFirst({ where: { id: parseInt(id), userId } })
  if (!despesa) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const updated = await prisma.despesa.update({
    where: { id: parseInt(id) },
    data: { categoria: body.categoria, descricao: body.descricao, valor: body.valor, data: new Date(body.data) },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const despesa = await prisma.despesa.findFirst({ where: { id: parseInt(id), userId } })
  if (!despesa) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.despesa.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
