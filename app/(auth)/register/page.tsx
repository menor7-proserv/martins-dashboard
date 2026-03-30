'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [empresa, setEmpresa] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nome, empresa }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao criar conta')
      setLoading(false)
      return
    }

    await signIn('credentials', { email, password, redirect: false })
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, left: -60, width: 320, height: 320, background: 'radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, right: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: '15%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '3px' }}>MARTINS PRO SERV</div>
          <div style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 4 }}>Criar sua conta</div>
        </div>

        <form onSubmit={submit} style={{
          background: 'rgba(22,27,34,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 28,
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f6fc', textAlign: 'center' }}>
            Criar conta
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: '#ef4444', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Nome da empresa *</label>
            <input required value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ex: Martins Pro Serv" className="input-field" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Seu nome *</label>
            <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="João Martins" className="input-field" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>E-mail *</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@empresa.com" className="input-field" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Senha *</label>
            <input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="input-field" style={{ width: '100%' }} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#4a5568' }}>
            Já tem conta?{' '}
            <a href="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>
              Entrar →
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
