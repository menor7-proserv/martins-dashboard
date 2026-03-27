'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts'
import { formatCurrency } from '@/lib/formatters'

const PALETTE = ['#f59e0b','#8b5cf6','#10b981','#3b82f6','#ef4444','#06b6d4']

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.625rem', fontSize: 12 }}>
      <p style={{ color: '#f0f6fc', fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

function CenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null
  const { cx, cy } = viewBox
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0f6fc" fontSize="12" fontWeight="700">
        Total
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="800">
        {(total / 1000).toFixed(1)}K
      </text>
    </>
  )
}

export function ExpensePieChart({ data }: { data: { categoria: string; _sum: { valor: number | null } }[] }) {
  const chartData = data
    .map((d, i) => ({
      name: d.categoria.replace(/_/g, ' '),
      value: d._sum.valor ?? 0,
      fill: PALETTE[i % PALETTE.length],
    }))
    .filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
        <svg viewBox="0 0 80 80" style={{ width: 60, height: 60 }}>
          <circle cx="40" cy="40" r="30" fill="none" stroke="#30363d" strokeWidth="10" />
        </svg>
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Sem despesas no período</span>
      </div>
    )
  }

  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 160, height: 160, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              label={(props: any) => <CenterLabel {...props} total={total} />}
              labelLine={false}
              shape={(props: any) => {
                const { isActive, outerRadius, ...rest } = props
                return <Sector {...rest} outerRadius={isActive ? 88 : (outerRadius ?? 80)} />
              }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda lateral */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chartData.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, flexShrink: 0 }} />
            <span style={{ color: '#8b949e', flex: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {d.name}
            </span>
            <span style={{ color: '#f0f6fc', fontWeight: 700 }}>
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
