'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/Toast'
import { User, Lock, Building2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession()
  const { success, error: toastError } = useToast()

  const [nome, setNome] = useState(session?.user?.name ?? '')
  const [empresa, setEmpresa] = useState((session?.user as any)?.empresa ?? '')
  const [savingPerfil, setSavingPerfil] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [savingSenha, setSavingSenha] = useState(false)

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPerfil(true)
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, empresa }),
      })
      if (!res.ok) throw new Error()
      await update({ name: nome })
      success('Perfil atualizado', 'Suas informações foram salvas')
    } catch {
      toastError('Erro ao salvar', 'Tente novamente')
    } finally {
      setSavingPerfil(false)
    }
  }

  const salvarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) { toastError('Senhas não conferem', 'Digite a mesma senha nos dois campos'); return }
    if (novaSenha.length < 6) { toastError('Senha muito curta', 'Use pelo menos 6 caracteres'); return }
    setSavingSenha(true)
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
      success('Senha alterada', 'Sua senha foi atualizada com sucesso')
    } catch (err: any) {
      toastError('Erro ao alterar senha', err?.message ?? 'Tente novamente')
    } finally {
      setSavingSenha(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in" style={{ maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Configurações</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Gerencie seu perfil e segurança da conta</p>
      </div>

      {/* Perfil */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <User size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f6fc' }}>Informações do Perfil</div>
            <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{session?.user?.email}</div>
          </div>
        </div>

        <form onSubmit={salvarPerfil} className="space-y-4">
          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Nome</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className="input-field" placeholder="Seu nome" style={{ fontSize: '0.9rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              <Building2 size={10} style={{ display: 'inline', marginRight: 4 }} />
              Nome da Empresa
            </label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} className="input-field" placeholder="Nome da sua empresa" style={{ fontSize: '0.9rem' }} />
            <p style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 4 }}>Aparece na sidebar e nos orçamentos gerados</p>
          </div>
          <button type="submit" disabled={savingPerfil} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            {savingPerfil ? 'Salvando…' : 'Salvar Perfil'}
          </button>
        </form>
      </motion.div>

      {/* Senha */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Lock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f6fc' }}>Alterar Senha</div>
            <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>Use uma senha forte com pelo menos 6 caracteres</div>
          </div>
        </div>

        <form onSubmit={salvarSenha} className="space-y-4">
          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Senha Atual</label>
            <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="input-field" placeholder="••••••••" style={{ fontSize: '0.9rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Nova Senha</label>
            <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="input-field" placeholder="••••••••" style={{ fontSize: '0.9rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Confirmar Nova Senha</label>
            <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} className="input-field" placeholder="••••••••" style={{ fontSize: '0.9rem' }} />
          </div>
          <button type="submit" disabled={savingSenha}
            style={{ padding: '0.6rem 1.5rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, color: '#8b5cf6', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.15)')}>
            {savingSenha ? 'Alterando…' : 'Alterar Senha'}
          </button>
        </form>
      </motion.div>

      {/* Info conta */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid #30363d', borderRadius: 10 }}>
        <div style={{ fontSize: '0.7rem', color: '#4a5568', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Informações da Conta</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>E-mail</div>
            <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>{session?.user?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>Plano</div>
            <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Ativo</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
