import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const obra = await prisma.obra.update({
    where: { id: parseInt(id) },
    data: {
      descricao: body.descricao,
      valorTotal: body.valorTotal,
      data: new Date(body.data),
      status: body.status,
    },
  })
  return NextResponse.json(obra)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.obra.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
