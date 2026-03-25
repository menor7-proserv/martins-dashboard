'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface KpiCardProps {
  label: string
  value: number
  format?: 'currency' | 'percent' | 'number'
  color?: 'blue' | 'green' | 'red' | 'gold' | 'purple'
  icon?: string
  subtitle?: string
  trend?: number
}

const colorMap = {
  blue:   { border: 'border-neon-blue/40',    text: 'text-neon-blue',    glow: 'shadow-[0_0_20px_rgba(0,180,216,0.2)]' },
  green:  { border: 'border-accent-green/40', text: 'text-accent-green', glow: 'shadow-[0_0_20px_rgba(0,245,160,0.2)]' },
  red:    { border: 'border-accent-red/40',   text: 'text-accent-red',   glow: 'shadow-[0_0_20px_rgba(255,77,109,0.2)]' },
  gold:   { border: 'border-accent-gold/40',  text: 'text-accent-gold',  glow: 'shadow-[0_0_20px_rgba(255,214,10,0.2)]' },
  purple: { border: 'border-accent-purple/40',text: 'text-accent-purple',glow: 'shadow-[0_0_20px_rgba(181,107,255,0.2)]' },
}

function useCountUp(target: number, duration = 1200) {
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

export function KpiCard({ label, value, format = 'currency', color = 'blue', icon, subtitle, trend }: KpiCardProps) {
  const animated = useCountUp(value)
  const colors = colorMap[color]

  const display =
    format === 'currency' ? formatCurrency(animated) :
    format === 'percent'  ? formatPercent(animated) :
    Math.round(animated).toLocaleString('pt-BR')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card-hover p-5 ${colors.border} ${colors.glow} animate-neon-pulse`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${colors.text} mb-1`}>{display}</div>
      {subtitle && <div className="text-xs text-text-dim">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`text-xs mt-2 ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mês anterior
        </div>
      )}
    </motion.div>
  )
}
