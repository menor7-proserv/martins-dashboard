'use client'

import { createContext, useContext, useCallback, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

interface Dialog extends ConfirmOptions {
  resolve: (v: boolean) => void
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<Dialog | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setDialog({ ...opts, resolve })
    })
  }, [])

  const handle = (v: boolean) => {
    dialog?.resolve(v)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {dialog && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 8000,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            animation: 'fadeInOverlay 0.15s ease-out',
          }}
          onClick={e => { if (e.target === e.currentTarget) handle(false) }}
        >
          <div style={{
            background: '#161b22',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            animation: 'slideInModal 0.2s ease-out',
          }}>
            {/* Icon */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: dialog.danger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${dialog.danger ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: dialog.danger ? '#ef4444' : '#f59e0b',
              marginBottom: 16,
            }}>
              <AlertTriangle size={22} />
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>
              {dialog.title}
            </div>
            <div style={{ fontSize: 13.5, color: '#8b949e', lineHeight: 1.6, marginBottom: 24 }}>
              {dialog.message}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => handle(false)}
                style={{
                  padding: '8px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#8b949e',
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                Cancelar
              </button>
              <button
                onClick={() => handle(true)}
                style={{
                  padding: '8px 18px',
                  background: dialog.danger ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  border: `1px solid ${dialog.danger ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
                  borderRadius: 8,
                  color: dialog.danger ? '#ef4444' : '#f59e0b',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = dialog.danger ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = dialog.danger ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)')}
              >
                {dialog.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOverlay { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInModal  { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider')
  return ctx.confirm
}
