'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'

const PRAZO_ORDER = ['AVISTA', '7D', '30D', '60D', '90D']

export default function ReceberPage() {
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [filtro, setFiltro] = useState<'PENDENTE' | 'RECEBIDO' | ''>('PENDENTE')

  const load = useCallback(async () => {
    setPagamentos(await (await fetch('/api/pagamentos')).json())
  }, [])

  useEffect(() => { load() }, [load])

  const marcar = async (id: number, status: string) => {
    await fetch(`/api/pagamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const hoje = new Date()
  const filtrados = pagamentos.filter(p => filtro ? p.status === filtro : true)
  const totalPendente = pagamentos.filter(p => p.status === 'PENDENTE').reduce((s, p) => s + p.valor, 0)
  const vencidos = pagamentos.filter(p => p.status === 'PENDENTE' && new Date(p.vencimento) < hoje)

  const porPrazo = PRAZO_ORDER.reduce((acc, prazo) => {
    acc[prazo] = filtrados.filter(p => p.prazo === prazo)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Contas a Receber</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>
            Pendente: <span style={{ color: '#f59e0b', fontWeight: 800 }}>{formatCurrency(totalPendente)}</span>
            {vencidos.length > 0 && (
              <span style={{ color: '#ef4444', marginLeft: 12, fontWeight: 600 }}>
                ⚠ {vencidos.length} vencido(s)
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['PENDENTE', 'RECEBIDO', ''] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                borderRadius: 6,
                border: filtro === f ? '1px solid rgba(245,158,11,0.6)' : '1px solid #30363d',
                color: filtro === f ? '#f59e0b' : '#8b949e',
                background: filtro === f ? 'rgba(245,158,11,0.1)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {f || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {PRAZO_ORDER.map(prazo => {
        const items = porPrazo[prazo]
        if (!items || items.length === 0) return null
        const subtotal = items.reduce((s, p) => s + p.valor, 0)
        return (
          <div key={prazo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <NeonBadge label={prazo} />
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{items.length} pagamento(s)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f0f6fc', marginLeft: 'auto' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="space-y-2">
              {items.map((p, i) => {
                const vencido = p.status === 'PENDENTE' && new Date(p.vencimento) < hoje
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card px-4 py-3 flex items-center gap-3"
                    style={vencido ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc' }}>{p.obra?.cliente?.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{p.obra?.descricao}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>venc. {formatDate(p.vencimento)}</span>
                    {vencido && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>VENCIDO</span>}
                    <NeonBadge label={p.status} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(p.valor)}</span>
                    {p.status === 'PENDENTE' && (
                      <button onClick={() => marcar(p.id, 'RECEBIDO')} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                        ✓ Recebido
                      </button>
                    )}
                    {p.status === 'RECEBIDO' && (
                      <button
                        onClick={() => marcar(p.id, 'PENDENTE')}
                        style={{ fontSize: '0.75rem', color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer' }}
                      >↩</button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
      {filtrados.length === 0 && (
        <div className="glass-card p-10 text-center" style={{ color: '#4a5568', fontSize: '0.875rem' }}>
          Nenhum pagamento encontrado
        </div>
      )}
    </div>
  )
}
