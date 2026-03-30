'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface DreMes {
  mes: number; ano: number; qtdObras: number
  receitaBruta: number; impostos: number; receitaLiquida: number
  material: number; maoDeObra: number; custoServicos: number
  lucroBruto: number; margemBruta: number
  transporte: number; despesasOp: number; lucroOp: number; margemOp: number
  lucroLiquido: number; margemLiquida: number
}
interface DreData { atual: DreMes; historico: DreMes[] }

function DreRow({ label, value, indent = false, bold = false, highlight, percent }: {
  label: string; value: number; indent?: boolean; bold?: boolean
  highlight?: 'green' | 'red' | 'amber' | 'purple'; percent?: number
}) {
  const neg = value < 0
  const color =
    highlight === 'green'  ? '#10b981' :
    highlight === 'red'    ? '#ef4444' :
    highlight === 'amber'  ? '#f59e0b' :
    highlight === 'purple' ? '#8b5cf6' :
    neg ? '#ef4444' : '#f0f6fc'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: bold ? '1px solid rgba(255,255,255,0.06)' : 'none', marginTop: bold ? 4 : 0 }}>
      <span style={{ fontSize: '0.875rem', paddingLeft: indent ? 24 : 0, color: bold ? '#f0f6fc' : '#8b949e', fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {percent !== undefined && (
          <span style={{
            fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4,
            background: percent >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${percent >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: percent >= 0 ? '#10b981' : '#ef4444',
          }}>
            {percent >= 0 ? '+' : ''}{percent.toFixed(1)}%
          </span>
        )}
        <span style={{ fontSize: bold ? '1rem' : '0.875rem', fontFamily: 'monospace', fontWeight: bold ? 700 : 400, color }}>
          {formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  )
}

function Section({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 mb-4">
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, color: accentColor }}>{title}</div>
      {children}
    </div>
  )
}

export default function DrePage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [data, setData] = useState<DreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dre?mes=${mes}&ano=${ano}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [mes, ano])

  const d = data?.atual
  const anterior = data?.historico[data.historico.length - 2]
  const anos = [now.getFullYear(), now.getFullYear() - 1]

  const variacao = (atual: number, prev: number | undefined) => {
    if (!prev || prev === 0) return null
    return ((atual - prev) / Math.abs(prev)) * 100
  }

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>DRE</h1>
          <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: 2 }}>Demonstrativo de Resultado do Exercício</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={mes} onChange={e => setMes(+e.target.value)} className="input-field" style={{ width: 128, fontSize: '0.875rem' }}>
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={ano} onChange={e => setAno(+e.target.value)} className="input-field" style={{ width: 96, fontSize: '0.875rem' }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading || !d ? (
        <div className="glass-card p-12 text-center animate-pulse" style={{ color: '#8b949e' }}>Carregando DRE...</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* KPIs rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Receita Bruta',  value: d.receitaBruta, prev: anterior?.receitaBruta, color: '#f59e0b',  suffix: `${d.qtdObras} obras` },
              { label: 'Lucro Bruto',    value: d.lucroBruto,   prev: anterior?.lucroBruto,   color: '#10b981',  suffix: `Margem ${formatPercent(d.margemBruta)}` },
              { label: 'Lucro Operac.', value: d.lucroOp,       prev: anterior?.lucroOp,      color: '#8b5cf6',  suffix: `Margem ${formatPercent(d.margemOp)}` },
              { label: 'Lucro Líquido', value: d.lucroLiquido,  prev: anterior?.lucroLiquido, color: d.lucroLiquido >= 0 ? '#10b981' : '#ef4444', suffix: `Margem ${formatPercent(d.margemLiquida)}` },
            ].map(k => {
              const v = variacao(k.value, k.prev)
              return (
              <div key={k.label} className="glass-card p-4">
                <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: k.color }}>{formatCurrency(k.value)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>{k.suffix}</span>
                  {v !== null && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                      background: v >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: v >= 0 ? '#10b981' : '#ef4444',
                      border: `1px solid ${v >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      {v >= 0 ? '+' : ''}{v.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            )})}

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Section title="Receita" accentColor="#f59e0b">
                <DreRow label="(+) Receita Bruta de Serviços" value={d.receitaBruta} />
                <DreRow label="(-) Impostos" value={-d.impostos} indent />
                <DreRow label="(=) Receita Líquida" value={d.receitaLiquida} bold highlight="amber" />
              </Section>

              <Section title="Custos dos Serviços" accentColor="#8b5cf6">
                <DreRow label="(-) Material" value={-d.material} indent />
                <DreRow label="(-) Mão de Obra" value={-d.maoDeObra} indent />
                <DreRow label="(=) Lucro Bruto" value={d.lucroBruto} bold highlight={d.lucroBruto >= 0 ? 'green' : 'red'} percent={d.margemBruta} />
              </Section>

              <Section title="Despesas Operacionais" accentColor="#fb923c">
                <DreRow label="(-) Transporte" value={-d.transporte} indent />
                <DreRow label="(=) Lucro Operacional" value={d.lucroOp} bold highlight={d.lucroOp >= 0 ? 'green' : 'red'} percent={d.margemOp} />
              </Section>

              <div className="glass-card p-5" style={{ borderColor: 'rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, color: '#f59e0b' }}>
                  Resultado Final
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#f0f6fc' }}>Lucro Líquido do Exercício</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 8px', borderRadius: 4, fontWeight: 700,
                      background: d.margemLiquida >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${d.margemLiquida >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: d.margemLiquida >= 0 ? '#10b981' : '#ef4444',
                    }}>
                      {d.margemLiquida >= 0 ? '+' : ''}{d.margemLiquida.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: d.lucroLiquido >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(d.lucroLiquido)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card p-4" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 12 }}>
                  Evolução 6 meses
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data?.historico.map(h => ({
                    name: `${MESES[h.mes-1]}/${String(h.ano).slice(2)}`,
                    'Receita': h.receitaBruta,
                    'Lucro Bruto': h.lucroBruto,
                    'Líquido': h.lucroLiquido,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: unknown) => formatCurrency(v as number)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Receita"     stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Lucro Bruto" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Líquido"     stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-4">
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 10 }}>
                  Histórico Mensal
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#4a5568', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 500 }}>Mês</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Receita</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>L. Bruto</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Líquido</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Mg%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.historico.map(h => (
                        <tr key={`${h.mes}-${h.ano}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <td style={{ padding: '6px 0', color: '#8b949e' }}>{MESES[h.mes-1]}/{h.ano}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: '#f59e0b' }}>{formatCurrency(h.receitaBruta)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: h.lucroBruto >= 0 ? '#8b5cf6' : '#ef4444' }}>{formatCurrency(h.lucroBruto)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: h.lucroLiquido >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(h.lucroLiquido)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: h.margemLiquida >= 0 ? '#10b981' : '#ef4444' }}>{h.margemLiquida.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
