'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { ArrowLeft, Phone, Building2, CheckCircle2, Clock, XCircle } from 'lucide-react'

const STATUS_OBRA: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  ABERTA:    { label: 'Em andamento', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   Icon: Clock },
  CONCLUIDA: { label: 'Concluída',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',   Icon: CheckCircle2 },
  CANCELADA: { label: 'Cancelada',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)', Icon: XCircle },
}

export default function ClienteHistoricoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clientes/${id}/historico`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDados(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>Carregando...</p>
    </div>
  )
  if (!dados) return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ color: '#ef4444' }}>Cliente não encontrado.</p>
      <Link href="/clientes" style={{ color: '#f59e0b', fontSize: '0.875rem' }}>← Voltar</Link>
    </div>
  )

  const { cliente, totalObras, totalRecebido, totalPendente } = dados

  return (
    <div className="space-y-5 animate-fade-in" style={{ maxWidth: 860 }}>
      {/* Back */}
      <Link href="/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8b949e', fontSize: '0.8rem', textDecoration: 'none', marginBottom: 4 }}>
        <ArrowLeft size={14} /> Voltar para Clientes
      </Link>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b',
          }}>
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f6fc' }}>{cliente.nome}</h1>
            {cliente.telefone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: '#8b949e', fontSize: '0.85rem' }}>
                <Phone size={13} /> {cliente.telefone}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: '#4a5568', fontSize: '0.75rem' }}>
              <Building2 size={12} /> {cliente.obras.length} obra(s) cadastrada(s)
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total contratado</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>{formatCurrency(totalObras)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recebido</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(totalRecebido)}</div>
            </div>
            {totalPendente > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pendente</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb923c' }}>{formatCurrency(totalPendente)}</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Obras timeline */}
      {cliente.obras.length === 0 ? (
        <div className="glass-card p-8" style={{ textAlign: 'center' }}>
          <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>Nenhuma obra cadastrada para este cliente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cliente.obras.map((obra: any, idx: number) => {
            const status = STATUS_OBRA[obra.status] ?? STATUS_OBRA['ABERTA']
            const StatusIcon = status.Icon
            const recebido = obra.pagamentos.filter((p: any) => p.status === 'RECEBIDO').reduce((s: number, p: any) => s + p.valor, 0)
            const pendente = obra.pagamentos.filter((p: any) => p.status === 'PENDENTE').reduce((s: number, p: any) => s + p.valor, 0)
            const pct = obra.valorTotal > 0 ? Math.min(100, (recebido / obra.valorTotal) * 100) : 0

            return (
              <motion.div key={obra.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                className="glass-card overflow-hidden"
              >
                {/* Obra header */}
                <div style={{ padding: '14px 18px', borderBottom: obra.pagamentos.length > 0 ? '1px solid #30363d' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a5568' }}>Obra #{obra.id}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: status.bg, color: status.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StatusIcon size={10} /> {status.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f6fc' }}>{obra.descricao}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 2 }}>{formatDate(obra.data)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>{formatCurrency(obra.valorTotal)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 2 }}>{obra.pagamentos.length} parcela(s)</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {obra.valorTotal > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Recebido: {formatCurrency(recebido)}</span>
                        {pendente > 0 && <span style={{ fontSize: '0.7rem', color: '#fb923c' }}>Pendente: {formatCurrency(pendente)}</span>}
                        <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + idx * 0.06 }}
                          style={{ height: '100%', background: pct >= 100 ? '#10b981' : '#f59e0b', borderRadius: 2 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagamentos */}
                {obra.pagamentos.length > 0 && (
                  <div style={{ padding: '10px 18px 14px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5568', marginBottom: 8 }}>
                      Parcelas
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {obra.pagamentos.map((p: any, pi: number) => {
                        const vencida = p.status === 'PENDENTE' && new Date(p.vencimento) < new Date()
                        return (
                          <div key={p.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 10px', borderRadius: 6,
                            background: p.status === 'RECEBIDO' ? 'rgba(16,185,129,0.05)' : vencida ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${p.status === 'RECEBIDO' ? 'rgba(16,185,129,0.15)' : vencida ? 'rgba(239,68,68,0.15)' : '#30363d'}`,
                          }}>
                            <span style={{ fontSize: '0.75rem', color: '#4a5568', minWidth: 18, textAlign: 'right' }}>{pi+1}.</span>
                            <NeonBadge label={p.prazo} />
                            <span style={{ flex: 1, fontSize: '0.8rem', color: '#8b949e' }}>venc. {formatDate(p.vencimento)}</span>
                            {vencida && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4 }}>VENCIDA</span>
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: p.status === 'RECEBIDO' ? '#10b981' : vencida ? '#ef4444' : '#f59e0b' }}>
                              {formatCurrency(p.valor)}
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                              background: p.status === 'RECEBIDO' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: p.status === 'RECEBIDO' ? '#10b981' : '#f59e0b',
                            }}>
                              {p.status === 'RECEBIDO' ? 'Recebido' : 'Pendente'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
