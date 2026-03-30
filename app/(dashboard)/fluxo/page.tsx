'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const tooltipStyle = {
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: 8,
  fontSize: '0.75rem',
  color: '#f0f6fc',
}

export default function FluxoPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/fluxo?mes=${mes}&ano=${ano}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [mes, ano])

  useEffect(() => { load() }, [load])

  // Filtra só dias com movimento para o gráfico de barras
  const diasComMovimento = (data?.dias ?? []).filter((d: any) => d.entradas > 0 || d.saidas > 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Fluxo de Caixa</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Entradas, saídas e projeção de recebimentos</p>
        </div>
        <select
          value={`${mes}-${ano}`}
          onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
          className="input-field"
          style={{ width: 160, fontSize: '0.85rem' }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={`${i+1}-${ano}`}>{MESES[i]} {ano}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      {!loading && data && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="glass-card p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TrendingUp size={14} color="#10b981" />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>Entradas</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(data.totalEntradas)}</div>
              <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 2 }}>Recebido no mês</div>
            </div>

            <div className="glass-card p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TrendingDown size={14} color="#ef4444" />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>Saídas</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(data.totalSaidas)}</div>
              <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 2 }}>Despesas no mês</div>
            </div>

            <div className="glass-card p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wallet size={14} color={data.saldo >= 0 ? '#f59e0b' : '#ef4444'} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>Saldo</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: data.saldo >= 0 ? '#f59e0b' : '#ef4444' }}>{formatCurrency(data.saldo)}</div>
              <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 2 }}>Resultado do mês</div>
            </div>

            <div className="glass-card p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={14} color="#f59e0b" />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>A Receber</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(data.totalPendente)}</div>
              <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 2 }}>Total pendente</div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de barras — entradas x saídas por dia */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>
                Entradas x Saídas — {MESES[mes-1]}
              </h2>
              {diasComMovimento.length === 0 ? (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#4a5568', fontSize: '0.8rem' }}>Sem movimentação no período</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={diasComMovimento} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} labelFormatter={l => `Dia ${l}`} />
                    <Bar dataKey="entradas" fill="#10b981" radius={[3,3,0,0]} name="Entradas" />
                    <Bar dataKey="saidas" fill="#ef4444" radius={[3,3,0,0]} name="Saídas" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Gráfico de linha — saldo acumulado */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
              <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>
                Saldo Acumulado — {MESES[mes-1]}
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.dias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} labelFormatter={l => `Dia ${l}`} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                  <Line type="monotone" dataKey="acumulado" stroke="#f59e0b" strokeWidth={2} dot={false} name="Saldo acumulado" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Projeção — pagamentos pendentes */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>
                Projeção — Recebimentos Pendentes
              </h2>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(data.totalPendente)}</span>
            </div>

            {data.pendentes.length === 0 ? (
              <EmptyState
                icon={<Wallet size={20} />}
                title="Nenhum recebimento pendente"
                description="Todos os pagamentos foram recebidos."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.pendentes.slice(0, 15).map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: p.vencido ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${p.vencido ? 'rgba(239,68,68,0.2)' : '#30363d'}`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f6fc' }}>{p.cliente}</div>
                      <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>{p.obra}</div>
                    </div>
                    <NeonBadge label={p.prazo} />
                    <span style={{ fontSize: '0.75rem', color: p.vencido ? '#ef4444' : '#8b949e' }}>
                      venc. {formatDate(p.vencimento)}
                    </span>
                    {p.vencido && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        VENCIDO
                      </span>
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b', minWidth: 90, textAlign: 'right' }}>
                      {formatCurrency(p.valor)}
                    </span>
                  </motion.div>
                ))}
                {data.pendentes.length > 15 && (
                  <p style={{ fontSize: '0.75rem', color: '#4a5568', textAlign: 'center', padding: '8px 0' }}>
                    + {data.pendentes.length - 15} pagamentos — veja em <a href="/receber" style={{ color: '#f59e0b' }}>Contas a Receber</a>
                  </p>
                )}
              </div>
            )}
          </motion.div>
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
