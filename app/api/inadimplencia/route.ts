import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const hoje = new Date()

  const pagamentos = await prisma.pagamento.findMany({
    where: {
      status: 'PENDENTE',
      vencimento: { lt: hoje },
      obra: { cliente: { userId } },
    },
    include: { obra: { include: { cliente: true } } },
    orderBy: { vencimento: 'asc' },
  })

  const faixas = { '1-15': 0, '16-30': 0, '31-60': 0, '60+': 0 }

  const items = pagamentos.map(p => {
    const diasAtraso = Math.floor((hoje.getTime() - new Date(p.vencimento).getTime()) / (1000 * 60 * 60 * 24))
    let faixa: string
    if (diasAtraso <= 15) { faixa = '1-15'; faixas['1-15'] += p.valor }
    else if (diasAtraso <= 30) { faixa = '16-30'; faixas['16-30'] += p.valor }
    else if (diasAtraso <= 60) { faixa = '31-60'; faixas['31-60'] += p.valor }
    else { faixa = '60+'; faixas['60+'] += p.valor }
    return {
      id: p.id,
      valor: p.valor,
      vencimento: p.vencimento,
      diasAtraso,
      faixa,
      cliente: p.obra.cliente.nome,
      clienteId: p.obra.clienteId,
      telefone: p.obra.cliente.telefone,
      obra: p.obra.descricao,
      prazo: p.prazo,
    }
  })

  const totalInadimplente = pagamentos.reduce((s, p) => s + p.valor, 0)
  const totalClientes = new Set(pagamentos.map(p => p.obra.clienteId)).size

  return NextResponse.json({ items, faixas, totalInadimplente, totalClientes })
}
