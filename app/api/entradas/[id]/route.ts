import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { id } = await params
  const entrada = await prisma.entradaAvulsa.findFirst({ where: { id: parseInt(id), userId } })
  if (!entrada) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.entradaAvulsa.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
