# Frontend Redesign — Martins Pro Serv Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o frontend para nível enterprise (Power BI / OMIE style) com sidebar compacta de ícones, hero KPI card, area chart com gradiente, donut interativo e gauge semicircular animado.

**Architecture:** Atualização puramente visual — design tokens, componentes UI e páginas. Nenhuma rota de API, schema Prisma ou lógica de negócio é alterada. A shell (`ShellLayout`) recebe sidebar compacta com hover-expand e mobile drawer. Dois novos componentes criados (`HeroKpiCard`, `MiniGauge`), três atualizados (`KpiCard`, `RevenueChart`, `ExpensePieChart`), e `ProgressBar` removido.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Recharts v3, framer-motion v12, lucide-react (install needed), TypeScript 5.

**Spec:** `docs/superpowers/specs/2026-03-27-frontend-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/globals.css` | Modify | Design tokens âmbar, remover neon |
| `components/ui/ShellLayout.tsx` | Rewrite | Sidebar compacta hover-expand + mobile drawer |
| `components/ui/Sidebar.tsx` | Delete | Inline no ShellLayout, arquivo não usado |
| `components/ui/KpiCard.tsx` | Modify | Estilo enterprise + cores por token |
| `components/ui/HeroKpiCard.tsx` | Create | Hero card faturamento com contador animado |
| `components/ui/MiniGauge.tsx` | Create | Gauge SVG semicircular animado |
| `components/ui/ProgressBar.tsx` | Delete | Substituído por MiniGauge |
| `components/ui/NeonBadge.tsx` | Modify | Atualizar cores neon → âmbar |
| `components/charts/RevenueChart.tsx` | Rewrite | AreaChart com gradiente + empty state |
| `components/charts/ExpensePieChart.tsx` | Rewrite | Donut com hover + legenda + empty state |
| `app/page.tsx` | Rewrite | Novo layout hero + 3 cards + area + donut |
| `app/clientes/page.tsx` | Modify | Cores enterprise, remover neon |
| `app/despesas/page.tsx` | Modify | Cores enterprise, filtros âmbar |
| `app/receber/page.tsx` | Modify | Cores enterprise, badges prazo coloridos |
| `app/dre/page.tsx` | Modify | Cores enterprise, remover neon |
| `app/metas/page.tsx` | Rewrite | Usar MiniGauge, remover ProgressBar |

---

## Task 1: Instalar lucide-react + Atualizar Design System

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Instalar lucide-react**

No terminal do projeto:
```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard"
npm install lucide-react
```
Esperado: `added 1 package` sem erros.

- [ ] **Step 2: Substituir globals.css**

Reescrever `app/globals.css` com os novos tokens. Remover tudo relacionado a `neon-blue`, `neon-glow`, `neon-dim`, `neonPulse`. Adicionar tokens âmbar e superfícies corretas:

```css
@import "tailwindcss";

@theme {
  /* Cores accent */
  --color-accent-primary:   #f59e0b;
  --color-accent-secondary: #8b5cf6;
  --color-accent-green:     #10b981;
  --color-accent-red:       #ef4444;
  --color-accent-blue:      #3b82f6;
  --color-accent-cyan:      #06b6d4;
  --color-accent-gold:      #f59e0b;
  --color-accent-orange:    #fb923c;

  /* Backgrounds */
  --color-bg-primary:  #0d1117;
  --color-bg-card:     #161b22;
  --color-bg-surface:  #1f2937;
  --color-border:      #30363d;

  /* Texto */
  --color-text-primary: #f0f6fc;
  --color-text-muted:   #8b949e;
  --color-text-dim:     #4a5568;

  /* Animações */
  --animate-fade-in:  fadeIn 0.4s ease-out;
  --animate-slide-up: slideUp 0.4s ease-out;
  --animate-pulse-amber: pulseAmber 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulseAmber {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  background-color: #0d1117;
  color: #f0f6fc;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #161b22; }
::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #f59e0b; }

@layer components {
  .glass-card {
    background-color: rgba(22, 27, 34, 0.9);
    border: 1px solid #30363d;
    border-radius: 0.75rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }

  .glass-card-hover {
    background-color: rgba(22, 27, 34, 0.9);
    border: 1px solid #30363d;
    border-radius: 0.75rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    transition: transform 150ms ease-out, box-shadow 150ms ease-out;
    cursor: default;
  }

  .glass-card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.2);
  }

  .input-field {
    width: 100%;
    background-color: #1f2937;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    padding: 0.625rem 1rem;
    color: #f0f6fc;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-field::placeholder { color: #4a5568; }
  .input-field:focus {
    outline: none;
    border-color: rgba(245,158,11,0.6);
    box-shadow: 0 0 0 2px rgba(245,158,11,0.15);
  }

  .btn-primary {
    background-color: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.4);
    color: #f59e0b;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover {
    background-color: rgba(245,158,11,0.2);
    box-shadow: 0 0 12px rgba(245,158,11,0.2);
  }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-danger {
    background-color: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .btn-danger:hover { background-color: rgba(239,68,68,0.2); }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}
```

