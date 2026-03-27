'use client'

import { useId } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface DataPoint {
  mes: number; ano: number
  faturamento: number; despesas: number
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#161b22', border: '1px solid #30363d',
      borderRadius: 8, padding: '0.75rem', fontSize: 12,
    }}>
      <p style={{ color: '#8b949e', marginBottom: 8, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: R$ {(p.value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  const uid = useId().replace(/:/g, '-')
  const gradFatId = `gradFat-${uid}`
  const gradDespId = `gradDesp-${uid}`

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '0.875rem' }}>
        Sem dados históricos
      </div>
    )
  }

  const chartData = data.map(d => ({
    name: `${MESES[d.mes - 1]}/${String(d.ano).slice(2)}`,
    Faturamento: d.faturamento,
    Despesas: d.despesas,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradFatId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={gradDespId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" stroke="transparent" tick={{ fontSize: 11, fill: '#8b949e' }} />
        <YAxis stroke="transparent" tick={{ fontSize: 11, fill: '#8b949e' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
        <Area
          type="monotone" dataKey="Faturamento"
          stroke="#f59e0b" strokeWidth={2}
          fill={`url(#${gradFatId})`}
          dot={false}
          activeDot={{ r: 4, fill: '#f59e0b' }}
          animationDuration={1200}
        />
        <Area
          type="monotone" dataKey="Despesas"
          stroke="#8b5cf6" strokeWidth={1.5}
          strokeDasharray="4 2"
          fill={`url(#${gradDespId})`}
          dot={false}
          activeDot={{ r: 3, fill: '#8b5cf6' }}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
