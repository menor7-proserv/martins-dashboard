import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const clientes = await prisma.cliente.findMany({
    include: { obras: { include: { pagamentos: true } } },
    orderBy: { criadoEm: 'desc' },
  })
  return NextResponse.json(clientes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const cliente = await prisma.cliente.create({
    data: { nome: body.nome, telefone: body.telefone ?? null },
  })
  return NextResponse.json(cliente, { status: 201 })
}
