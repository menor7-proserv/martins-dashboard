'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { useCountUp } from '@/hooks/useCountUp'

interface HeroKpiCardProps {
  value: number
  metaValue?: number
  trend?: number
  loading?: boolean
  label?: string
  accentColor?: string
}

export function HeroKpiCard({
  value,
  metaValue,
  trend,
  loading = false,
  label = 'Faturamento Mensal',
  accentColor = '#f59e0b',
}: HeroKpiCardProps) {
  const animated = useCountUp(value)
  const pct = metaValue && metaValue > 0 ? Math.min((animated / metaValue) * 100, 100) : 0

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse" style={{ borderLeft: `4px solid ${accentColor}` }}>
        <div style={{ height: 10, background: '#30363d', borderRadius: 4, width: '30%', marginBottom: 16 }} />
        <div style={{ height: 48, background: '#30363d', borderRadius: 4, width: '60%', marginBottom: 12 }} />
        <div style={{ height: 6, background: '#30363d', borderRadius: 3, width: '100%' }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card-hover p-6"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#f0f6fc', lineHeight: 1, marginBottom: 8 }}>
            {formatCurrency(animated)}
          </div>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#8b949e' }}>
              {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
              <span>{Math.abs(trend).toFixed(1)}% vs mês anterior</span>
            </div>
          )}
        </div>
        {metaValue && metaValue > 0 && (
          <div style={{ textAlign: 'right', minWidth: 120 }}>
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Meta atingida</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: accentColor, lineHeight: 1, marginBottom: 6 }}>
              {pct.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
              de {formatCurrency(metaValue)}
            </div>
          </div>
        )}
      </div>
      {metaValue && metaValue > 0 && (
        <div style={{ marginTop: 16, height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            style={{ height: '100%', background: accentColor, borderRadius: 2 }}
          />
        </div>
      )}
    </motion.div>
  )
}
