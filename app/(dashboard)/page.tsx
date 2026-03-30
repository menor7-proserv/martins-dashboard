'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HeroKpiCard } from '@/components/ui/HeroKpiCard'
import { KpiCard } from '@/components/ui/KpiCard'
import { MiniGauge } from '@/components/ui/MiniGauge'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { ExportButton } from '@/components/ui/ExportButton'
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/formatters'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface ContaAReceber {
  prazo: string
  _sum: { valor: number | null }
}
interface DashboardData {
  faturamento: number
  despesas: number
  lucro: number
  margem: number
  contasAReceber: ContaAReceber[]
  historico: { mes: number; ano: number; faturamento: number; despesas: number }[]
  despesasPorCategoria: { categoria: string; _sum: { valor: number | null } }[]
  meta?: { metaFaturamento: number; metaLucro: number } | null
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const PRAZO_ORDER = ['AVISTA', '7D', '30D', '60D', '90D']
const cardVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const itemVariant  = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function DashboardPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setData(null); setError(false)
    fetch(`/api/dashboard?mes=${mes}&ano=${ano}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData).catch(() => setError(true))
  }, [mes, ano])

  const loading = !data && !error
  const totalReceber = data?.contasAReceber.reduce((s, c) => s + (c._sum.valor ?? 0), 0) ?? 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc', lineHeight: 1.2 }}>Dashboard Financeiro</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Martins Pro Serv · Esquadrias &amp; Vidraçaria</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={`${mes}-${ano}`}
            onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
            className="input-field" style={{ width: 160, fontSize: '0.85rem' }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={`${i+1}-${ano}`}>{MESES[i]} {ano}</option>
            ))}
          </select>
          <ExportButton mes={mes} ano={ano} />
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem' }}>
          Erro ao carregar dados. Verifique a conexão e tente novamente.
        </div>
      )}

      {/* ── Skeleton state ── */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <KpiSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div style={{ gridColumn: 'span 2' }}><ChartSkeleton height={220} /></div>
            <ChartSkeleton height={220} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton height={140} /><ChartSkeleton height={140} />
          </div>
        </motion.div>
      )}

      {/* ── Data state ── */}
      {!loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <HeroKpiCard value={data?.faturamento ?? 0} metaValue={data?.meta?.metaFaturamento} loading={false} />

          <motion.div variants={cardVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={itemVariant}>
              <KpiCard label="Despesas" value={data?.despesas ?? 0} accentColor="#8b5cf6" icon={<TrendingDown size={16} />} loading={false} />
            </motion.div>
            <motion.div variants={itemVariant}>
              <KpiCard label="Lucro Líquido" value={data?.lucro ?? 0} accentColor="#10b981" icon={<TrendingUp size={16} />} loading={false} />
            </motion.div>
            <motion.div variants={itemVariant}>
              <KpiCard label="Margem" value={data?.margem ?? 0} format="percent" accentColor="#3b82f6" loading={false} />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 lg:col-span-2">
              <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>Histórico 6 Meses</h2>
              <RevenueChart data={data?.historico ?? []} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
              <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>Despesas por Categoria</h2>
              <ExpensePieChart data={data?.despesasPorCategoria ?? []} />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card-hover p-5">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>Contas a Receber</h2>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(totalReceber)}</span>
              </div>
              {totalReceber === 0 ? (
                <p style={{ color: '#4a5568', fontSize: '0.8rem', textAlign: 'center', padding: '16px 0' }}>Nenhum valor pendente</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PRAZO_ORDER.map(prazo => {
                    const entry = data?.contasAReceber.find(c => c.prazo === prazo)
                    const valor = entry?._sum?.valor ?? 0
                    const pct = totalReceber > 0 ? (valor / totalReceber) * 100 : 0
                    if (valor === 0) return null
                    return (
                      <div key={prazo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <NeonBadge label={prazo} />
                        <div style={{ flex: 1, height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.3 }} style={{ height: '100%', background: '#f59e0b', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#8b949e', width: 30, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                        <span style={{ fontSize: '0.7rem', color: '#f0f6fc', width: 80, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(valor)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card-hover p-5">
              <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>Metas de {MESES[mes-1]}</h2>
              {data?.meta ? (
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16 }}>
                  <MiniGauge label="Faturamento" current={data.faturamento} target={data.meta.metaFaturamento} />
                  <MiniGauge label="Lucro Líquido" current={data.lucro} target={data.meta.metaLucro} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ color: '#4a5568', fontSize: '0.875rem', marginBottom: 8 }}>Nenhuma meta definida para este mês.</p>
                  <a href="/metas" style={{ color: '#f59e0b', fontSize: '0.875rem', textDecoration: 'none' }}>Definir metas →</a>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
