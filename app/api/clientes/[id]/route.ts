import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const cliente = await prisma.cliente.update({
    where: { id: parseInt(id) },
    data: { nome: body.nome, telefone: body.telefone },
  })
  return NextResponse.json(cliente)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.cliente.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
