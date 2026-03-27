'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { KpiCard } from '@/components/ui/KpiCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { ExportButton } from '@/components/ui/ExportButton'
import { formatCurrency } from '@/lib/formatters'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const PRAZO_ORDER = ['AVISTA', '7D', '30D', '60D', '90D']

export default function DashboardPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/dashboard?mes=${mes}&ano=${ano}`)
      .then(r => r.json())
      .then(setData)
  }, [mes, ano])

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <div className="neon-text animate-neon-pulse text-lg">Carregando...</div>
    </div>
  )

  const totalReceber = data.contasAReceber.reduce((s: number, c: any) => s + (c._sum.valor ?? 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard Financeiro</h1>
          <p className="text-text-muted text-sm">Martins Pro Serv · Esquadrias & Vidraçaria</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={`${mes}-${ano}`}
            onChange={e => {
              const [m, a] = e.target.value.split('-')
              setMes(+m)
              setAno(+a)
            }}
            className="input-field w-40 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1
              const a = now.getFullYear()
              return <option key={m} value={`${m}-${a}`}>{MESES[i]} {a}</option>
            })}
          </select>
          <ExportButton mes={mes} ano={ano} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Faturamento" value={data.faturamento} accentColor="#3b82f6" icon="💰" />
        <KpiCard label="Despesas" value={data.despesas} accentColor="#ef4444" icon="📉" />
        <KpiCard label="Lucro Líquido" value={data.lucro} accentColor={data.lucro >= 0 ? '#10b981' : '#ef4444'} icon="✅" />
        <KpiCard label="Margem" value={data.margem} format="percent" accentColor="#f59e0b" icon="📊" />
      </div>

      {/* Contas a Receber + Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest">📋 Contas a Receber</h2>
            <span className="text-neon-blue font-bold text-sm">{formatCurrency(totalReceber)}</span>
          </div>
          <div className="space-y-3">
            {PRAZO_ORDER.map(prazo => {
              const entry = data.contasAReceber.find((c: any) => c.prazo === prazo)
              const valor = entry?._sum?.valor ?? 0
              const pct = totalReceber > 0 ? (valor / totalReceber) * 100 : 0
              return (
                <div key={prazo} className="flex items-center gap-3">
                  <NeonBadge label={prazo} />
                  <div className="flex-1 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-blue to-accent-purple rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-10 text-right">{pct.toFixed(0)}%</span>
                  <span className="text-xs text-text-primary w-24 text-right">{formatCurrency(valor)}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">🎯 Metas de {MESES[mes-1]}</h2>
          {data.meta ? (
            <div className="space-y-5">
              <ProgressBar label="Faturamento" current={data.faturamento} target={data.meta.metaFaturamento} color="blue" />
              <ProgressBar label="Lucro Líquido" current={data.lucro} target={data.meta.metaLucro} color="green" />
            </div>
          ) : (
            <div className="text-center py-6">
              <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>Nenhuma meta definida para este mês.</p>
              <a href="/metas" className="text-neon-blue text-sm hover:underline mt-2 inline-block">Definir metas →</a>
            </div>
          )}
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">📈 Histórico 6 Meses</h2>
          <RevenueChart data={data.historico} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">💸 Despesas por Categoria</h2>
          {data.despesasPorCategoria.length > 0
            ? <ExpensePieChart data={data.despesasPorCategoria} />
            : <p style={{ color: '#4a5568', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Sem despesas no período</p>
          }
        </motion.div>
      </div>
    </div>
  )
}
