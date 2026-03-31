import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const fornecedores = await prisma.fornecedor.findMany({
    where: { userId: session.user.id },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(fornecedores)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const fornecedor = await prisma.fornecedor.create({
    data: { nome: body.nome, telefone: body.telefone ?? null, categoria: body.categoria ?? null, userId: session.user.id },
  })
  return NextResponse.json(fornecedor, { status: 201 })
}
