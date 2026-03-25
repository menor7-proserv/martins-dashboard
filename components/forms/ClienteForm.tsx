'use client'

import { useState } from 'react'

interface Props {
  onSuccess: () => void
}

const STATUS_OBRA = ['ABERTA', 'CONCLUIDA', 'CANCELADA']

export function ClienteForm({ onSuccess }: Props) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState('ABERTA')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const clienteRes = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone }),
    })
    const cliente = await clienteRes.json()
    await fetch('/api/obras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId: cliente.id, descricao, valorTotal: parseFloat(valorTotal), data, status }),
    })
    setNome(''); setTelefone(''); setDescricao(''); setValorTotal('')
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={submit} className="glass-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-neon-blue uppercase tracking-widest">+ Nova Obra</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Cliente *</label>
          <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do cliente" className="input-field" />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Telefone</label>
          <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Descrição da Obra *</label>
        <input required value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Box de vidro temperado 8mm" className="input-field" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Valor Total (R$) *</label>
          <input required type="number" step="0.01" value={valorTotal} onChange={e => setValorTotal(e.target.value)} placeholder="0,00" className="input-field" />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Data *</label>
          <input required type="date" value={data} onChange={e => setData(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
            {STATUS_OBRA.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Salvando...' : 'Cadastrar Obra'}
      </button>
    </form>
  )
}
