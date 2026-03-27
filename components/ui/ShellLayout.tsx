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
            className={`nav-link-hover${active ? ' nav-link-active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group relative`}
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
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  // Close drawer on outside click, but skip if the click is on the hamburger button
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        !hamburgerRef.current?.contains(e.target as Node)
      ) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  return (
    <>
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
            <span className="sidebar-label">v1.0 · SQLite Local</span>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        ref={hamburgerRef}
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12, zIndex: 60,
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: 8, padding: 6, cursor: 'pointer',
          color: '#f59e0b',
        }}
        className="mobile-menu-btn"
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
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
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}
                aria-label="Fechar menu"
              >
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
