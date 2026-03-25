import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const clientes = [
    { nome: 'João Silva', telefone: '(11) 98765-4321' },
    { nome: 'Maria Construtora', telefone: '(11) 3333-4444' },
    { nome: 'Carlos Residencial', telefone: '(11) 97777-8888' },
  ]

  for (const c of clientes) {
    const cliente = await prisma.cliente.create({ data: c })
    const obra = await prisma.obra.create({
      data: {
        clienteId: cliente.id,
        descricao: 'Box de vidro temperado 8mm',
        valorTotal: 4500 + Math.random() * 8000,
        data: new Date(),
        status: 'ABERTA',
      },
    })
    await prisma.pagamento.create({
      data: {
        obraId: obra.id,
        valor: obra.valorTotal * 0.5,
        prazo: '30D',
        vencimento: new Date(Date.now() + 30 * 86400000),
        status: 'PENDENTE',
      },
    })
    await prisma.pagamento.create({
      data: {
        obraId: obra.id,
        valor: obra.valorTotal * 0.5,
        prazo: '60D',
        vencimento: new Date(Date.now() + 60 * 86400000),
        status: 'PENDENTE',
      },
    })
  }

  const categorias = ['MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'IMPOSTOS']
  for (const cat of categorias) {
    await prisma.despesa.create({
      data: {
        categoria: cat,
        descricao: `Despesa de ${cat.toLowerCase().replace(/_/g, ' ')}`,
        valor: 500 + Math.random() * 2000,
        data: new Date(),
      },
    })
  }

  const now = new Date()
  await prisma.meta.upsert({
    where: { mes_ano: { mes: now.getMonth() + 1, ano: now.getFullYear() } },
    update: {},
    create: {
      mes: now.getMonth() + 1,
      ano: now.getFullYear(),
      metaFaturamento: 50000,
      metaLucro: 20000,
    },
  })

  console.log('✓ Seed concluído')
}

main().catch(console.error).finally(() => prisma.$disconnect())
