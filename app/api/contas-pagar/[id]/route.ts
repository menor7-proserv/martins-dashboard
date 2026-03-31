import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const found = await prisma.contaPagar.findFirst({ where: { id: +id, userId: session.user.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const updated = await prisma.contaPagar.update({
    where: { id: +id },
    data: {
      status: body.status ?? found.status,
      descricao: body.descricao ?? found.descricao,
      valor: body.valor !== undefined ? parseFloat(body.valor) : found.valor,
      vencimento: body.vencimento ? new Date(body.vencimento) : found.vencimento,
      fornecedorId: body.fornecedorId !== undefined ? (body.fornecedorId ? +body.fornecedorId : null) : found.fornecedorId,
      obraId: body.obraId !== undefined ? (body.obraId ? +body.obraId : null) : found.obraId,
    },
    include: { fornecedor: { select: { id: true, nome: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const found = await prisma.contaPagar.findFirst({ where: { id: +id, userId: session.user.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.contaPagar.delete({ where: { id: +id } })
  return NextResponse.json({ ok: true })
}
