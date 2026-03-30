'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MiniGauge } from '@/components/ui/MiniGauge'
import { formatCurrency } from '@/lib/formatters'
import { useToast } from '@/components/ui/Toast'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function MetasPage() {
  const { success, error: toastError } = useToast()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [meta, setMeta] = useState<any>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [metaFat, setMetaFat] = useState('')
  const [metaLuc, setMetaLuc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/metas?mes=${mes}&ano=${ano}`).then(r => r.json()).then(d => {
      setMeta(d)
      if (d) { setMetaFat(String(d.metaFaturamento)); setMetaLuc(String(d.metaLucro)) }
      else { setMetaFat(''); setMetaLuc('') }
    })
    fetch(`/api/dashboard?mes=${mes}&ano=${ano}`).then(r => r.json()).then(setDashboard)
  }, [mes, ano])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/metas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, ano, metaFaturamento: parseFloat(metaFat), metaLucro: parseFloat(metaLuc) }),
      })
      if (!res.ok) throw new Error()
      const d = await (await fetch(`/api/metas?mes=${mes}&ano=${ano}`)).json()
      setMeta(d)
      success('Meta salva', `Meta de ${MESES[mes-1]} atualizada com sucesso`)
    } catch {
      toastError('Erro ao salvar', 'Verifique os valores e tente novamente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Metas Mensais</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>
          Defina e acompanhe suas metas de faturamento e lucro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 16 }}>
            Definir Meta
          </h2>
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Mês</label>
                <select value={mes} onChange={e => setMes(+e.target.value)} className="input-field">
                  {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Ano</label>
                <input type="number" value={ano} onChange={e => setAno(+e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
                Meta de Faturamento (R$)
              </label>
              <input required type="number" step="0.01" value={metaFat} onChange={e => setMetaFat(e.target.value)} placeholder="Ex: 50000" className="input-field" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
                Meta de Lucro Líquido (R$)
              </label>
              <input required type="number" step="0.01" value={metaLuc} onChange={e => setMetaLuc(e.target.value)} placeholder="Ex: 20000" className="input-field" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar Meta'}
            </button>
          </form>
        </motion.div>

        {/* Progresso com gauges */}
        {dashboard && meta ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 16 }}>
              Progresso — {MESES[mes-1]} {ano}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16, marginBottom: 24 }}>
              <MiniGauge label="Faturamento" current={dashboard.faturamento} target={meta.metaFaturamento} />
              <MiniGauge label="Lucro Líquido" current={dashboard.lucro} target={meta.metaLucro} />
            </div>
            <div style={{ borderTop: '1px solid #30363d', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#4a5568', marginBottom: 4 }}>Faturamento Atual</div>
                <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.95rem' }}>{formatCurrency(dashboard.faturamento)}</div>
                <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>Meta: {formatCurrency(meta.metaFaturamento)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#4a5568', marginBottom: 4 }}>Lucro Atual</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: dashboard.lucro >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatCurrency(dashboard.lucro)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>Meta: {formatCurrency(meta.metaLucro)}</div>
              </div>
            </div>
          </motion.div>
        ) : dashboard && !meta ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>Nenhuma meta definida para este mês.</p>
            <p style={{ color: '#8b949e', fontSize: '0.8rem' }}>Preencha o formulário ao lado para começar.</p>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
