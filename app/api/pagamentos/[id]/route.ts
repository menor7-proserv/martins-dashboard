import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const data: Record<string, unknown> = {}
  if (body.status !== undefined) data.status = body.status
  if (body.valor !== undefined) data.valor = body.valor
  if (body.vencimento !== undefined) data.vencimento = new Date(body.vencimento)
  if (body.prazo !== undefined) data.prazo = body.prazo
  const p = await prisma.pagamento.update({
    where: { id: parseInt(id) },
    data,
  })
  return NextResponse.json(p)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.pagamento.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
