'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { formatCurrency } from '@/lib/formatters'
import { RepeatIcon, Plus, Trash2, Zap, ToggleLeft, ToggleRight } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CATEGORIAS = ['MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'IMPOSTOS', 'SERVICO', 'OUTRO']
const CAT_LABEL: Record<string, string> = {
  MATERIAL: 'Material', MAO_DE_OBRA: 'Mão de Obra', TRANSPORTE: 'Transporte',
  IMPOSTOS: 'Impostos', SERVICO: 'Serviço', OUTRO: 'Outro',
}

export default function RecorrentesPage() {
  const { success, error: toastError } = useToast()
  const confirm = useConfirm()
  const now = new Date()
  const [lista, setLista] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [mesSel, setMesSel] = useState(now.getMonth() + 1)
  const [anoSel, setAnoSel] = useState(now.getFullYear())

  // form
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('MATERIAL')
  const [valor, setValor] = useState('')
  const [diaVencto, setDiaVencto] = useState('5')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/recorrentes')
    if (res.ok) setLista(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/recorrentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, categoria, valor, diaVencto }),
      })
      if (!res.ok) throw new Error()
      setDescricao(''); setValor(''); setShowForm(false)
      await load()
      success('Recorrente criada', descricao)
    } catch { toastError('Erro ao salvar', 'Tente novamente') }
    finally { setSaving(false) }
  }

  const toggleAtivo = async (id: number, ativo: boolean) => {
    try {
      await fetch(`/api/recorrentes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !ativo }) })
      await load()
    } catch { toastError('Erro', 'Tente novamente') }
  }

  const deletar = async (id: number, desc: string) => {
    const ok = await confirm({ title: 'Remover recorrente?', message: `"${desc}" será excluída permanentemente.`, confirmLabel: 'Remover', danger: true })
    if (!ok) return
    try {
      await fetch(`/api/recorrentes/${id}`, { method: 'DELETE' })
      await load()
      success('Recorrente removida', desc)
    } catch { toastError('Erro', 'Tente novamente') }
  }

  const gerar = async () => {
    setGerando(true)
    try {
      const res = await fetch('/api/recorrentes/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes: mesSel, ano: anoSel }),
      })
      const data = await res.json()
      if (data.geradas === 0) {
        success('Nenhuma nova conta gerada', data.msg ?? 'Todas já existem para este mês')
      } else {
        success(`${data.geradas} conta(s) gerada(s)`, `Em Contas a Pagar — ${MESES[mesSel-1]} ${anoSel}`)
      }
    } catch { toastError('Erro ao gerar', 'Tente novamente') }
    finally { setGerando(false) }
  }

  const totalMensal = lista.filter(r => r.ativo).reduce((s: number, r: any) => s + r.valor, 0)

  return (
    <div className="space-y-5 animate-fade-in" style={{ maxWidth: 760 }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Despesas Recorrentes</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Templates de custos fixos mensais — gere as contas com 1 clique</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}>
          <Plus size={14} /> Nova Recorrente
        </button>
      </div>

      {/* Gerar contas do mês */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, flexWrap: 'wrap' }}>
        <Zap size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f6fc' }}>Gerar Contas do Mês</div>
          <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 1 }}>Cria automaticamente as contas a pagar para o mês selecionado</div>
        </div>
        <select value={`${mesSel}-${anoSel}`} onChange={e => { const [m,a] = e.target.value.split('-'); setMesSel(+m); setAnoSel(+a) }}
          className="input-field" style={{ width: 160, fontSize: '0.8rem' }}>
          {Array.from({ length: 3 }, (_, yi) => now.getFullYear() - yi).flatMap(a =>
            Array.from({ length: 12 }, (_, i) => (
              <option key={`${i+1}-${a}`} value={`${i+1}-${a}`}>{MESES[i]} {a}</option>
            ))
          )}
        </select>
        <button onClick={gerar} disabled={gerando || lista.filter(r => r.ativo).length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#f59e0b', border: 'none', borderRadius: 8, color: '#0d1117', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: gerando ? 0.7 : 1 }}>
          <Zap size={13} /> {gerando ? 'Gerando…' : 'Gerar Agora'}
        </button>
      </motion.div>

      {/* Total mensal */}
      {totalMensal > 0 && (
        <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid #30363d', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Total mensal fixo (ativos)</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(totalMensal)}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={salvar} className="glass-card p-5 space-y-4">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b' }}>Nova Despesa Recorrente</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Descrição *</label>
              <input required value={descricao} onChange={e => setDescricao(e.target.value)} className="input-field" placeholder="Ex: Aluguel, Internet, Salário fixo…" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Categoria</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Valor (R$) *</label>
              <input required type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="input-field" placeholder="0,00" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Dia do vencimento *</label>
              <input required type="number" min="1" max="31" value={diaVencto} onChange={e => setDiaVencto(e.target.value)} className="input-field" placeholder="Ex: 5" style={{ fontSize: '0.875rem' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
              {saving ? 'Salvando…' : 'Criar Template'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'none', border: '1px solid #30363d', borderRadius: 8, color: '#8b949e', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </motion.form>
      )}

      {/* List */}
      {lista.length === 0 ? (
        <EmptyState icon={<RepeatIcon size={22} />} title="Nenhuma despesa recorrente" description="Crie templates para aluguel, salários fixos, internet e gere as contas automaticamente." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 80px 70px 80px', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid #30363d' }}>
            {['Despesa', 'Categoria', 'Valor/mês', 'Dia', ''].map(h => (
              <div key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5568' }}>{h}</div>
            ))}
          </div>
          {lista.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 110px 80px 70px 80px', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', opacity: r.ativo ? 1 : 0.4 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc' }}>{r.descricao}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', width: 'fit-content' }}>
                {CAT_LABEL[r.categoria] ?? r.categoria}
              </span>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(r.valor)}</div>
              <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Dia {r.diaVencto}</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button onClick={() => toggleAtivo(r.id, r.ativo)} title={r.ativo ? 'Desativar' : 'Ativar'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.ativo ? '#10b981' : '#4a5568', padding: 3 }}>
                  {r.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => deletar(r.id, r.descricao)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 3 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
