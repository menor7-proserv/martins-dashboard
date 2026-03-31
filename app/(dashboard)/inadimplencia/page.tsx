'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { CheckCircle, AlertTriangle, Users } from 'lucide-react'

const FAIXAS = [
  { key: '1-15',  label: '1 – 15 dias',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
  { key: '16-30', label: '16 – 30 dias', color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)' },
  { key: '31-60', label: '31 – 60 dias', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
  { key: '60+',   label: '60+ dias',     color: '#dc2626', bg: 'rgba(220,38,38,0.12)',  border: 'rgba(220,38,38,0.4)' },
]

export default function InadimplenciaPage() {
  const { success, error: toastError } = useToast()
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtroFaixa, setFiltroFaixa] = useState('')
  const [marcando, setMarcando] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/inadimplencia')
    if (res.ok) setDados(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const marcarRecebido = async (id: number) => {
    setMarcando(id)
    try {
      const res = await fetch(`/api/pagamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RECEBIDO' }),
      })
      if (!res.ok) throw new Error()
      await load()
      success('Pagamento recebido', 'Removido da lista de inadimplência')
    } catch {
      toastError('Erro ao atualizar', 'Tente novamente')
    } finally {
      setMarcando(null)
    }
  }

  const itens = (dados?.items ?? []).filter((i: any) => filtroFaixa ? i.faixa === filtroFaixa : true)

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Relatório de Inadimplência</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Pagamentos vencidos e não recebidos</p>
      </div>

      {!loading && dados && (
        <>
          {/* KPIs por faixa */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FAIXAS.map(f => (
              <button key={f.key} onClick={() => setFiltroFaixa(filtroFaixa === f.key ? '' : f.key)}
                style={{
                  textAlign: 'left', padding: 16, borderRadius: 10, cursor: 'pointer',
                  background: filtroFaixa === f.key ? f.bg : 'rgba(22,27,34,0.9)',
                  border: `1px solid ${filtroFaixa === f.key ? f.border : '#30363d'}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: f.color, marginBottom: 6 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f6fc' }}>
                  {formatCurrency(dados.faixas[f.key] ?? 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 3 }}>
                  {(dados.items as any[]).filter(i => i.faixa === f.key).length} pagamento(s)
                </div>
              </button>
            ))}
          </motion.div>

          {/* Total */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} color="#ef4444" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>Total Inadimplente</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{dados.totalClientes} cliente(s) com atraso</div>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>{formatCurrency(dados.totalInadimplente)}</div>
          </motion.div>

          {/* Filtro ativo */}
          {filtroFaixa && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Filtrando por:</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 5, padding: '2px 8px' }}>
                {FAIXAS.find(f => f.key === filtroFaixa)?.label}
              </span>
              <button onClick={() => setFiltroFaixa('')} style={{ fontSize: '0.75rem', color: '#4a5568', background: 'none', border: 'none', cursor: 'pointer' }}>✕ limpar</button>
            </div>
          )}

          {/* Tabela */}
          {itens.length === 0 ? (
            <EmptyState icon={<Users size={22} />} title="Nenhuma inadimplência" description="Todos os pagamentos estão em dia." />
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 90px 90px 120px', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid #30363d' }}>
                {['Cliente', 'Obra', 'Vencimento', 'Atraso', 'Valor', ''].map(h => (
                  <div key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5568' }}>{h}</div>
                ))}
              </div>

              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {itens.map((item: any, i: number) => {
                  const faixa = FAIXAS.find(f => f.key === item.faixa)
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 90px 90px 120px', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f6fc' }}>{item.cliente}</div>
                        {item.telefone && <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>{item.telefone}</div>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.obra}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>{formatDate(item.vencimento)}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: faixa?.bg, border: `1px solid ${faixa?.border}`, color: faixa?.color, textAlign: 'center' }}>
                        {item.diasAtraso}d
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(item.valor)}</div>
                      <button
                        onClick={() => marcarRecebido(item.id)}
                        disabled={marcando === item.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.18)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)' }}
                      >
                        <CheckCircle size={12} />
                        {marcando === item.id ? 'Salvando…' : 'Recebido'}
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>Carregando...</p>
        </div>
      )}
    </div>
  )
}
