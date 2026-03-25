'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClienteForm } from '@/components/forms/ClienteForm'
import { PagamentoForm } from '@/components/forms/PagamentoForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'

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
        <h1 className="text-2xl font-bold text-text-primary">Clientes & Obras</h1>
        <p className="text-text-muted text-sm">Gerencie obras e recebimentos por cliente</p>
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
                style={{ transition: 'background 0.2s' }}
                onClick={() => setExpanded(expanded === cliente.id ? null : cliente.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center text-neon-blue text-sm font-bold"
                    style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)' }}
                  >
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{cliente.nome}</div>
                    {cliente.telefone && <div className="text-xs text-text-muted">{cliente.telefone}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-neon-blue">{formatCurrency(totalObras)}</div>
                    {totalPendente > 0 && <div className="text-xs text-accent-orange">{formatCurrency(totalPendente)} pendente</div>}
                  </div>
                  <span className="text-text-muted">{expanded === cliente.id ? '▲' : '▼'}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deletarCliente(cliente.id) }}
                    className="text-xs"
                    style={{ color: 'rgba(255,77,109,0.5)', cursor: 'pointer', background: 'none', border: 'none' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#ff4d6d')}
                    onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,77,109,0.5)')}
                  >✕</button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === cliente.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                  >
                    <div className="p-4 space-y-4">
                      {cliente.obras.map((obra: any) => (
                        <div key={obra.id} className="rounded-lg p-3" style={{ background: '#1a1a24' }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-text-primary text-sm">{obra.descricao}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neon-blue">{formatCurrency(obra.valorTotal)}</span>
                              <NeonBadge label={obra.status} />
                            </div>
                          </div>
                          <div className="text-xs text-text-dim mb-3">{formatDate(obra.data)}</div>
                          <div className="space-y-1.5">
                            {obra.pagamentos.map((p: any) => (
                              <div key={p.id} className="flex items-center gap-2 text-xs">
                                <NeonBadge label={p.prazo} />
                                <NeonBadge label={p.status} />
                                <span className="text-text-muted">{formatCurrency(p.valor)}</span>
                                <span className="text-text-dim">venc. {formatDate(p.vencimento)}</span>
                                {p.status === 'PENDENTE' && (
                                  <button
                                    onClick={() => marcarRecebido(p.id)}
                                    className="ml-auto text-accent-green hover:underline"
                                    style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#00f5a0', fontSize: '0.75rem' }}
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
          <div className="glass-card p-10 text-center" style={{ color: '#4a5568' }}>
            Nenhum cliente cadastrado ainda. Adicione a primeira obra acima.
          </div>
        )}
      </div>
    </div>
  )
}
