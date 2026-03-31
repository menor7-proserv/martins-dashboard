'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { CreditCard, Plus, Trash2, CheckCircle, RotateCcw, AlertTriangle, Clock } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CATEGORIAS = ['MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'IMPOSTOS', 'SERVICO', 'OUTRO']
const CAT_LABEL: Record<string, string> = {
  MATERIAL: 'Material', MAO_DE_OBRA: 'Mão de Obra', TRANSPORTE: 'Transporte',
  IMPOSTOS: 'Impostos', SERVICO: 'Serviço', OUTRO: 'Outro',
}

export default function ContasPagarPage() {
  const { success, error: toastError } = useToast()
  const confirm = useConfirm()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [dados, setDados] = useState<any>(null)
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [obras, setObras] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [marcando, setMarcando] = useState<number | null>(null)
  const [filtroStatus, setFiltroStatus] = useState('')

  // form
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('MATERIAL')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState(now.toISOString().slice(0, 10))
  const [fornecedorId, setFornecedorId] = useState('')
  const [obraId, setObraId] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [res, fRes, oRes] = await Promise.all([
      fetch(`/api/contas-pagar?mes=${mes}&ano=${ano}`),
      fetch('/api/fornecedores'),
      fetch('/api/clientes'),
    ])
    if (res.ok) setDados(await res.json())
    if (fRes.ok) setFornecedores(await fRes.json())
    if (oRes.ok) {
      const clientes = await oRes.json()
      const todasObras = clientes.flatMap((c: any) => c.obras.map((o: any) => ({ ...o, clienteNome: c.nome })))
      setObras(todasObras)
    }
  }, [mes, ano])

  useEffect(() => { load() }, [load])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/contas-pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, categoria, valor, vencimento, fornecedorId: fornecedorId || null, obraId: obraId || null }),
      })
      if (!res.ok) throw new Error()
      setDescricao(''); setValor(''); setFornecedorId(''); setObraId('')
      setShowForm(false)
      await load()
      success('Conta registrada', descricao)
    } catch { toastError('Erro ao salvar', 'Tente novamente') }
    finally { setSaving(false) }
  }

  const marcarPago = async (id: number) => {
    setMarcando(id)
    try {
      await fetch(`/api/contas-pagar/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PAGO' }) })
      await load()
      success('Conta paga', 'Marcada como paga')
    } catch { toastError('Erro', 'Tente novamente') }
    finally { setMarcando(null) }
  }

  const reverter = async (id: number) => {
    try {
      await fetch(`/api/contas-pagar/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PENDENTE' }) })
      await load()
    } catch { toastError('Erro', 'Tente novamente') }
  }

  const deletar = async (id: number, desc: string) => {
    const ok = await confirm({ title: 'Remover conta?', message: `"${desc}" será excluída.`, confirmLabel: 'Remover', danger: true })
    if (!ok) return
    try {
      await fetch(`/api/contas-pagar/${id}`, { method: 'DELETE' })
      await load()
      success('Conta removida', desc)
    } catch { toastError('Erro', 'Tente novamente') }
  }

  const contas = (dados?.contas ?? []).filter((c: any) => filtroStatus ? c.status === filtroStatus : true)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Contas a Pagar</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Compromissos financeiros e vencimentos</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={`${mes}-${ano}`} onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
            className="input-field" style={{ width: 170, fontSize: '0.85rem' }}>
            {Array.from({ length: 3 }, (_, yi) => now.getFullYear() - yi).flatMap(a =>
              Array.from({ length: 12 }, (_, i) => (
                <option key={`${i+1}-${a}`} value={`${i+1}-${a}`}>{MESES[i]} {a}</option>
              ))
            )}
          </select>
          <button onClick={() => setShowForm(s => !s)} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}>
            <Plus size={14} /> Nova Conta
          </button>
        </div>
      </div>

      {/* KPIs */}
      {dados && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>A Pagar</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ef4444' }}>{formatCurrency(dados.totalPendente)}</div>
            {dados.vencidas > 0 && <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 2 }}>{dados.vencidas} vencida(s)</div>}
          </div>
          <div className="glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle size={13} color="#10b981" />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>Pago</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{formatCurrency(dados.totalPago)}</div>
          </div>
          <div className="glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CreditCard size={13} color="#f59e0b" />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>Total Mês</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>{formatCurrency(dados.totalPendente + dados.totalPago)}</div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={salvar} className="glass-card p-5 space-y-4">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 4 }}>Nova Conta a Pagar</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Descrição *</label>
              <input required value={descricao} onChange={e => setDescricao(e.target.value)} className="input-field" placeholder="Ex: Alumínio fornecedor X" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Categoria *</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Valor (R$) *</label>
              <input required type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="input-field" placeholder="0,00" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Vencimento *</label>
              <input required type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Fornecedor</label>
              <select value={fornecedorId} onChange={e => setFornecedorId(e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }}>
                <option value="">— Nenhum —</option>
                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Obra (centro de custo)</label>
              <select value={obraId} onChange={e => setObraId(e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }}>
                <option value="">— Nenhuma —</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.descricao} ({o.clienteNome})</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
              {saving ? 'Salvando…' : 'Registrar Conta'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'none', border: '1px solid #30363d', borderRadius: 8, color: '#8b949e', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </motion.form>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['', 'Todas'], ['PENDENTE', 'Pendentes'], ['PAGO', 'Pagas']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFiltroStatus(val)}
            style={{ fontSize: '0.75rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', border: '1px solid',
              background: filtroStatus === val ? 'rgba(245,158,11,0.1)' : 'transparent',
              borderColor: filtroStatus === val ? 'rgba(245,158,11,0.4)' : '#30363d',
              color: filtroStatus === val ? '#f59e0b' : '#4a5568',
            }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* List */}
      {contas.length === 0 ? (
        <EmptyState icon={<CreditCard size={22} />} title="Nenhuma conta a pagar" description="Registre compromissos financeiros com vencimento e fornecedor." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 90px 110px', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid #30363d' }}>
            {['Descrição', 'Fornecedor', 'Obra', 'Vencimento', 'Valor', ''].map(h => (
              <div key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5568' }}>{h}</div>
            ))}
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {contas.map((c: any, i: number) => {
              const vencida = c.status === 'PENDENTE' && new Date(c.vencimento) < new Date()
              return (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 90px 110px', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
                    background: vencida ? 'rgba(239,68,68,0.03)' : '' }}
                  onMouseEnter={e => (e.currentTarget.style.background = vencida ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = vencida ? 'rgba(239,68,68,0.03)' : '')}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.descricao}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>{CAT_LABEL[c.categoria] ?? c.categoria}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fornecedor?.nome || '—'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.obra?.descricao || '—'}</div>
                  <div style={{ fontSize: '0.8rem', color: vencida ? '#ef4444' : '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {vencida && <AlertTriangle size={11} />}
                    {formatDate(c.vencimento)}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c.status === 'PAGO' ? '#10b981' : vencida ? '#ef4444' : '#f0f6fc' }}>{formatCurrency(c.valor)}</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {c.status === 'PENDENTE' ? (
                      <button onClick={() => marcarPago(c.id)} disabled={marcando === c.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 5, padding: '4px 7px', cursor: 'pointer' }}>
                        <CheckCircle size={11} /> {marcando === c.id ? '…' : 'Pagar'}
                      </button>
                    ) : (
                      <button onClick={() => reverter(c.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 600, color: '#8b949e', background: 'rgba(255,255,255,0.04)', border: '1px solid #30363d', borderRadius: 5, padding: '4px 7px', cursor: 'pointer' }}>
                        <RotateCcw size={11} /> Reverter
                      </button>
                    )}
                    <button onClick={() => deletar(c.id, c.descricao)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 3 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
