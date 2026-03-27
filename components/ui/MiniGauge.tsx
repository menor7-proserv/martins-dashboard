'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/formatters'

interface MiniGaugeProps {
  label: string
  current: number
  target: number
  loading?: boolean
}

function getGaugeColor(pct: number): string {
  if (pct < 50) return '#ef4444'
  if (pct < 80) return '#f59e0b'
  return '#10b981'
}

export function MiniGauge({ label, current, target, loading = false }: MiniGaugeProps) {
  const RADIUS = 50
  const arcLength = Math.PI * RADIUS
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const offset = arcLength - (arcLength * pct) / 100
  const color = getGaugeColor(pct)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ width: 120, height: 70, background: '#1f2937', borderRadius: 8, margin: '0 auto' }} className="animate-pulse" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {label}
      </div>
      <svg
        viewBox="0 0 120 70"
        style={{ width: 140, height: 82, overflow: 'visible' }}
        role="img"
        aria-label={`${label}: ${pct.toFixed(0)}% — ${formatCurrency(current)} de ${formatCurrency(target)}`}
      >
        {/* Track */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="#30363d"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${arcLength}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
        {/* Percentage text */}
        <text
          x="60" y="52"
          textAnchor="middle"
          fill="#f0f6fc"
          fontSize="16"
          fontWeight="800"
        >
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.4 }}>
        <span style={{ color: '#f0f6fc', fontWeight: 700 }}>{formatCurrency(current)}</span>
        <span> / </span>
        <span>{formatCurrency(target)}</span>
      </div>
    </div>
  )
}
