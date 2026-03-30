import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, nome, empresa } = await req.json()

  if (!email || !password || !nome || !empresa) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { email, password: hash, nome, empresa },
  })

  return NextResponse.json({ ok: true })
}
