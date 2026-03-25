'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataPoint {
  mes: number
  ano: number
  faturamento: number
  despesas: number
  lucro: number
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111118', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, padding: '0.75rem', fontSize: 12 }}>
      <p style={{ color: '#8899aa', marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map(d => ({
    name: `${MESES[d.mes - 1]}/${String(d.ano).slice(2)}`,
    Faturamento: d.faturamento,
    Despesas: d.despesas,
    Lucro: d.lucro,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#8899aa" tick={{ fontSize: 11, fill: '#8899aa' }} />
        <YAxis stroke="#8899aa" tick={{ fontSize: 11, fill: '#8899aa' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#8899aa' }} />
        <Line type="monotone" dataKey="Faturamento" stroke="#00b4d8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Despesas" stroke="#ff4d6d" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Lucro" stroke="#00f5a0" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
