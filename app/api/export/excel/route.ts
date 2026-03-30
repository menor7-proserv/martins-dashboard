import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  const [obras, despesas, pagamentos] = await Promise.all([
    prisma.obra.findMany({ where: { data: { gte: inicio, lte: fim } }, include: { cliente: true } }),
    prisma.despesa.findMany({ where: { data: { gte: inicio, lte: fim } } }),
    prisma.pagamento.findMany({ where: { vencimento: { gte: inicio, lte: fim } }, include: { obra: { include: { cliente: true } } } }),
  ])

  const wb = XLSX.utils.book_new()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    (obras as any[]).map((o: any) => ({ Cliente: o.cliente.nome, Descrição: o.descricao, Valor: o.valorTotal, Data: o.data.toLocaleDateString('pt-BR'), Status: o.status }))
  ), 'Obras')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    (despesas as any[]).map((d: any) => ({ Categoria: d.categoria, Descrição: d.descricao, Valor: d.valor, Data: d.data.toLocaleDateString('pt-BR') }))
  ), 'Despesas')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    (pagamentos as any[]).map((p: any) => ({ Cliente: p.obra.cliente.nome, Obra: p.obra.descricao, Valor: p.valor, Prazo: p.prazo, Vencimento: p.vencimento.toLocaleDateString('pt-BR'), Status: p.status }))
  ), 'Pagamentos')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="martins-${ano}-${String(mes).padStart(2,'0')}.xlsx"`,
    },
  })
}
