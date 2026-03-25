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
    const res = await fetch('/api/pagamentos')
    setPagamentos(await res.json())
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
          <h1 className="text-2xl font-bold text-text-primary">Contas a Receber</h1>
          <p className="text-text-muted text-sm">
            Pendente: <span className="text-neon-blue font-bold">{formatCurrency(totalPendente)}</span>
            {vencidos.length > 0 && <span className="text-accent-red ml-3">⚠ {vencidos.length} vencido(s)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {(['PENDENTE', 'RECEBIDO', ''] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                border: filtro === f ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)',
                color: filtro === f ? '#00b4d8' : '#8899aa',
                background: filtro === f ? 'rgba(0,180,216,0.1)' : 'transparent',
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
        if (items.length === 0) return null
        const subtotal = items.reduce((s, p) => s + p.valor, 0)
        return (
          <div key={prazo}>
            <div className="flex items-center gap-3 mb-2">
              <NeonBadge label={prazo} />
              <span className="text-xs text-text-muted">{items.length} pagamento(s)</span>
              <span className="text-xs font-bold text-text-primary ml-auto">{formatCurrency(subtotal)}</span>
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
                    style={vencido ? { borderColor: 'rgba(255,77,109,0.3)' } : {}}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary">{p.obra?.cliente?.nome}</div>
                      <div className="text-xs text-text-dim">{p.obra?.descricao}</div>
                    </div>
                    <span className="text-xs text-text-dim">venc. {formatDate(p.vencimento)}</span>
                    {vencido && <span className="text-xs text-accent-red font-bold">VENCIDO</span>}
                    <NeonBadge label={p.status} />
                    <span className="text-sm font-bold text-neon-blue">{formatCurrency(p.valor)}</span>
                    {p.status === 'PENDENTE' && (
                      <button onClick={() => marcar(p.id, 'RECEBIDO')} className="btn-primary text-xs" style={{ padding: '0.25rem 0.5rem' }}>✓ Recebido</button>
                    )}
                    {p.status === 'RECEBIDO' && (
                      <button
                        onClick={() => marcar(p.id, 'PENDENTE')}
                        style={{ fontSize: '0.75rem', color: '#8899aa', background: 'none', border: 'none', cursor: 'pointer' }}
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
        <div className="glass-card p-10 text-center" style={{ color: '#4a5568' }}>Nenhum pagamento encontrado</div>
      )}
    </div>
  )
}
