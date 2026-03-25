'use client'

import { useState } from 'react'
import { NeonBadge } from '@/components/ui/NeonBadge'

const CATEGORIAS = [
  { value: 'MATERIAL',    label: 'Material' },
  { value: 'MAO_DE_OBRA', label: 'Mão de Obra' },
  { value: 'TRANSPORTE',  label: 'Transporte' },
  { value: 'IMPOSTOS',    label: 'Impostos' },
]

export function DespesaForm({ onSuccess }: { onSuccess: () => void }) {
  const [categoria, setCategoria] = useState('MATERIAL')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/despesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria, descricao, valor: parseFloat(valor), data }),
    })
    setDescricao(''); setValor('')
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={submit} className="glass-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-neon-blue uppercase tracking-widest">+ Lançar Despesa</h3>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Categoria</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="input-field">
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Descrição *</label>
          <input required value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Alumínio 3m perfil linha 25" className="input-field" />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Valor (R$) *</label>
          <input required type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="input-field" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Data *</label>
          <input required type="date" value={data} onChange={e => setData(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Salvando...' : 'Lançar Despesa'}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIAS.map(c => <NeonBadge key={c.value} label={c.value} />)}
      </div>
    </form>
  )
}
