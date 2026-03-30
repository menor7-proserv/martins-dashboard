'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DespesaForm } from '@/components/forms/DespesaForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { Trash2, Receipt } from 'lucide-react'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CATEGORIAS = ['', 'MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'IMPOSTOS']

export default function DespesasPage() {
  const { success, error: toastError } = useToast()
  const confirm = useConfirm()

  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [despesas, setDespesas] = useState<any[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const load = useCallback(async () => {
    const url = `/api/despesas?mes=${mes}&ano=${ano}${filtroCategoria ? `&categoria=${filtroCategoria}` : ''}`
    const res = await fetch(url)
    if (res.ok) setDespesas(await res.json())
  }, [mes, ano, filtroCategoria])

  useEffect(() => { load() }, [load])

  const deletar = async (id: number, descricao: string) => {
    const ok = await confirm({
      title: 'Remover despesa?',
      message: `"${descricao}" será excluída permanentemente.`,
      confirmLabel: 'Remover',
      danger: true,
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/despesas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await load()
      success('Despesa removida', 'Registro excluído com sucesso')
    } catch {
      toastError('Erro ao remover', 'Tente novamente')
    }
  }

  const total = despesas.reduce((s, d) => s + d.valor, 0)
  const porCategoria = despesas.reduce((acc: Record<string,number>, d) => {
    acc[d.categoria] = (acc[d.categoria] ?? 0) + d.valor
    return acc
  }, {})
  const pieData = Object.entries(porCategoria).map(([categoria, valor]) => ({ categoria, _sum: { valor } }))

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Despesas</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>
            Total do período: <span style={{ color: '#ef4444', fontWeight: 800 }}>{formatCurrency(total)}</span>
          </p>
        </div>
        <select
          value={`${mes}-${ano}`}
          onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
          className="input-field"
          style={{ width: 144, fontSize: '0.85rem' }}
        >
          {MESES.map((m, i) => <option key={i} value={`${i+1}-${ano}`}>{m} {ano}</option>)}
        </select>
      </div>

      <DespesaForm onSuccess={load} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div style={{ gridColumn: 'span 2' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                style={{
                  fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                  borderRadius: 6,
                  border: filtroCategoria === cat ? '1px solid rgba(245,158,11,0.6)' : '1px solid #30363d',
                  color: filtroCategoria === cat ? '#f59e0b' : '#8b949e',
                  background: filtroCategoria === cat ? 'rgba(245,158,11,0.1)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {cat || 'Todas'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {despesas.length === 0 && (
              <EmptyState
                icon={<Receipt size={22} />}
                title="Nenhuma despesa no período"
                description="Adicione despesas usando o formulário acima."
              />
            )}
            {despesas.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card px-4 py-3 flex items-center gap-3"
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <NeonBadge label={d.categoria} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#f0f6fc' }}>{d.descricao}</span>
                <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>{formatDate(d.data)}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(d.valor)}</span>
                <button
                  onClick={() => deletar(d.id, d.descricao)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 12, fontWeight: 600 }}>
            Por Categoria
          </h3>
          {pieData.length > 0 ? (
            <>
              <ExpensePieChart data={pieData} />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(porCategoria).map(([cat, val]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <NeonBadge label={cat} />
                    <span style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 600 }}>{formatCurrency(val as number)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#4a5568', fontSize: '0.8rem', textAlign: 'center', padding: '24px 0' }}>Sem dados</p>
          )}
        </div>
      </div>
    </div>
  )
}
