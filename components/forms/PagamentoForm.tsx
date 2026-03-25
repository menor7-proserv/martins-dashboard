'use client'

import { useState } from 'react'

interface Props {
  obraId: number
  onSuccess: () => void
}

const PRAZOS = ['AVISTA', '7D', '30D', '60D', '90D']

export function PagamentoForm({ obraId, onSuccess }: Props) {
  const [valor, setValor] = useState('')
  const [prazo, setPrazo] = useState('30D')
  const [vencimento, setVencimento] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/pagamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obraId, valor: parseFloat(valor), prazo, vencimento }),
    })
    setValor('')
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2 mt-2">
      <div className="flex-1">
        <label className="text-xs text-text-dim block mb-1">Valor</label>
        <input required type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="R$" className="input-field text-sm" style={{ padding: '0.375rem 0.75rem' }} />
      </div>
      <div>
        <label className="text-xs text-text-dim block mb-1">Prazo</label>
        <select value={prazo} onChange={e => setPrazo(e.target.value)} className="input-field text-sm" style={{ padding: '0.375rem 0.75rem' }}>
          {PRAZOS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-text-dim block mb-1">Vencimento</label>
        <input required type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} className="input-field text-sm" style={{ padding: '0.375rem 0.75rem' }} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary text-sm" style={{ padding: '0.375rem 0.75rem' }}>
        {loading ? '...' : '+ Parcela'}
      </button>
    </form>
  )
}
