import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  const [obras, despesas] = await Promise.all([
    prisma.obra.findMany({ where: { data: { gte: inicio, lte: fim } }, include: { cliente: true } }),
    prisma.despesa.findMany({ where: { data: { gte: inicio, lte: fim } } }),
  ])

  const totalFaturamento = obras.reduce((s, o) => s + o.valorTotal, 0)
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0)
  const lucro = totalFaturamento - totalDespesas

  const doc = new jsPDF()
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  doc.setFillColor(10, 10, 15)
  doc.rect(0, 0, 210, 297, 'F')
  doc.setTextColor(0, 180, 216)
  doc.setFontSize(20)
  doc.text('Martins Pro Serv', 20, 25)
  doc.setTextColor(240, 244, 248)
  doc.setFontSize(12)
  doc.text(`Relatório Financeiro — ${meses[mes-1]}/${ano}`, 20, 35)
  doc.setFontSize(11)
  doc.setTextColor(136, 153, 170)
  doc.text('RESUMO', 20, 55)
  doc.setTextColor(240, 244, 248)
  doc.text(`Faturamento: ${fmt(totalFaturamento)}`, 20, 65)
  doc.text(`Despesas:    ${fmt(totalDespesas)}`, 20, 73)
  doc.setTextColor(lucro >= 0 ? 0 : 255, lucro >= 0 ? 245 : 77, lucro >= 0 ? 160 : 109)
  doc.text(`Lucro:       ${fmt(lucro)}`, 20, 81)

  let y = 100
  doc.setTextColor(136, 153, 170)
  doc.setFontSize(10)
  doc.text('OBRAS', 20, y); y += 10
  obras.forEach(o => {
    doc.setTextColor(240, 244, 248)
    doc.text(`${o.cliente.nome} — ${o.descricao}`, 20, y)
    doc.text(fmt(o.valorTotal), 160, y)
    y += 8
    if (y > 270) { doc.addPage(); y = 20 }
  })

  y += 5
  doc.setTextColor(136, 153, 170)
  doc.text('DESPESAS', 20, y); y += 10
  despesas.forEach(d => {
    doc.setTextColor(240, 244, 248)
    doc.text(`[${d.categoria}] ${d.descricao}`, 20, y)
    doc.text(fmt(d.valor), 160, y)
    y += 8
    if (y > 270) { doc.addPage(); y = 20 }
  })

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="martins-${ano}-${String(mes).padStart(2,'0')}.pdf"`,
    },
  })
}
