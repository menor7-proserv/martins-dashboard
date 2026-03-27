'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

interface HeroKpiCardProps {
  value: number
  metaValue?: number
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

export function HeroKpiCard({ value, metaValue, trend, loading = false }: HeroKpiCardProps) {
  const animated = useCountUp(value)
  const pct = metaValue && metaValue > 0 ? Math.min((value / metaValue) * 100, 100) : 0

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse" style={{ borderLeft: '4px solid #f59e0b' }}>
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
      style={{ borderLeft: '4px solid #f59e0b' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b949e', marginBottom: 6 }}>
            Faturamento Mensal
          </div>
          <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#f0f6fc', lineHeight: 1, marginBottom: 8 }}>
            {formatCurrency(animated)}
          </div>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: trend >= 0 ? '#10b981' : '#ef4444' }}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trend).toFixed(1)}% vs mês anterior</span>
            </div>
          )}
        </div>
        {metaValue && metaValue > 0 && (
          <div style={{ textAlign: 'right', minWidth: 120 }}>
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Meta atingida</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginBottom: 6 }}>
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
            style={{ height: '100%', background: '#f59e0b', borderRadius: 2 }}
          />
        </div>
      )}
    </motion.div>
  )
}
