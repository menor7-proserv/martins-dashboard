'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface KpiCardProps {
  label: string
  value: number
  format?: 'currency' | 'percent' | 'number'
  accentColor?: string
  icon?: ReactNode
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
