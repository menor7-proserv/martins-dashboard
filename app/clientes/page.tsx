'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClienteForm } from '@/components/forms/ClienteForm'
import { PagamentoForm } from '@/components/forms/PagamentoForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/clientes')
    setClientes(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const marcarRecebido = async (pagId: number) => {
    await fetch(`/api/pagamentos/${pagId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEBIDO' }),
    })
    load()
  }

  const deletarCliente = async (id: number) => {
    if (!confirm('Remover cliente e todas as obras?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Clientes &amp; Obras</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Gerencie obras e recebimentos por cliente</p>
      </div>

      <ClienteForm onSuccess={load} />

      <div className="space-y-3">
        {clientes.map((cliente, i) => {
          const totalObras = cliente.obras.reduce((s: number, o: any) => s + o.valorTotal, 0)
          const totalPendente = cliente.obras.flatMap((o: any) => o.pagamentos)
            .filter((p: any) => p.status === 'PENDENTE')
            .reduce((s: number, p: any) => s + p.valor, 0)

          return (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => setExpanded(expanded === cliente.id ? null : cliente.id)}
              >
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b',
                  }}>
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>{cliente.nome}</div>
                    {cliente.telefone && <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{cliente.telefone}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(totalObras)}</div>
                    {totalPendente > 0 && <div style={{ fontSize: '0.75rem', color: '#fb923c' }}>{formatCurrency(totalPendente)} pendente</div>}
                  </div>
                  {expanded === cliente.id ? <ChevronUp size={16} color="#8b949e" /> : <ChevronDown size={16} color="#8b949e" />}
                  <button
                    onClick={e => { e.stopPropagation(); deletarCliente(cliente.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.5)')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === cliente.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: '1px solid #30363d', overflow: 'hidden' }}
                  >
                    <div className="p-4 space-y-4">
                      {cliente.obras.map((obra: any) => (
                        <div key={obra.id} style={{ background: '#1f2937', borderRadius: 8, padding: 12 }}>
                          <div className="flex items-center justify-between mb-2">
                            <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.875rem' }}>{obra.descricao}</div>
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(obra.valorTotal)}</span>
                              <NeonBadge label={obra.status} />
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#4a5568', marginBottom: 8 }}>{formatDate(obra.data)}</div>
                          <div className="space-y-1.5">
                            {obra.pagamentos.map((p: any) => (
                              <div key={p.id} className="flex items-center gap-2 text-xs">
                                <NeonBadge label={p.prazo} />
                                <NeonBadge label={p.status} />
                                <span style={{ color: '#8b949e' }}>{formatCurrency(p.valor)}</span>
                                <span style={{ color: '#4a5568' }}>venc. {formatDate(p.vencimento)}</span>
                                {p.status === 'PENDENTE' && (
                                  <button
                                    onClick={() => marcarRecebido(p.id)}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#10b981', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                                  >✓ Recebido</button>
                                )}
                              </div>
                            ))}
                          </div>
                          <PagamentoForm obraId={obra.id} onSuccess={load} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
        {clientes.length === 0 && (
          <div className="glass-card p-10 text-center" style={{ color: '#4a5568', fontSize: '0.875rem' }}>
            Nenhum cliente cadastrado ainda. Adicione a primeira obra acima.
          </div>
        )}
      </div>
    </div>
  )
}
