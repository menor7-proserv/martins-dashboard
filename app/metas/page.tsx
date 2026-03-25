'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/lib/formatters'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function MetasPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [meta, setMeta] = useState<any>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [metaFat, setMetaFat] = useState('')
  const [metaLuc, setMetaLuc] = useState('')
  const [saved, setSaved] = useState(false)

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
    await fetch('/api/metas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, ano, metaFaturamento: parseFloat(metaFat), metaLucro: parseFloat(metaLuc) }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    const d = await (await fetch(`/api/metas?mes=${mes}&ano=${ano}`)).json()
    setMeta(d)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Metas Mensais</h1>
        <p className="text-text-muted text-sm">Defina e acompanhe suas metas de faturamento e lucro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-neon-blue uppercase tracking-widest mb-4">Definir Meta</h2>
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Mês</label>
                <select value={mes} onChange={e => setMes(+e.target.value)} className="input-field">
                  {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Ano</label>
                <input type="number" value={ano} onChange={e => setAno(+e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Meta de Faturamento (R$)</label>
              <input required type="number" step="0.01" value={metaFat} onChange={e => setMetaFat(e.target.value)} placeholder="Ex: 50000" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Meta de Lucro Líquido (R$)</label>
              <input required type="number" step="0.01" value={metaLuc} onChange={e => setMetaLuc(e.target.value)} placeholder="Ex: 20000" className="input-field" />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              style={saved ? { background: 'rgba(0,245,160,0.15)', borderColor: 'rgba(0,245,160,0.4)', color: '#00f5a0' } : {}}
            >
              {saved ? '✓ Salvo!' : 'Salvar Meta'}
            </button>
          </form>
        </motion.div>

        {dashboard && meta && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h2 className="text-sm font-semibold text-neon-blue uppercase tracking-widest mb-4">
              Progresso — {MESES[mes-1]} {ano}
            </h2>
            <div className="space-y-6">
              <ProgressBar label="Faturamento" current={dashboard.faturamento} target={meta.metaFaturamento} color="blue" />
              <ProgressBar label="Lucro Líquido" current={dashboard.lucro} target={meta.metaLucro} color="green" />
            </div>
            <div className="mt-6 pt-4 grid grid-cols-2 gap-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="text-text-dim text-xs mb-1">Faturamento Atual</div>
                <div className="font-bold text-neon-blue">{formatCurrency(dashboard.faturamento)}</div>
                <div className="text-text-dim text-xs">Meta: {formatCurrency(meta.metaFaturamento)}</div>
              </div>
              <div>
                <div className="text-text-dim text-xs mb-1">Lucro Atual</div>
                <div className={`font-bold ${dashboard.lucro >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {formatCurrency(dashboard.lucro)}
                </div>
                <div className="text-text-dim text-xs">Meta: {formatCurrency(meta.metaLucro)}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