- [ ] **Step 3: Verificar build**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```
Esperado: `✓ Compiled successfully` (podem aparecer warnings de tipo, não erros de build).

---

## Task 2: ShellLayout — Sidebar Compacta com Hover-Expand e Mobile Drawer

**Files:**
- Rewrite: `components/ui/ShellLayout.tsx`
- Delete: `components/ui/Sidebar.tsx` (não é importado em nenhum lugar além do próprio arquivo)

- [ ] **Step 1: Reescrever ShellLayout.tsx**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Receipt, CreditCard,
  TrendingUp, Target, Menu, X
} from 'lucide-react'

const nav = [
  { href: '/',         label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes',   Icon: Users },
  { href: '/despesas', label: 'Despesas',   Icon: Receipt },
  { href: '/receber',  label: 'A Receber',  Icon: CreditCard },
  { href: '/dre',      label: 'DRE',        Icon: TrendingUp },
  { href: '/metas',    label: 'Metas',      Icon: Target },
]

function NavItems({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <>
      {nav.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group relative"
            style={active ? {
              background: 'rgba(245,158,11,0.12)',
              borderLeft: '3px solid #f59e0b',
              color: '#f59e0b',
              paddingLeft: '0.625rem',
            } : {
              color: '#8b949e',
              borderLeft: '3px solid transparent',
              paddingLeft: '0.625rem',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = '' }}
          >
            <Icon
              size={18}
              style={{ flexShrink: 0, color: active ? '#f59e0b' : '#8b949e' }}
            />
            <span
              className="sidebar-label whitespace-nowrap overflow-hidden"
              style={{ color: active ? '#f59e0b' : '#8b949e' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </>
  )
}

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Fechar drawer ao clicar fora
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  return (
    <>
      <style>{`
        .sidebar-desktop {
          position: fixed;
          left: 0; top: 0;
          height: 100vh;
          width: 52px;
          background: #161b22;
          border-right: 1px solid #30363d;
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow: hidden;
          transition: width 220ms ease-out;
        }
        .sidebar-desktop:hover {
          width: 220px;
        }
        .sidebar-desktop:hover .sidebar-label {
          opacity: 1;
          transform: translateX(0);
        }
        .sidebar-label {
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 180ms ease-out, transform 180ms ease-out;
        }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none; }
          .main-content    { margin-left: 0 !important; }
        }
      `}</style>

      {/* Sidebar desktop */}
      <aside className="sidebar-desktop">
        {/* Logo */}
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #30363d', flexShrink: 0, height: 56 }}>
          <div style={{
            width: 32, height: 32, background: '#f59e0b', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#0d1117', flexShrink: 0,
          }}>M</div>
          <span className="sidebar-label" style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>
            Martins Pro Serv
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItems pathname={pathname} />
        </nav>

        {/* Footer */}
        <div style={{ padding: '8px 6px', borderTop: '1px solid #30363d', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#4a5568', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span className="sidebar-label" style={{ opacity: 0 }}>v1.0 · SQLite Local</span>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12, zIndex: 60,
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: 8, padding: 6, cursor: 'pointer',
          color: '#f59e0b',
        }}
        className="md:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}>
          <div
            ref={overlayRef}
            style={{
              position: 'absolute', left: 0, top: 0, height: '100vh',
              width: 220, background: '#161b22', borderRight: '1px solid #30363d',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #30363d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#0d1117' }}>M</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>Martins Pro Serv</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <NavItems pathname={pathname} onClose={() => setMobileOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className="main-content min-h-screen p-6"
        style={{ marginLeft: 52 }}
      >
        {children}
      </main>
    </>
  )
}
```

- [ ] **Step 2: Deletar Sidebar.tsx**

O arquivo `components/ui/Sidebar.tsx` não é importado por nenhum outro arquivo (apenas se auto-define). Deletar:
```bash
rm "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard/components/ui/Sidebar.tsx"
```

- [ ] **Step 3: Build check**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```
Esperado: sucesso. Verificar visualmente em `http://localhost:3000` — sidebar deve aparecer com ícones, expandir ao hover, e o "M" âmbar deve estar visível.

---

## Task 3: KpiCard Atualizado + HeroKpiCard Novo

**Files:**
- Modify: `components/ui/KpiCard.tsx`
- Create: `components/ui/HeroKpiCard.tsx`
- Modify: `components/ui/NeonBadge.tsx`

- [ ] **Step 1: Atualizar KpiCard.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface KpiCardProps {
  label: string
  value: number
  format?: 'currency' | 'percent' | 'number'
  accentColor?: string
  icon?: React.ReactNode
  trend?: number
  loading?: boolean
}

function useCountUp(target: number, duration = 600) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let handle: number
    const frame = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(target * eased)
      if (progress < 1) handle = requestAnimationFrame(frame)
    }
    handle = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(handle)
  }, [target, duration])
  return current
}

