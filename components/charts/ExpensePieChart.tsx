'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  MATERIAL: '#00b4d8',
  MAO_DE_OBRA: '#b56bff',
  TRANSPORTE: '#ff9500',
  IMPOSTOS: '#ffd60a',
}

export function ExpensePieChart({ data }: { data: { categoria: string; _sum: { valor: number | null } }[] }) {
  const chartData = data.map(d => ({
    name: d.categoria.replace(/_/g, ' '),
    value: d._sum.valor ?? 0,
  })).filter(d => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name.replace(/ /g, '_')] ?? '#8899aa'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: unknown) => `R$ ${(v as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          contentStyle={{ background: '#111118', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
