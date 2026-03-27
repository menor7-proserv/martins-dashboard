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
