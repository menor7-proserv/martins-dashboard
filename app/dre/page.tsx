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

function DreRow({
  label, value, indent = false, bold = false, highlight, percent,
}: {
  label: string; value: number; indent?: boolean; bold?: boolean
  highlight?: 'green' | 'red' | 'blue' | 'gold'; percent?: number
}) {
  const neg = value < 0
  const colorClass =
    highlight === 'green' ? 'text-accent-green' :
    highlight === 'red'   ? 'text-accent-red'   :
    highlight === 'blue'  ? 'text-neon-blue'     :
    highlight === 'gold'  ? 'text-accent-gold'   :
    neg ? 'text-accent-red' : 'text-text-primary'

  return (
    <div className={`flex items-center justify-between py-2 ${bold ? 'border-t border-white/10 mt-1' : ''}`}>
      <span className={`text-sm ${indent ? 'pl-6 text-text-muted' : bold ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        {percent !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded border ${
            percent >= 0
              ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
              : 'bg-accent-red/10 text-accent-red border-accent-red/20'
          }`}>
            {percent >= 0 ? '+' : ''}{percent.toFixed(1)}%
          </span>
        )}
        <span className={`text-sm font-mono ${bold ? 'text-base font-bold' : ''} ${colorClass}`}>
          {neg ? '' : ''}{formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 mb-4">
      <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${color}`}>{title}</div>
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
  const anos = [now.getFullYear(), now.getFullYear() - 1]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">DRE</h1>
          <p className="text-sm text-text-muted mt-0.5">Demonstrativo de Resultado do Exercício</p>
        </div>
        <div className="flex gap-2">
          <select
            value={mes}
            onChange={e => setMes(+e.target.value)}
            className="input-field w-32 text-sm"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={e => setAno(+e.target.value)}
            className="input-field w-24 text-sm"
          >
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading || !d ? (
        <div className="glass-card p-12 text-center text-text-muted animate-pulse">Carregando DRE...</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* KPIs rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Receita Bruta',   value: d.receitaBruta,  color: 'text-neon-blue',     suffix: `${d.qtdObras} obras` },
              { label: 'Lucro Bruto',     value: d.lucroBruto,    color: 'text-accent-green',  suffix: `Margem ${formatPercent(d.margemBruta)}` },
              { label: 'Lucro Operac.',   value: d.lucroOp,       color: 'text-accent-purple', suffix: `Margem ${formatPercent(d.margemOp)}` },
              { label: 'Lucro Líquido',   value: d.lucroLiquido,  color: d.lucroLiquido >= 0 ? 'text-accent-green' : 'text-accent-red', suffix: `Margem ${formatPercent(d.margemLiquida)}` },
            ].map(k => (
              <div key={k.label} className="glass-card p-4">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">{k.label}</div>
                <div className={`text-xl font-bold font-mono ${k.color}`}>{formatCurrency(k.value)}</div>
                <div className="text-xs text-text-dim mt-1">{k.suffix}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* DRE estruturado */}
            <div>
              <Section title="Receita" color="text-neon-blue">
                <DreRow label="(+) Receita Bruta de Serviços" value={d.receitaBruta} />
                <DreRow label="(-) Impostos" value={-d.impostos} indent />
                <DreRow label="(=) Receita Líquida" value={d.receitaLiquida} bold highlight="blue" />
              </Section>

              <Section title="Custos dos Serviços" color="text-accent-purple">
                <DreRow label="(-) Material" value={-d.material} indent />
                <DreRow label="(-) Mão de Obra" value={-d.maoDeObra} indent />
                <DreRow label="(=) Lucro Bruto" value={d.lucroBruto} bold
                  highlight={d.lucroBruto >= 0 ? 'green' : 'red'}
                  percent={d.margemBruta}
                />
              </Section>

              <Section title="Despesas Operacionais" color="text-accent-orange">
                <DreRow label="(-) Transporte" value={-d.transporte} indent />
                <DreRow label="(=) Lucro Operacional" value={d.lucroOp} bold
                  highlight={d.lucroOp >= 0 ? 'green' : 'red'}
                  percent={d.margemOp}
                />
              </Section>

              <div className="glass-card p-5 border border-neon-blue/30 shadow-[0_0_20px_rgba(0,180,216,0.1)]">
                <div className="text-xs font-bold uppercase tracking-widest mb-3 neon-text">Resultado Final</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Lucro Líquido do Exercício</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded border font-bold ${
                      d.margemLiquida >= 0
                        ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                        : 'bg-accent-red/10 text-accent-red border-accent-red/30'
                    }`}>
                      {d.margemLiquida >= 0 ? '+' : ''}{d.margemLiquida.toFixed(1)}%
                    </span>
                    <span className={`text-2xl font-bold font-mono ${d.lucroLiquido >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {formatCurrency(d.lucroLiquido)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico histórico + tabela */}
            <div className="flex flex-col gap-4">
              {/* Gráfico 6 meses */}
              <div className="glass-card p-4 flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Evolução 6 meses</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data?.historico.map(h => ({
                    name: `${MESES[h.mes - 1]}/${String(h.ano).slice(2)}`,
                    'Receita': h.receitaBruta,
                    'Lucro Bruto': h.lucroBruto,
                    'Líquido': h.lucroLiquido,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#8899aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8899aa', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#111118', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: unknown) => formatCurrency(v as number)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Receita"      stroke="#00b4d8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Lucro Bruto"  stroke="#b56bff" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Líquido"      stroke="#00f5a0" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tabela histórica */}
              <div className="glass-card p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Histórico Mensal</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-dim border-b border-white/5">
                        <th className="text-left pb-2 font-medium">Mês</th>
                        <th className="text-right pb-2 font-medium">Receita</th>
                        <th className="text-right pb-2 font-medium">L. Bruto</th>
                        <th className="text-right pb-2 font-medium">Líquido</th>
                        <th className="text-right pb-2 font-medium">Mg%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.historico.map(h => (
                        <tr key={`${h.mes}-${h.ano}`} className="border-b border-white/5 hover:bg-white/3">
                          <td className="py-1.5 text-text-muted">{MESES[h.mes - 1]}/{h.ano}</td>
                          <td className="py-1.5 text-right font-mono text-neon-blue">{formatCurrency(h.receitaBruta)}</td>
                          <td className={`py-1.5 text-right font-mono ${h.lucroBruto >= 0 ? 'text-accent-purple' : 'text-accent-red'}`}>
                            {formatCurrency(h.lucroBruto)}
                          </td>
                          <td className={`py-1.5 text-right font-mono ${h.lucroLiquido >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                            {formatCurrency(h.lucroLiquido)}
                          </td>
                          <td className={`py-1.5 text-right ${h.margemLiquida >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                            {h.margemLiquida.toFixed(1)}%
                          </td>
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
