import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await request.json()

  const data: Record<string, string> = {}
  if (body.nome) data.nome = body.nome
  if (body.empresa) data.empresa = body.empresa

  if (body.novaSenha) {
    if (!body.senhaAtual) return NextResponse.json({ error: 'Senha atual obrigatória' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.password) return NextResponse.json({ error: 'Erro' }, { status: 400 })
    const ok = await bcrypt.compare(body.senhaAtual, user.password)
    if (!ok) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    data.password = await bcrypt.hash(body.novaSenha, 12)
  }

  const updated = await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ nome: updated.nome, empresa: updated.empresa })
}
