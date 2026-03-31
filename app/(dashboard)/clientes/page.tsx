'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClienteForm } from '@/components/forms/ClienteForm'
import { PagamentoForm } from '@/components/forms/PagamentoForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { ChevronDown, ChevronUp, Trash2, Pencil, Check, X, Users, Search, History } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS = ['ABERTA', 'CONCLUIDA', 'CANCELADA']

export default function ClientesPage() {
  const { success, error: toastError } = useToast()
  const confirm = useConfirm()

  const [clientes, setClientes] = useState<any[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  // Inline edit state for cliente
  const [editingCliente, setEditingCliente] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editTel, setEditTel] = useState('')

  // Inline edit state for obra
  const [editingObra, setEditingObra] = useState<number | null>(null)
  const [editObraDesc, setEditObraDesc] = useState('')
  const [editObraValor, setEditObraValor] = useState('')
  const [editObraData, setEditObraData] = useState('')
  const [editObraStatus, setEditObraStatus] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/clientes')
    if (res.ok) setClientes(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefone ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Cliente actions ──
  const startEditCliente = (c: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCliente(c.id)
    setEditNome(c.nome)
    setEditTel(c.telefone ?? '')
  }

  const saveCliente = async (id: number) => {
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editNome, telefone: editTel }),
      })
      if (!res.ok) throw new Error()
      setEditingCliente(null)
      await load()
      success('Cliente atualizado', 'Dados salvos com sucesso')
    } catch {
      toastError('Erro ao salvar', 'Tente novamente')
    }
  }

  const deletarCliente = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Remover cliente?',
      message: 'Isso excluirá o cliente e todas as obras e pagamentos vinculados. Esta ação não pode ser desfeita.',
      confirmLabel: 'Remover',
      danger: true,
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await load()
      success('Cliente removido', 'Registro excluído com sucesso')
    } catch {
      toastError('Erro ao remover', 'Tente novamente')
    }
  }

  // ── Obra actions ──
  const startEditObra = (o: any) => {
    setEditingObra(o.id)
    setEditObraDesc(o.descricao)
    setEditObraValor(String(o.valorTotal))
    setEditObraData(o.data)
    setEditObraStatus(o.status)
  }

  const saveObra = async (id: number) => {
    try {
      const res = await fetch(`/api/obras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: editObraDesc, valorTotal: parseFloat(editObraValor), data: editObraData, status: editObraStatus }),
      })
      if (!res.ok) throw new Error()
      setEditingObra(null)
      await load()
      success('Obra atualizada', 'Dados salvos com sucesso')
    } catch {
      toastError('Erro ao salvar', 'Tente novamente')
    }
  }

  const changeObraStatus = async (obra: any, status: string) => {
    try {
      const res = await fetch(`/api/obras/${obra.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: obra.descricao, valorTotal: obra.valorTotal, data: obra.data, status }),
      })
      if (!res.ok) throw new Error()
      await load()
      success('Status atualizado', `Obra marcada como ${status.toLowerCase()}`)
    } catch {
      toastError('Erro ao atualizar status', 'Tente novamente')
    }
  }

  const deletarObra = async (id: number) => {
    const ok = await confirm({
      title: 'Remover obra?',
      message: 'Todos os pagamentos desta obra também serão removidos.',
      confirmLabel: 'Remover',
      danger: true,
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/obras/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await load()
      success('Obra removida', 'Registro excluído com sucesso')
    } catch {
      toastError('Erro ao remover obra', 'Tente novamente')
    }
  }

  // ── Pagamento actions ──
  const marcarRecebido = async (pagId: number) => {
    try {
      const res = await fetch(`/api/pagamentos/${pagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RECEBIDO' }),
      })
      if (!res.ok) throw new Error()
      await load()
      success('Pagamento recebido', 'Status atualizado')
    } catch {
      toastError('Erro ao atualizar', 'Tente novamente')
    }
  }

  const deletarPagamento = async (id: number) => {
    const ok = await confirm({
      title: 'Remover pagamento?',
      message: 'Este lançamento de pagamento será excluído permanentemente.',
      confirmLabel: 'Remover',
      danger: true,
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/pagamentos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await load()
      success('Pagamento removido', 'Registro excluído com sucesso')
    } catch {
      toastError('Erro ao remover pagamento', 'Tente novamente')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Clientes &amp; Obras</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Gerencie obras e recebimentos por cliente</p>
      </div>

      <ClienteForm onSuccess={load} />

      {/* Search */}
      {clientes.length > 0 && (
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone…"
            className="input-field"
            style={{ paddingLeft: 36, fontSize: '0.85rem' }}
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtrados.length === 0 && clientes.length === 0 && (
          <EmptyState
            icon={<Users size={22} />}
            title="Nenhum cliente cadastrado"
            description="Adicione o primeiro cliente usando o formulário acima."
          />
        )}
        {filtrados.length === 0 && clientes.length > 0 && (
          <EmptyState
            icon={<Search size={22} />}
            title="Nenhum resultado"
            description={`Nenhum cliente encontrado para "${search}".`}
          />
        )}

        {filtrados.map((cliente, i) => {
          const totalObras = cliente.obras.reduce((s: number, o: any) => s + o.valorTotal, 0)
          const totalPendente = cliente.obras.flatMap((o: any) => o.pagamentos)
            .filter((p: any) => p.status === 'PENDENTE')
            .reduce((s: number, p: any) => s + p.valor, 0)
          const isEditing = editingCliente === cliente.id

          return (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              {/* Cliente row */}
              <div
                className="p-4 flex items-center justify-between gap-3"
                style={{ cursor: isEditing ? 'default' : 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = 'rgba(245,158,11,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '' }}
                onClick={() => { if (!isEditing) setExpanded(expanded === cliente.id ? null : cliente.id) }}
              >
                {/* Avatar */}
                <div style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b',
                }}>
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>

                {/* Name / edit fields */}
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 8, flex: 1 }} onClick={e => e.stopPropagation()}>
                    <input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem', flex: 1 }}
                      placeholder="Nome"
                      autoFocus
                    />
                    <input
                      value={editTel}
                      onChange={e => setEditTel(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem', width: 140 }}
                      placeholder="Telefone"
                    />
                    <button onClick={() => saveCliente(cliente.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}><Check size={16} /></button>
                    <button onClick={() => setEditingCliente(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}><X size={16} /></button>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>{cliente.nome}</div>
                    {cliente.telefone && <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{cliente.telefone}</div>}
                  </div>
                )}

                {/* Totals + actions */}
                {!isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(totalObras)}</div>
                      {totalPendente > 0 && <div style={{ fontSize: '0.7rem', color: '#fb923c' }}>{formatCurrency(totalPendente)} pend.</div>}
                    </div>
                    <Link
                      href={`/clientes/${cliente.id}`}
                      onClick={e => e.stopPropagation()}
                      title="Ver histórico"
                      style={{ display: 'flex', alignItems: 'center', color: 'rgba(139,148,158,0.5)', padding: 4, textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#8b5cf6')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(139,148,158,0.5)')}
                    >
                      <History size={13} />
                    </Link>
                    <button
                      onClick={e => startEditCliente(cliente, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(139,148,158,0.5)', padding: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#8b949e')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(139,148,158,0.5)')}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={e => deletarCliente(cliente.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}
                    >
                      <Trash2 size={13} />
                    </button>
                    {expanded === cliente.id ? <ChevronUp size={16} color="#4a5568" /> : <ChevronDown size={16} color="#4a5568" />}
                  </div>
                )}
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expanded === cliente.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: '1px solid #30363d', overflow: 'hidden' }}
                  >
                    <div className="p-4 space-y-3">
                      {cliente.obras.length === 0 && (
                        <p style={{ color: '#4a5568', fontSize: '0.8rem', textAlign: 'center', padding: '8px 0' }}>Nenhuma obra cadastrada para este cliente.</p>
                      )}
                      {cliente.obras.map((obra: any) => {
                        const isEditingObra = editingObra === obra.id
                        return (
                          <div key={obra.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #30363d', borderRadius: 8, padding: 14 }}>
                            {/* Obra header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                              {isEditingObra ? (
                                <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                                  <input
                                    value={editObraDesc}
                                    onChange={e => setEditObraDesc(e.target.value)}
                                    className="input-field"
                                    style={{ fontSize: '0.8rem', flex: 1, minWidth: 160 }}
                                    placeholder="Descrição"
                                    autoFocus
                                  />
                                  <input
                                    value={editObraValor}
                                    onChange={e => setEditObraValor(e.target.value)}
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    style={{ fontSize: '0.8rem', width: 120 }}
                                    placeholder="Valor"
                                  />
                                  <button onClick={() => saveObra(obra.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}><Check size={15} /></button>
                                  <button onClick={() => setEditingObra(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}><X size={15} /></button>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.875rem' }}>{obra.descricao}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 2 }}>{formatDate(obra.data)}</div>
                                </div>
                              )}

                              {!isEditingObra && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(obra.valorTotal)}</span>
                                  {/* Status dropdown */}
                                  <select
                                    value={obra.status}
                                    onChange={e => changeObraStatus(obra, e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                      fontSize: '0.65rem', fontWeight: 700,
                                      padding: '3px 8px', borderRadius: 6,
                                      border: `1px solid ${obra.status === 'ABERTA' ? 'rgba(245,158,11,0.4)' : obra.status === 'CONCLUIDA' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                      background: obra.status === 'ABERTA' ? 'rgba(245,158,11,0.1)' : obra.status === 'CONCLUIDA' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                      color: obra.status === 'ABERTA' ? '#f59e0b' : obra.status === 'CONCLUIDA' ? '#10b981' : '#ef4444',
                                      cursor: 'pointer', appearance: 'auto',
                                    }}
                                  >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <button onClick={() => startEditObra(obra)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(139,148,158,0.5)', padding: 2 }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#8b949e')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(139,148,158,0.5)')}>
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => deletarObra(obra.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 2 }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Pagamentos */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {obra.pagamentos.map((p: any) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <NeonBadge label={p.prazo} />
                                  <NeonBadge label={p.status} />
                                  <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{formatCurrency(p.valor)}</span>
                                  <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>venc. {formatDate(p.vencimento)}</span>
                                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {p.status === 'PENDENTE' && (
                                      <button
                                        onClick={() => marcarRecebido(p.id)}
                                        style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
                                      >✓ Recebido</button>
                                    )}
                                    <button
                                      onClick={() => deletarPagamento(p.id)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 2 }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <PagamentoForm obraId={obra.id} onSuccess={load} />
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
