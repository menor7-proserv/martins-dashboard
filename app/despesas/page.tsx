'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DespesaForm } from '@/components/forms/DespesaForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { formatCurrency, formatDate } from '@/lib/formatters'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function DespesasPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [despesas, setDespesas] = useState<any[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const load = useCallback(async () => {
    const url = `/api/despesas?mes=${mes}&ano=${ano}${filtroCategoria ? `&categoria=${filtroCategoria}` : ''}`
    const res = await fetch(url)
    setDespesas(await res.json())
  }, [mes, ano, filtroCategoria])

  useEffect(() => { load() }, [load])

  const deletar = async (id: number) => {
    await fetch(`/api/despesas/${id}`, { method: 'DELETE' })
    load()
  }

  const total = despesas.reduce((s, d) => s + d.valor, 0)
  const porCategoria = despesas.reduce((acc: Record<string, number>, d) => {
    acc[d.categoria] = (acc[d.categoria] ?? 0) + d.valor
    return acc
  }, {})
  const pieData = Object.entries(porCategoria).map(([categoria, valor]) => ({ categoria, _sum: { valor } }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Despesas</h1>
          <p className="text-text-muted text-sm">Total do período: <span className="text-accent-red font-bold">{formatCurrency(total)}</span></p>
        </div>
        <select
          value={`${mes}-${ano}`}
          onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
          className="input-field w-36 text-sm"
        >
          {MESES.map((m, i) => <option key={i} value={`${i+1}-${ano}`}>{m} {ano}</option>)}
        </select>
      </div>

      <DespesaForm onSuccess={load} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex gap-2 mb-3 flex-wrap">
            {['', 'MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'IMPOSTOS'].map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: filtroCategoria === cat ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)',
                  color: filtroCategoria === cat ? '#00b4d8' : '#8899aa',
                  background: filtroCategoria === cat ? 'rgba(0,180,216,0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat || 'Todas'}
              </button>
            ))}
          </div>
          {despesas.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card px-4 py-3 flex items-center gap-3"
            >
              <NeonBadge label={d.categoria} />
              <span className="flex-1 text-sm text-text-primary">{d.descricao}</span>
              <span className="text-xs text-text-dim">{formatDate(d.data)}</span>
              <span className="text-sm font-bold text-accent-red">{formatCurrency(d.valor)}</span>
              <button
                onClick={() => deletar(d.id)}
                style={{ color: 'rgba(136,153,170,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '0.25rem' }}
                onMouseOver={e => (e.currentTarget.style.color = '#ff4d6d')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(136,153,170,0.6)')}
              >✕</button>
            </motion.div>
          ))}
          {despesas.length === 0 && (
            <div className="glass-card p-8 text-center" style={{ color: '#4a5568' }}>Nenhuma despesa no período</div>
          )}
        </div>
        <div className="glass-card p-5">
          <h3 className="text-xs text-text-muted uppercase tracking-widest mb-3">Por Categoria</h3>
          {pieData.length > 0
            ? <ExpensePieChart data={pieData} />
            : <p style={{ color: '#4a5568', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>–</p>
          }
          <div className="mt-3 space-y-1">
            {Object.entries(porCategoria).map(([cat, val]) => (
              <div key={cat} className="flex justify-between text-xs">
                <NeonBadge label={cat} />
                <span className="text-text-muted">{formatCurrency(val as number)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
