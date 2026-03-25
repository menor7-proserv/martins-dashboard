import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const d = await prisma.despesa.update({
    where: { id: parseInt(id) },
    data: { categoria: body.categoria, descricao: body.descricao, valor: body.valor, data: new Date(body.data) },
  })
  return NextResponse.json(d)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.despesa.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
