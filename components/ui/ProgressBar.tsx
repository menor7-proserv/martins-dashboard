'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/formatters'

interface ProgressBarProps {
  label: string
  current: number
  target: number
  color?: 'blue' | 'gold' | 'green'
}

const colors = {
  blue: 'from-neon-blue to-neon-glow',
  gold: 'from-accent-gold to-yellow-500',
  green: 'from-accent-green to-green-400',
}

export function ProgressBar({ label, current, target, color = 'blue' }: ProgressBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted font-medium">{label}</span>
        <span className="text-text-primary font-bold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-dim">
        <span>{formatCurrency(current)}</span>
        <span>Meta: {formatCurrency(target)}</span>
      </div>
    </div>
  )
}
