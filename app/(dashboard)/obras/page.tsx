'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { HardHat, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react'

const STATUS_OPT = [
  { value: '', label: 'Todas' },
  { value: 'ABERTA', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluídas' },
  { value: 'CANCELADA', label: 'Canceladas' },
]

const STATUS_COLOR: Record<string, string> = {
  ABERTA: '#f59e0b', CONCLUIDA: '#10b981', CANCELADA: '#6b7280',
}

export default function ObrasPage() {
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [search, setSearch] = useState('')
  const [ordem, setOrdem] = useState<'data' | 'valor' | 'margem' | 'lucro'>('data')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/obras/relatorio${filtroStatus ? `?status=${filtroStatus}` : ''}`)
    if (res.ok) setDados(await res.json())
    setLoading(false)
  }, [filtroStatus])

  useEffect(() => { load() }, [load])

  const obras: any[] = (dados?.obras ?? [])
    .filter((o: any) =>
      o.descricao.toLowerCase().includes(search.toLowerCase()) ||
      o.cliente.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (ordem === 'valor')  return b.valorTotal - a.valorTotal
      if (ordem === 'margem') return b.margemBruta - a.margemBruta
      if (ordem === 'lucro')  return b.lucro - a.lucro
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Lucratividade por Obra</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Centro de custo · margem real por projeto</p>
      </div>

      {/* KPIs globais */}
      {!loading && dados && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Faturamento Total', value: dados.totalFaturamento, color: '#f59e0b', Icon: DollarSign },
            { label: 'Custo Total',       value: dados.totalCusto,       color: '#ef4444', Icon: TrendingDown },
            { label: 'Lucro Total',       value: dados.totalLucro,       color: '#10b981', Icon: TrendingUp },
            { label: 'Margem Média',      value: null, pct: dados.margemMedia, color: dados.margemMedia >= 0 ? '#8b5cf6' : '#ef4444', Icon: HardHat },
          ].map(k => (
            <div key={k.label} className="glass-card p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <k.Icon size={13} color={k.color} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>{k.label}</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: k.color }}>
                {k.value !== null ? formatCurrency(k.value) : `${k.pct!.toFixed(1)}%`}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar obra ou cliente…"
            className="input-field" style={{ paddingLeft: 32, fontSize: '0.85rem', width: '100%' }} />
        </div>
        {STATUS_OPT.map(s => (
          <button key={s.value} onClick={() => setFiltroStatus(s.value)}
            style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: '1px solid',
              background: filtroStatus === s.value ? 'rgba(245,158,11,0.1)' : 'transparent',
              borderColor: filtroStatus === s.value ? 'rgba(245,158,11,0.4)' : '#30363d',
              color: filtroStatus === s.value ? '#f59e0b' : '#4a5568',
            }}>
            {s.label}
          </button>
        ))}
        <select value={ordem} onChange={e => setOrdem(e.target.value as any)} className="input-field" style={{ width: 140, fontSize: '0.8rem' }}>
          <option value="data">Mais recentes</option>
          <option value="valor">Maior valor</option>
          <option value="lucro">Maior lucro</option>
          <option value="margem">Maior margem</option>
        </select>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#4a5568', fontSize: '0.875rem' }}>Carregando...</div>
      ) : obras.length === 0 ? (
        <EmptyState icon={<HardHat size={22} />} title="Nenhuma obra encontrada" description="Cadastre obras para ver o relatório de lucratividade." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px 70px 70px', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid #30363d' }}>
            {['Obra / Cliente', 'Data', 'Faturamento', 'Custo', 'Lucro', 'Margem', 'Status'].map(h => (
              <div key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5568' }}>{h}</div>
            ))}
          </div>
          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {obras.map((o: any, i: number) => {
              const statusColor = STATUS_COLOR[o.status] ?? '#6b7280'
              const margemColor = o.margemBruta >= 30 ? '#10b981' : o.margemBruta >= 10 ? '#f59e0b' : '#ef4444'
              const pct = o.valorTotal > 0 ? Math.min(100, (o.recebido / o.valorTotal) * 100) : 0
              return (
                <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px 70px 70px', gap: 8, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.descricao}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: 1 }}>{o.cliente}</div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 6, height: 3, background: '#30363d', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#f59e0b', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#4a5568', marginTop: 2 }}>{pct.toFixed(0)}% recebido</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>{formatDate(o.data)}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(o.valorTotal)}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: o.custoTotal > 0 ? '#ef4444' : '#4a5568' }}>
                    {o.custoTotal > 0 ? formatCurrency(o.custoTotal) : '—'}
                    {o.qtdDespesas > 0 && <div style={{ fontSize: '0.65rem', color: '#4a5568' }}>{o.qtdDespesas} lançto(s)</div>}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: o.lucro >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(o.lucro)}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: margemColor }}>{o.margemBruta.toFixed(1)}%</div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
                      {o.status}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
