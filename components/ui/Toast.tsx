'use client'

import { createContext, useContext, useCallback, useRef, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: { bg: '#0d1a14',  border: 'rgba(16,185,129,0.3)',  icon: '#10b981', iconBg: 'rgba(16,185,129,0.12)' },
  error:   { bg: '#1a0d0d',  border: 'rgba(239,68,68,0.35)',  icon: '#ef4444', iconBg: 'rgba(239,68,68,0.12)'  },
  warning: { bg: '#1a150d',  border: 'rgba(245,158,11,0.35)', icon: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)' },
  info:    { bg: '#0d1220',  border: 'rgba(59,130,246,0.35)', icon: '#3b82f6', iconBg: 'rgba(59,130,246,0.12)' },
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const ctx: ToastContextValue = {
    toast,
    success: (t, m) => toast('success', t, m),
    error:   (t, m) => toast('error',   t, m),
    warning: (t, m) => toast('warning', t, m),
    info:    (t, m) => toast('info',    t, m),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Portal */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                minWidth: 280,
                maxWidth: 360,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                pointerEvents: 'all',
                animation: 'toastIn 0.25s ease-out',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: c.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.icon,
                flexShrink: 0,
              }}>
                {ICONS[t.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f6fc', lineHeight: 1.3 }}>
                  {t.title}
                </div>
                {t.message && (
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 3, lineHeight: 1.4 }}>
                    {t.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#4a5568', padding: 2, flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8b949e')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4a5568')}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
