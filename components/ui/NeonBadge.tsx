interface NeonBadgeProps {
  label: string
  variant?: 'blue' | 'purple' | 'orange' | 'gold' | 'green' | 'red' | 'gray'
}

const variants = {
  blue:   'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/30',
  orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/30',
  gold:   'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
  green:  'bg-accent-green/10 text-accent-green border-accent-green/30',
  red:    'bg-accent-red/10 text-accent-red border-accent-red/30',
  gray:   'bg-white/5 text-text-muted border-white/10',
}

const categoryVariant: Record<string, NeonBadgeProps['variant']> = {
  MATERIAL: 'blue',
  MAO_DE_OBRA: 'purple',
  TRANSPORTE: 'orange',
  IMPOSTOS: 'gold',
  AVISTA: 'green',
  '7D': 'green',
  '30D': 'blue',
  '60D': 'purple',
  '90D': 'gold',
  PENDENTE: 'orange',
  RECEBIDO: 'green',
  ABERTA: 'blue',
  CONCLUIDA: 'green',
  CANCELADA: 'red',
}

export function NeonBadge({ label, variant }: NeonBadgeProps) {
  const v = variant ?? categoryVariant[label] ?? 'gray'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${variants[v]}`}>
      {label.replace('_', ' ')}
    </span>
  )
}
