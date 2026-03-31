'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { Truck, Plus, Trash2, Pencil, Check, X } from 'lucide-react'

const CATS = ['Material', 'Serviço', 'Transporte', 'Mão de Obra', 'Outro']

export default function FornecedoresPage() {
  const { success, error: toastError } = useToast()
  const confirm = useConfirm()
  const [lista, setLista] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // form
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [categoria, setCategoria] = useState('Material')
  const [saving, setSaving] = useState(false)

  // edit
  const [editNome, setEditNome] = useState('')
  const [editTel, setEditTel] = useState('')
  const [editCat, setEditCat] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/fornecedores')
    if (res.ok) setLista(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, categoria }),
      })
      if (!res.ok) throw new Error()
      setNome(''); setTelefone(''); setShowForm(false)
      await load()
      success('Fornecedor cadastrado', nome)
    } catch { toastError('Erro ao salvar', 'Tente novamente') }
    finally { setSaving(false) }
  }

  const salvarEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/fornecedores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editNome, telefone: editTel, categoria: editCat }),
      })
      if (!res.ok) throw new Error()
      setEditingId(null)
      await load()
      success('Fornecedor atualizado', editNome)
    } catch { toastError('Erro ao salvar', 'Tente novamente') }
  }

  const deletar = async (id: number, n: string) => {
    const ok = await confirm({ title: 'Remover fornecedor?', message: `"${n}" será excluído.`, confirmLabel: 'Remover', danger: true })
    if (!ok) return
    try {
      await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' })
      await load()
      success('Fornecedor removido', n)
    } catch { toastError('Erro ao remover', '') }
  }

  return (
    <div className="space-y-5 animate-fade-in" style={{ maxWidth: 720 }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Fornecedores</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Cadastro de fornecedores e prestadores de serviço</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Plus size={14} /> Novo Fornecedor
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={salvar} className="glass-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Nome *</label>
              <input required value={nome} onChange={e => setNome(e.target.value)} className="input-field" placeholder="Nome do fornecedor" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Telefone</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} className="input-field" placeholder="(00) 00000-0000" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Categoria</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
              {saving ? 'Salvando…' : 'Cadastrar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'none', border: '1px solid #30363d', borderRadius: 8, color: '#8b949e', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </motion.form>
      )}

      {lista.length === 0 ? (
        <EmptyState icon={<Truck size={22} />} title="Nenhum fornecedor cadastrado" description="Adicione fornecedores para vinculá-los nas Contas a Pagar." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 80px', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid #30363d' }}>
            {['Fornecedor', 'Telefone', 'Categoria', ''].map(h => (
              <div key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5568' }}>{h}</div>
            ))}
          </div>
          {lista.map((f, i) => {
            const isEditing = editingId === f.id
            return (
              <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 80px', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {isEditing ? (
                  <>
                    <input value={editNome} onChange={e => setEditNome(e.target.value)} className="input-field" style={{ fontSize: '0.85rem' }} />
                    <input value={editTel} onChange={e => setEditTel(e.target.value)} className="input-field" style={{ fontSize: '0.85rem' }} />
                    <select value={editCat} onChange={e => setEditCat(e.target.value)} className="input-field" style={{ fontSize: '0.85rem' }}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => salvarEdit(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}><Check size={15} /></button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}><X size={15} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc' }}>{f.nome}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>{f.telefone || '—'}</div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                        {f.categoria || 'Outro'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { setEditingId(f.id); setEditNome(f.nome); setEditTel(f.telefone ?? ''); setEditCat(f.categoria ?? 'Material') }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(139,148,158,0.5)', padding: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#8b949e')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(139,148,158,0.5)')}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deletar(f.id, f.nome)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
