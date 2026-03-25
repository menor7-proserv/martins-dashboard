'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/',         label: 'Dashboard', icon: '📊' },
  { href: '/dre',      label: 'DRE',       icon: '📈' },
  { href: '/clientes', label: 'Clientes',  icon: '👷' },
  { href: '/despesas', label: 'Despesas',  icon: '💸' },
  { href: '/receber',  label: 'A Receber', icon: '📋' },
  { href: '/metas',    label: 'Metas',     icon: '🎯' },
]

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-56 bg-bg-card border-r border-neon-blue/10 flex flex-col z-50 transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="p-5 border-b border-neon-blue/10">
          <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Martins Pro Serv</div>
          <div className="neon-text font-bold text-lg leading-tight">Financeiro</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30 shadow-[0_0_10px_rgba(0,180,216,0.1)]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-neon-blue/10 text-xs text-text-dim text-center">
          v1.0 · SQLite Local
        </div>
      </aside>

      {/* Toggle button — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        title={open ? 'Recolher menu' : 'Abrir menu'}
        className="fixed top-4 z-[60] flex items-center justify-center w-8 h-8 rounded-lg text-neon-blue border border-neon-blue/40 bg-bg-card/90 backdrop-blur hover:border-neon-blue hover:shadow-[0_0_12px_rgba(0,180,216,0.35)] transition-all duration-300"
        style={{ left: open ? '13.5rem' : '0.75rem' }}
      >
        <span className="text-base leading-none select-none">
          {open ? '‹' : '›'}
        </span>
      </button>

      {/* Main content */}
      <main
        className="min-h-screen p-6 transition-all duration-300"
        style={{ marginLeft: open ? '14rem' : '0' }}
      >
        {children}
      </main>
    </>
  )
}
