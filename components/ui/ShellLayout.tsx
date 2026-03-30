'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Receipt, CreditCard,
  TrendingUp, Target, Menu, X, LogOut, ChevronRight,
  Building2
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { href: '/',        label: 'Dashboard',  Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { href: '/clientes', label: 'Clientes & Obras', Icon: Users },
      { href: '/receber',  label: 'A Receber',        Icon: CreditCard },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/despesas', label: 'Despesas',  Icon: Receipt },
      { href: '/dre',      label: 'DRE',       Icon: TrendingUp },
      { href: '/metas',    label: 'Metas',     Icon: Target },
    ],
  },
]

function SidebarContent({
  pathname,
  expanded,
  session,
  onClose,
}: {
  pathname: string
  expanded: boolean
  session: any
  onClose?: () => void
}) {
  const empresaLetra = session?.user?.empresa?.charAt(0).toUpperCase() ?? 'M'
  const empresaNome  = session?.user?.empresa  ?? 'Martins Pro Serv'
  const userName     = session?.user?.name     ?? ''

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>

      {/* ── Logo / Brand ── */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        gap: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 16,
          color: '#0d1117',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
        }}>
          {empresaLetra}
        </div>
        {expanded && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#f0f6fc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>
              {empresaNome}
            </div>
            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 1 }}>
              Dashboard Financeiro
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>

            {/* Section label */}
            {expanded && (
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4a5568',
                padding: '10px 12px 4px',
                whiteSpace: 'nowrap',
              }}>
                {group.label}
              </div>
            )}
            {!expanded && gi > 0 && (
              <div style={{
                height: 1,
                background: 'rgba(255,255,255,0.05)',
                margin: '8px 10px',
              }} />
            )}

            {/* Items */}
            {group.items.map(({ href, label, Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  title={!expanded ? label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: expanded ? '10px 12px' : '11px 0',
                    justifyContent: expanded ? 'flex-start' : 'center',
                    borderRadius: 8,
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'background 0.15s',
                    background: active
                      ? 'rgba(245,158,11,0.1)'
                      : 'transparent',
                    borderLeft: active && expanded
                      ? '3px solid #f59e0b'
                      : active && !expanded
                      ? 'none'
                      : '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  {/* Active dot (collapsed) */}
                  {active && !expanded && (
                    <div style={{
                      position: 'absolute',
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 20,
                      borderRadius: 99,
                      background: '#f59e0b',
                    }} />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                    style={{ flexShrink: 0, color: active ? '#f59e0b' : '#6b7280' }}
                  />

                  {expanded && (
                    <span style={{
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#f0f6fc' : '#9ca3af',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      letterSpacing: '-0.01em',
                    }}>
                      {label}
                    </span>
                  )}

                  {expanded && active && (
                    <ChevronRight size={14} style={{ color: '#f59e0b', opacity: 0.7 }} />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: expanded ? '12px 10px' : '12px 0',
        flexShrink: 0,
        display: 'flex',
        justifyContent: expanded ? 'flex-start' : 'center',
      }}>
        {expanded ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 10px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))',
              border: '1px solid rgba(245,158,11,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#f59e0b',
              flexShrink: 0,
            }}>
              {userName.charAt(0).toUpperCase() || empresaLetra}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </div>
              <div style={{ fontSize: 11, color: '#4a5568', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {empresaNome}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sair"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4a5568',
                padding: '4px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#ef4444'
                el.style.background = 'rgba(239,68,68,0.08)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#4a5568'
                el.style.background = 'none'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sair"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4a5568',
              padding: '10px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = '#ef4444'
              el.style.background = 'rgba(239,68,68,0.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = '#4a5568'
              el.style.background = 'none'
            }}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        !hamburgerRef.current?.contains(e.target as Node)
      ) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setExpanded(true), 80)
  }
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setExpanded(false)
  }

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          left: 0, top: 0,
          height: '100vh',
          width: expanded ? 260 : 68,
          background: '#0f1117',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          overflow: 'hidden',
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: expanded ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
        }}
        className="sidebar-desktop-new"
      >
        <SidebarContent
          pathname={pathname}
          expanded={expanded}
          session={session}
        />
      </aside>

      {/* ── Mobile hamburger ── */}
      <button
        ref={hamburgerRef}
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: 14, left: 14, zIndex: 60,
          background: '#161b22',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '7px',
          cursor: 'pointer',
          color: '#f59e0b',
        }}
        className="mobile-menu-btn"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}>
          <div
            ref={overlayRef}
            style={{
              position: 'absolute', left: 0, top: 0,
              height: '100vh', width: 260,
              background: '#0f1117',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, padding: 6,
                cursor: 'pointer', color: '#8b949e',
                zIndex: 1,
              }}
            >
              <X size={16} />
            </button>
            <SidebarContent
              pathname={pathname}
              expanded={true}
              session={session}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main
        className="main-content min-h-screen"
        style={{
          marginLeft: 68,
          padding: '28px 32px',
          transition: 'margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </main>
    </>
  )
}