export function KpiCard({
  label, value, format = 'currency',
  accentColor = '#3b82f6', icon, trend, loading = false,
}: KpiCardProps) {
  const animated = useCountUp(value)

  const display =
    format === 'currency' ? formatCurrency(animated) :
    format === 'percent'  ? formatPercent(animated)  :
    Math.round(animated).toLocaleString('pt-BR')

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse" style={{ borderTop: `2px solid ${accentColor}` }}>
        <div style={{ height: 10, background: '#30363d', borderRadius: 4, width: '60%', marginBottom: 12 }} />
        <div style={{ height: 28, background: '#30363d', borderRadius: 4, width: '80%', marginBottom: 8 }} />
        <div style={{ height: 8, background: '#30363d', borderRadius: 4, width: '40%' }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card-hover p-5"
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>
          {label}
        </span>
        {icon && <span style={{ color: accentColor, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc', lineHeight: 1.2, marginBottom: 4 }}>
        {display}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#8b949e' }}>
          {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          {Math.abs(trend).toFixed(1)}% vs mês anterior
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Criar HeroKpiCard.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

interface HeroKpiCardProps {
  value: number
  metaValue?: number
  trend?: number
  loading?: boolean
}

function useCountUp(target: number, duration = 600) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let handle: number
    const frame = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(target * eased)
      if (progress < 1) handle = requestAnimationFrame(frame)
    }
    handle = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(handle)
  }, [target, duration])
  return current
}

export function HeroKpiCard({ value, metaValue, trend, loading = false }: HeroKpiCardProps) {
  const animated = useCountUp(value)
  const pct = metaValue && metaValue > 0 ? Math.min((value / metaValue) * 100, 100) : 0

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse" style={{ borderLeft: '4px solid #f59e0b' }}>
        <div style={{ height: 10, background: '#30363d', borderRadius: 4, width: '30%', marginBottom: 16 }} />
        <div style={{ height: 48, background: '#30363d', borderRadius: 4, width: '60%', marginBottom: 12 }} />
        <div style={{ height: 6, background: '#30363d', borderRadius: 3, width: '100%' }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card-hover p-6"
      style={{ borderLeft: '4px solid #f59e0b' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 6 }}>
            Faturamento Mensal
          </div>
          <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#f0f6fc', lineHeight: 1, marginBottom: 8 }}>
            {formatCurrency(animated)}
          </div>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: trend >= 0 ? '#10b981' : '#ef4444' }}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trend).toFixed(1)}% vs mês anterior</span>
            </div>
          )}
        </div>
        {metaValue && metaValue > 0 && (
          <div style={{ textAlign: 'right', minWidth: 120 }}>
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Meta atingida</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginBottom: 6 }}>
              {pct.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
              de {formatCurrency(metaValue)}
            </div>
          </div>
        )}
      </div>
      {metaValue && metaValue > 0 && (
        <div style={{ marginTop: 16, height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            style={{ height: '100%', background: '#f59e0b', borderRadius: 2 }}
          />
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 3: Atualizar NeonBadge.tsx**

Substituir cores neon por âmbar/enterprise. Ler o arquivo atual primeiro, depois aplicar:

```tsx
'use client'

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  // Status
  ABERTA:    { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.4)',  text: '#f59e0b' },
  FECHADA:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.4)',  text: '#10b981' },
  RECEBIDO:  { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.4)',  text: '#10b981' },
  PAGO:      { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.4)',  text: '#10b981' },
  PENDENTE:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.4)',  text: '#f59e0b' },
  VENCIDO:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
  CANCELADO: { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.4)',  text: '#8b5cf6' },
  // Prazos
  AVISTA:    { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.4)',  text: '#10b981' },
  '7D':      { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.4)',  text: '#f59e0b' },
  '30D':     { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.5)',  text: '#fbbf24' },
  '60D':     { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c' },
  '90D':     { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
  // Categorias
  MATERIAL:    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' },
  MAO_DE_OBRA: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)', text: '#8b5cf6' },
  TRANSPORTE:  { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.4)', text: '#fb923c' },
  IMPOSTOS:    { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.4)',  text: '#ef4444' },
}

const DEFAULT = { bg: 'rgba(139,148,158,0.12)', border: 'rgba(139,148,158,0.3)', text: '#8b949e' }

export function NeonBadge({ label }: { label: string }) {
  const style = COLOR_MAP[label] ?? DEFAULT
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.125rem 0.5rem',
      borderRadius: 9999,
      fontSize: '0.65rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.text,
      whiteSpace: 'nowrap' as const,
    }}>
      {label.replace(/_/g, ' ')}
    </span>
  )
}
```

- [ ] **Step 4: Build check**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```

---

## Task 4: MiniGauge — Gauge SVG Semicircular Animado

**Files:**
- Create: `components/ui/MiniGauge.tsx`
- Delete: `components/ui/ProgressBar.tsx`

- [ ] **Step 1: Criar MiniGauge.tsx**

O arco semicircular usa `r=50`, centro `cx=60 cy=60`, `viewBox="0 0 120 70"`.
Comprimento do arco = `π × r` = `~157.08`. O `strokeDasharray` é `157 157`, e `strokeDashoffset` controla quanto aparece.

```tsx
'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/formatters'

interface MiniGaugeProps {
  label: string
  current: number
  target: number
  loading?: boolean
}

function getGaugeColor(pct: number): string {
  if (pct < 50) return '#ef4444'
  if (pct < 80) return '#f59e0b'
  return '#10b981'
}

export function MiniGauge({ label, current, target, loading = false }: MiniGaugeProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const arcLength = 157.08  // π × 50
  const offset = arcLength - (arcLength * pct) / 100
  const color = getGaugeColor(pct)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ width: 120, height: 70, background: '#1f2937', borderRadius: 8, margin: '0 auto' }} className="animate-pulse" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {label}
      </div>
      <svg viewBox="0 0 120 70" style={{ width: 140, height: 82, overflow: 'visible' }}>
        {/* Track */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="#30363d"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${arcLength}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
        {/* Percentage text */}
        <text
          x="60" y="52"
          textAnchor="middle"
          fill="#f0f6fc"
          fontSize="16"
          fontWeight="800"
        >
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.4 }}>
        <span style={{ color: '#f0f6fc', fontWeight: 700 }}>{formatCurrency(current)}</span>
        <span> / </span>
        <span>{formatCurrency(target)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Deletar ProgressBar.tsx**

```bash
rm "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard/components/ui/ProgressBar.tsx"
```

- [ ] **Step 3: Não executar build check ainda**

> **Nota:** NÃO rodar `npm run build` aqui. `ProgressBar` ainda é importado em `app/page.tsx` e `app/metas/page.tsx` — o build irá falhar até que essas páginas sejam atualizadas nas Tasks 6 e 8. Continue direto para a Task 5.

---

## Task 5: RevenueChart + ExpensePieChart Atualizados

**Files:**
- Rewrite: `components/charts/RevenueChart.tsx`
- Rewrite: `components/charts/ExpensePieChart.tsx`

- [ ] **Step 1: Reescrever RevenueChart.tsx**

```tsx
'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface DataPoint {
  mes: number; ano: number
  faturamento: number; despesas: number; lucro: number
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#161b22', border: '1px solid #30363d',
      borderRadius: 8, padding: '0.75rem', fontSize: 12,
    }}>
      <p style={{ color: '#8b949e', marginBottom: 8, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: R$ {(p.value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: '0.875rem' }}>
        Sem dados históricos
      </div>
    )
  }

  const chartData = data.map(d => ({
    name: `${MESES[d.mes - 1]}/${String(d.ano).slice(2)}`,
    Faturamento: d.faturamento,
    Despesas: d.despesas,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" stroke="transparent" tick={{ fontSize: 11, fill: '#8b949e' }} />
        <YAxis stroke="transparent" tick={{ fontSize: 11, fill: '#8b949e' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
        <Area
          type="monotone" dataKey="Faturamento"
          stroke="#f59e0b" strokeWidth={2}
          fill="url(#gradFat)"
          dot={false}
          activeDot={{ r: 4, fill: '#f59e0b' }}
          animationDuration={1200}
        />
        <Area
          type="monotone" dataKey="Despesas"
          stroke="#8b5cf6" strokeWidth={1.5}
          strokeDasharray="4 2"
          fill="url(#gradDesp)"
          dot={false}
          activeDot={{ r: 3, fill: '#8b5cf6' }}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Reescrever ExpensePieChart.tsx**

```tsx
'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/formatters'

const PALETTE = ['#f59e0b','#8b5cf6','#10b981','#3b82f6','#ef4444','#06b6d4']

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.625rem', fontSize: 12 }}>
      <p style={{ color: '#f0f6fc', fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

export function ExpensePieChart({ data }: { data: { categoria: string; _sum: { valor: number | null } }[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = data
    .map((d, i) => ({
      name: d.categoria.replace(/_/g, ' '),
      value: d._sum.valor ?? 0,
      fill: PALETTE[i % PALETTE.length],
    }))
    .filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
        <svg viewBox="0 0 80 80" style={{ width: 60, height: 60 }}>
          <circle cx="40" cy="40" r="30" fill="none" stroke="#30363d" strokeWidth="10" />
        </svg>
        <span style={{ color: '#4a5568', fontSize: '0.8rem' }}>Sem despesas no período</span>
      </div>
    )
  }

  const total = chartData.reduce((s, d) => s + d.value, 0)

  const CenterLabel = ({ viewBox }: any) => {
    if (!viewBox) return null
    const { cx, cy } = viewBox
    return (
      <>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0f6fc" fontSize="12" fontWeight="700">
          Total
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="800">
          {(total / 1000).toFixed(1)}K
        </text>
      </>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={55}
            outerRadius={activeIndex !== null ? undefined : 80}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            label={<CenterLabel />}
            labelLine={false}
            activeIndex={activeIndex ?? undefined}
            activeShape={{ outerRadius: 88 }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.fill}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda lateral */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chartData.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, flexShrink: 0 }} />
            <span style={{ color: '#8b949e', flex: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {d.name}
            </span>
            <span style={{ color: '#f0f6fc', fontWeight: 700 }}>
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Build check**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```

---

## Task 6: Dashboard Principal (app/page.tsx)

**Files:**
- Rewrite: `app/page.tsx`

Esta é a página principal. Remove o import de `ProgressBar`, usa `HeroKpiCard`, `MiniGauge`, novo `KpiCard`, `RevenueChart` e `ExpensePieChart`.

- [ ] **Step 1: Reescrever app/page.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HeroKpiCard } from '@/components/ui/HeroKpiCard'
import { KpiCard } from '@/components/ui/KpiCard'
import { MiniGauge } from '@/components/ui/MiniGauge'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { ExportButton } from '@/components/ui/ExportButton'
import { formatCurrency } from '@/lib/formatters'
import { Receipt, TrendingDown, TrendingUp } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const PRAZO_ORDER = ['AVISTA', '7D', '30D', '60D', '90D']

const cardVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariant = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function DashboardPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setData(null)
    setError(false)
    fetch(`/api/dashboard?mes=${mes}&ano=${ano}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true))
  }, [mes, ano])

  const loading = !data && !error
  const totalReceber = data?.contasAReceber.reduce((s: number, c: any) => s + (c._sum.valor ?? 0), 0) ?? 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc', lineHeight: 1.2 }}>
            Dashboard Financeiro
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>
            Martins Pro Serv · Esquadrias &amp; Vidraçaria
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={`${mes}-${ano}`}
            onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
            className="input-field"
            style={{ width: 160, fontSize: '0.85rem' }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1
              return <option key={m} value={`${m}-${ano}`}>{MESES[i]} {ano}</option>
            })}
          </select>
          <ExportButton mes={mes} ano={ano} />
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem' }}>
          Erro ao carregar dados. Verifique a conexão e tente novamente.
        </div>
      )}

      {/* Hero Card */}
      <HeroKpiCard
        value={data?.faturamento ?? 0}
        metaValue={data?.meta?.metaFaturamento}
        loading={loading}
      />

      {/* 3 KPI secundários */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={itemVariant}>
          <KpiCard
            label="Despesas"
            value={data?.despesas ?? 0}
            accentColor="#8b5cf6"
            icon={<TrendingDown size={16} />}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariant}>
          <KpiCard
            label="Lucro Líquido"
            value={data?.lucro ?? 0}
            accentColor="#10b981"
            icon={<TrendingUp size={16} />}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariant}>
          <KpiCard
            label="Margem"
            value={data?.margem ?? 0}
            format="percent"
            accentColor="#3b82f6"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>
            Histórico 6 Meses
          </h2>
          <RevenueChart data={data?.historico ?? []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>
            Despesas por Categoria
          </h2>
          <ExpensePieChart data={data?.despesasPorCategoria ?? []} />
        </motion.div>
      </div>

      {/* Bottom row: Contas a Receber + Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contas a Receber */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-hover p-5"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e' }}>
              Contas a Receber
            </h2>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
              {formatCurrency(totalReceber)}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRAZO_ORDER.map(prazo => {
              const entry = data?.contasAReceber.find((c: any) => c.prazo === prazo)
              const valor = entry?._sum?.valor ?? 0
              const pct = totalReceber > 0 ? (valor / totalReceber) * 100 : 0
              return (
                <div key={prazo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <NeonBadge label={prazo} />
                  <div style={{ flex: 1, height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      style={{ height: '100%', background: '#f59e0b', borderRadius: 2 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#8b949e', width: 30, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                  <span style={{ fontSize: '0.7rem', color: '#f0f6fc', width: 80, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(valor)}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Metas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card-hover p-5"
        >
          <h2 style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 16 }}>
            Metas de {MESES[mes-1]}
          </h2>
          {data?.meta ? (
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16 }}>
              <MiniGauge
                label="Faturamento"
                current={data.faturamento}
                target={data.meta.metaFaturamento}
              />
              <MiniGauge
                label="Lucro Líquido"
                current={data.lucro}
                target={data.meta.metaLucro}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: '#4a5568', fontSize: '0.875rem', marginBottom: 8 }}>
                Nenhuma meta definida para este mês.
              </p>
              <a href="/metas" style={{ color: '#f59e0b', fontSize: '0.875rem', textDecoration: 'none' }}>
                Definir metas →
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```
Esperado: sucesso. O erro de `ProgressBar` não deve mais aparecer (foi removido do import).

---

## Task 7: Páginas Secundárias — Clientes, Despesas, A Receber

**Files:**
- Modify: `app/clientes/page.tsx`
- Modify: `app/despesas/page.tsx`
- Modify: `app/receber/page.tsx`

- [ ] **Step 1: Atualizar app/clientes/page.tsx**

Substituir cores neon por âmbar. Mudanças pontuais (não reescrever lógica):

1. Remover import de `NeonBadge` se for reimportado — já está importado, manter.
2. Trocar `text-neon-blue` por inline `color: '#f59e0b'`
3. Trocar `border: '1px solid rgba(0,180,216,0.3)'` por `border: '1px solid rgba(245,158,11,0.3)'`
4. Trocar `background: 'rgba(0,180,216,0.15)'` por `background: 'rgba(245,158,11,0.12)'`
5. Trocar `color: '#00b4d8'` (neon) por `color: '#f59e0b'`
6. Trocar botão de deletar: `color: 'rgba(255,77,109,0.5)'` → manter (já é vermelho — OK)
7. O avatar da inicial do cliente: trocar background/border neon por âmbar

Versão completa:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClienteForm } from '@/components/forms/ClienteForm'
import { PagamentoForm } from '@/components/forms/PagamentoForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/clientes')
    setClientes(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const marcarRecebido = async (pagId: number) => {
    await fetch(`/api/pagamentos/${pagId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEBIDO' }),
    })
    load()
  }

  const deletarCliente = async (id: number) => {
    if (!confirm('Remover cliente e todas as obras?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Clientes &amp; Obras</h1>
        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Gerencie obras e recebimentos por cliente</p>
      </div>

      <ClienteForm onSuccess={load} />

      <div className="space-y-3">
        {clientes.map((cliente, i) => {
          const totalObras = cliente.obras.reduce((s: number, o: any) => s + o.valorTotal, 0)
          const totalPendente = cliente.obras.flatMap((o: any) => o.pagamentos)
            .filter((p: any) => p.status === 'PENDENTE')
            .reduce((s: number, p: any) => s + p.valor, 0)

          return (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => setExpanded(expanded === cliente.id ? null : cliente.id)}
              >
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b',
                  }}>
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>{cliente.nome}</div>
                    {cliente.telefone && <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{cliente.telefone}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(totalObras)}</div>
                    {totalPendente > 0 && <div style={{ fontSize: '0.75rem', color: '#fb923c' }}>{formatCurrency(totalPendente)} pendente</div>}
                  </div>
                  {expanded === cliente.id ? <ChevronUp size={16} color="#8b949e" /> : <ChevronDown size={16} color="#8b949e" />}
                  <button
                    onClick={e => { e.stopPropagation(); deletarCliente(cliente.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.5)')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === cliente.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: '1px solid #30363d', overflow: 'hidden' }}
                  >
                    <div className="p-4 space-y-4">
                      {cliente.obras.map((obra: any) => (
                        <div key={obra.id} style={{ background: '#1f2937', borderRadius: 8, padding: 12 }}>
                          <div className="flex items-center justify-between mb-2">
                            <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.875rem' }}>{obra.descricao}</div>
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(obra.valorTotal)}</span>
                              <NeonBadge label={obra.status} />
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#4a5568', marginBottom: 8 }}>{formatDate(obra.data)}</div>
                          <div className="space-y-1.5">
                            {obra.pagamentos.map((p: any) => (
                              <div key={p.id} className="flex items-center gap-2 text-xs">
                                <NeonBadge label={p.prazo} />
                                <NeonBadge label={p.status} />
                                <span style={{ color: '#8b949e' }}>{formatCurrency(p.valor)}</span>
                                <span style={{ color: '#4a5568' }}>venc. {formatDate(p.vencimento)}</span>
                                {p.status === 'PENDENTE' && (
                                  <button
                                    onClick={() => marcarRecebido(p.id)}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#10b981', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                                  >✓ Recebido</button>
                                )}
                              </div>
                            ))}
                          </div>
                          <PagamentoForm obraId={obra.id} onSuccess={load} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
        {clientes.length === 0 && (
          <div className="glass-card p-10 text-center" style={{ color: '#4a5568', fontSize: '0.875rem' }}>
            Nenhum cliente cadastrado ainda. Adicione a primeira obra acima.
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Atualizar app/despesas/page.tsx**

Trocar todas as referências a neon-blue/azul por âmbar. Filtro ativo usa âmbar. Botão deletar usa Trash2:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DespesaForm } from '@/components/forms/DespesaForm'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Trash2 } from 'lucide-react'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CATEGORIAS = ['', 'MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'IMPOSTOS']

export default function DespesasPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [despesas, setDespesas] = useState<any[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const load = useCallback(async () => {
    const url = `/api/despesas?mes=${mes}&ano=${ano}${filtroCategoria ? `&categoria=${filtroCategoria}` : ''}`
    setDespesas(await (await fetch(url)).json())
  }, [mes, ano, filtroCategoria])

  useEffect(() => { load() }, [load])

  const deletar = async (id: number) => {
    await fetch(`/api/despesas/${id}`, { method: 'DELETE' })
    load()
  }

  const total = despesas.reduce((s, d) => s + d.valor, 0)
  const porCategoria = despesas.reduce((acc: Record<string,number>, d) => {
    acc[d.categoria] = (acc[d.categoria] ?? 0) + d.valor
    return acc
  }, {})
  const pieData = Object.entries(porCategoria).map(([categoria, valor]) => ({ categoria, _sum: { valor } }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Despesas</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>
            Total do período: <span style={{ color: '#ef4444', fontWeight: 800 }}>{formatCurrency(total)}</span>
          </p>
        </div>
        <select
          value={`${mes}-${ano}`}
          onChange={e => { const [m,a] = e.target.value.split('-'); setMes(+m); setAno(+a) }}
          className="input-field"
          style={{ width: 144, fontSize: '0.85rem' }}
        >
          {MESES.map((m, i) => <option key={i} value={`${i+1}-${ano}`}>{m} {ano}</option>)}
        </select>
      </div>

      <DespesaForm onSuccess={load} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div style={{ gridColumn: 'span 2' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                style={{
                  fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                  borderRadius: 6,
                  border: filtroCategoria === cat ? '1px solid rgba(245,158,11,0.6)' : '1px solid #30363d',
                  color: filtroCategoria === cat ? '#f59e0b' : '#8b949e',
                  background: filtroCategoria === cat ? 'rgba(245,158,11,0.1)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {cat || 'Todas'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {despesas.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card px-4 py-3 flex items-center gap-3"
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <NeonBadge label={d.categoria} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#f0f6fc' }}>{d.descricao}</span>
                <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>{formatDate(d.data)}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(d.valor)}</span>
                <button
                  onClick={() => deletar(d.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
            {despesas.length === 0 && (
              <div className="glass-card p-8 text-center" style={{ color: '#4a5568', fontSize: '0.875rem' }}>
                Nenhuma despesa no período
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 12, fontWeight: 600 }}>
            Por Categoria
          </h3>
          <ExpensePieChart data={pieData} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(porCategoria).map(([cat, val]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <NeonBadge label={cat} />
                <span style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 600 }}>{formatCurrency(val as number)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Atualizar app/receber/page.tsx**

Trocar neon-blue por âmbar nos filtros e valores de destaque:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'

const PRAZO_ORDER = ['AVISTA', '7D', '30D', '60D', '90D']

export default function ReceberPage() {
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [filtro, setFiltro] = useState<'PENDENTE' | 'RECEBIDO' | ''>('PENDENTE')

  const load = useCallback(async () => {
    setPagamentos(await (await fetch('/api/pagamentos')).json())
  }, [])

  useEffect(() => { load() }, [load])

  const marcar = async (id: number, status: string) => {
    await fetch(`/api/pagamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const hoje = new Date()
  const filtrados = pagamentos.filter(p => filtro ? p.status === filtro : true)
  const totalPendente = pagamentos.filter(p => p.status === 'PENDENTE').reduce((s, p) => s + p.valor, 0)
  const vencidos = pagamentos.filter(p => p.status === 'PENDENTE' && new Date(p.vencimento) < hoje)

  const porPrazo = PRAZO_ORDER.reduce((acc, prazo) => {
    acc[prazo] = filtrados.filter(p => p.prazo === prazo)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Contas a Receber</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>
            Pendente: <span style={{ color: '#f59e0b', fontWeight: 800 }}>{formatCurrency(totalPendente)}</span>
            {vencidos.length > 0 && (
              <span style={{ color: '#ef4444', marginLeft: 12, fontWeight: 600 }}>
                ⚠ {vencidos.length} vencido(s)
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['PENDENTE', 'RECEBIDO', ''] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                borderRadius: 6,
                border: filtro === f ? '1px solid rgba(245,158,11,0.6)' : '1px solid #30363d',
                color: filtro === f ? '#f59e0b' : '#8b949e',
                background: filtro === f ? 'rgba(245,158,11,0.1)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {f || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {PRAZO_ORDER.map(prazo => {
        const items = porPrazo[prazo]
        if (!items || items.length === 0) return null
        const subtotal = items.reduce((s, p) => s + p.valor, 0)
        return (
          <div key={prazo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <NeonBadge label={prazo} />
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{items.length} pagamento(s)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f0f6fc', marginLeft: 'auto' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="space-y-2">
              {items.map((p, i) => {
                const vencido = p.status === 'PENDENTE' && new Date(p.vencimento) < hoje
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card px-4 py-3 flex items-center gap-3"
                    style={vencido ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc' }}>{p.obra?.cliente?.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{p.obra?.descricao}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>venc. {formatDate(p.vencimento)}</span>
                    {vencido && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>VENCIDO</span>}
                    <NeonBadge label={p.status} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(p.valor)}</span>
                    {p.status === 'PENDENTE' && (
                      <button onClick={() => marcar(p.id, 'RECEBIDO')} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                        ✓ Recebido
                      </button>
                    )}
                    {p.status === 'RECEBIDO' && (
                      <button
                        onClick={() => marcar(p.id, 'PENDENTE')}
                        style={{ fontSize: '0.75rem', color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer' }}
                      >↩</button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
      {filtrados.length === 0 && (
        <div className="glass-card p-10 text-center" style={{ color: '#4a5568', fontSize: '0.875rem' }}>
          Nenhum pagamento encontrado
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Build check**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```

---

## Task 8: Páginas Secundárias — DRE e Metas

**Files:**
- Modify: `app/dre/page.tsx`
- Rewrite: `app/metas/page.tsx`

- [ ] **Step 1: Atualizar app/dre/page.tsx**

Trocar todas as ocorrências de cores neon por tokens âmbar/enterprise. Mudanças pontuais:

- `text-neon-blue` → `style={{ color: '#f59e0b' }}`
- `border border-neon-blue/30 shadow-[0_0_20px_rgba(0,180,216,0.1)]` no resultado final → `style={{ borderColor: 'rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.08)' }}`
- `neon-text` className → `style={{ color: '#f59e0b' }}`
- No `colorClass` de `DreRow`: trocar `'text-neon-blue'` por inline `color: '#f59e0b'`
- No `Section` title para "Receita": trocar `color="text-neon-blue"` para `color="text-amber-400"` ou inline
- Nos `KPIs rápidos`, trocar `text-neon-blue` por `color: '#f59e0b'`
- Na tabela histórica: `text-neon-blue` para Receita → `color: '#f59e0b'`
- Nos gráficos `Line`: trocar `stroke="#00b4d8"` por `stroke="#f59e0b"`, `stroke="#b56bff"` por `stroke="#8b5cf6"`, `stroke="#00f5a0"` por `stroke="#10b981"`
- `contentStyle` do Tooltip: `border: '1px solid rgba(0,180,216,0.2)'` → `border: '1px solid #30363d'`

A versão completa de `app/dre/page.tsx` (apenas com as mudanças de cor, toda lógica preservada):

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface DreMes {
  mes: number; ano: number; qtdObras: number
  receitaBruta: number; impostos: number; receitaLiquida: number
  material: number; maoDeObra: number; custoServicos: number
  lucroBruto: number; margemBruta: number
  transporte: number; despesasOp: number; lucroOp: number; margemOp: number
  lucroLiquido: number; margemLiquida: number
}
interface DreData { atual: DreMes; historico: DreMes[] }

function DreRow({ label, value, indent = false, bold = false, highlight, percent }: {
  label: string; value: number; indent?: boolean; bold?: boolean
  highlight?: 'green' | 'red' | 'amber' | 'purple'; percent?: number
}) {
  const neg = value < 0
  const color =
    highlight === 'green'  ? '#10b981' :
    highlight === 'red'    ? '#ef4444' :
    highlight === 'amber'  ? '#f59e0b' :
    highlight === 'purple' ? '#8b5cf6' :
    neg ? '#ef4444' : '#f0f6fc'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: bold ? '1px solid rgba(255,255,255,0.06)' : 'none', marginTop: bold ? 4 : 0 }}>
      <span style={{ fontSize: '0.875rem', paddingLeft: indent ? 24 : 0, color: bold ? '#f0f6fc' : '#8b949e', fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {percent !== undefined && (
          <span style={{
            fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4,
            background: percent >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${percent >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: percent >= 0 ? '#10b981' : '#ef4444',
          }}>
            {percent >= 0 ? '+' : ''}{percent.toFixed(1)}%
          </span>
        )}
        <span style={{ fontSize: bold ? '1rem' : '0.875rem', fontFamily: 'monospace', fontWeight: bold ? 700 : 400, color }}>
          {formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  )
}

function Section({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 mb-4">
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, color: accentColor }}>{title}</div>
      {children}
    </div>
  )
}

export default function DrePage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [data, setData] = useState<DreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dre?mes=${mes}&ano=${ano}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [mes, ano])

  const d = data?.atual
  const anos = [now.getFullYear(), now.getFullYear() - 1]

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>DRE</h1>
          <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: 2 }}>Demonstrativo de Resultado do Exercício</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={mes} onChange={e => setMes(+e.target.value)} className="input-field" style={{ width: 128, fontSize: '0.875rem' }}>
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={ano} onChange={e => setAno(+e.target.value)} className="input-field" style={{ width: 96, fontSize: '0.875rem' }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading || !d ? (
        <div className="glass-card p-12 text-center animate-pulse" style={{ color: '#8b949e' }}>Carregando DRE...</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* KPIs rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Receita Bruta',  value: d.receitaBruta, color: '#f59e0b',  suffix: `${d.qtdObras} obras` },
              { label: 'Lucro Bruto',    value: d.lucroBruto,   color: '#10b981',  suffix: `Margem ${formatPercent(d.margemBruta)}` },
              { label: 'Lucro Operac.', value: d.lucroOp,       color: '#8b5cf6',  suffix: `Margem ${formatPercent(d.margemOp)}` },
              { label: 'Lucro Líquido', value: d.lucroLiquido,  color: d.lucroLiquido >= 0 ? '#10b981' : '#ef4444', suffix: `Margem ${formatPercent(d.margemLiquida)}` },
            ].map(k => (
              <div key={k.label} className="glass-card p-4">
                <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: k.color }}>{formatCurrency(k.value)}</div>
                <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: 4 }}>{k.suffix}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Section title="Receita" accentColor="#f59e0b">
                <DreRow label="(+) Receita Bruta de Serviços" value={d.receitaBruta} />
                <DreRow label="(-) Impostos" value={-d.impostos} indent />
                <DreRow label="(=) Receita Líquida" value={d.receitaLiquida} bold highlight="amber" />
              </Section>

              <Section title="Custos dos Serviços" accentColor="#8b5cf6">
                <DreRow label="(-) Material" value={-d.material} indent />
                <DreRow label="(-) Mão de Obra" value={-d.maoDeObra} indent />
                <DreRow label="(=) Lucro Bruto" value={d.lucroBruto} bold highlight={d.lucroBruto >= 0 ? 'green' : 'red'} percent={d.margemBruta} />
              </Section>

              <Section title="Despesas Operacionais" accentColor="#fb923c">
                <DreRow label="(-) Transporte" value={-d.transporte} indent />
                <DreRow label="(=) Lucro Operacional" value={d.lucroOp} bold highlight={d.lucroOp >= 0 ? 'green' : 'red'} percent={d.margemOp} />
              </Section>

              <div className="glass-card p-5" style={{ borderColor: 'rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, color: '#f59e0b' }}>
                  Resultado Final
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#f0f6fc' }}>Lucro Líquido do Exercício</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 8px', borderRadius: 4, fontWeight: 700,
                      background: d.margemLiquida >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${d.margemLiquida >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: d.margemLiquida >= 0 ? '#10b981' : '#ef4444',
                    }}>
                      {d.margemLiquida >= 0 ? '+' : ''}{d.margemLiquida.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: d.lucroLiquido >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(d.lucroLiquido)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card p-4" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 12 }}>
                  Evolução 6 meses
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data?.historico.map(h => ({
                    name: `${MESES[h.mes-1]}/${String(h.ano).slice(2)}`,
                    'Receita': h.receitaBruta,
                    'Lucro Bruto': h.lucroBruto,
                    'Líquido': h.lucroLiquido,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: unknown) => formatCurrency(v as number)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Receita"     stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Lucro Bruto" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Líquido"     stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-4">
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 10 }}>
                  Histórico Mensal
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#4a5568', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 500 }}>Mês</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Receita</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>L. Bruto</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Líquido</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Mg%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.historico.map(h => (
                        <tr key={`${h.mes}-${h.ano}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <td style={{ padding: '6px 0', color: '#8b949e' }}>{MESES[h.mes-1]}/{h.ano}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: '#f59e0b' }}>{formatCurrency(h.receitaBruta)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: h.lucroBruto >= 0 ? '#8b5cf6' : '#ef4444' }}>{formatCurrency(h.lucroBruto)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: h.lucroLiquido >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(h.lucroLiquido)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: h.margemLiquida >= 0 ? '#10b981' : '#ef4444' }}>{h.margemLiquida.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Reescrever app/metas/page.tsx**

Remove `ProgressBar`, usa `MiniGauge`. Toda lógica de formulário preservada:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MiniGauge } from '@/components/ui/MiniGauge'
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
            <button
              type="submit"
              className="btn-primary w-full"
              style={saved ? { background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' } : {}}
            >
              {saved ? '✓ Salvo!' : 'Salvar Meta'}
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
```

- [ ] **Step 3: Build final**

```bash
cd "C:/Users/HOME/Downloads/CLAUDE CODE/martins-dashboard" && npm run build
```
Esperado: `✓ Compiled successfully` sem erros. Verificar visualmente todas as páginas em `http://localhost:3000`.

- [ ] **Step 4: Verificação visual checklist**

Abrir `http://localhost:3000` e verificar:
- [ ] Sidebar mostra ícone "M" âmbar, sem labels
- [ ] Ao hover na sidebar, expande para 220px com labels visíveis
- [ ] Dashboard: hero card com faturamento grande e contador animado
- [ ] 3 cards secundários com border-top colorida (roxo, verde, azul)
- [ ] Area chart com gradiente âmbar e linha roxa tracejada
- [ ] Donut chart com legenda lateral e hover interativo
- [ ] Seção metas com gauges semicirculares animados
- [ ] `/clientes`, `/despesas`, `/receber`, `/dre`, `/metas` sem cores neon-blue
- [ ] Mobile (<768px): sidebar some, hamburger aparece

---

## Notas de Implementação

- **`lucide-react`**: deve ser instalado antes de qualquer outra task (Task 1)
- **ProgressBar deletado**: não deletar antes da Task 4 — se deletar na Task 4 e ainda não tiver feito as Tasks 6 e 8, o build vai falhar. Opção: deletar somente após completar Tasks 6 e 8.
- **Sidebar.tsx**: arquivo existe mas não é importado em nenhum lugar — pode ser deletado com segurança.
- **`defs`, `linearGradient`, `stop`** no Recharts: importar normalmente via `recharts`, não como named exports separados — eles são JSX components.
- **`useCountUp` duplicado**: aparece em `KpiCard.tsx` e `HeroKpiCard.tsx` — YAGNI, manter duplicado (pequena função, sem dependências compartilhadas).
