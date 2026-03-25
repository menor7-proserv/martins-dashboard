'use client'

import { useState } from 'react'

export function ExportButton({ mes, ano }: { mes: number; ano: number }) {
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null)

  const download = async (type: 'pdf' | 'excel') => {
    setLoading(type)
    const ext = type === 'pdf' ? 'pdf' : 'xlsx'
    const res = await fetch(`/api/export/${type}?mes=${mes}&ano=${ano}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `martins-${ano}-${String(mes).padStart(2,'0')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(null)
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => download('pdf')} disabled={!!loading} className="btn-primary text-xs px-3 py-1.5">
        {loading === 'pdf' ? '...' : '📄 PDF'}
      </button>
      <button onClick={() => download('excel')} disabled={!!loading} className="btn-primary text-xs px-3 py-1.5">
        {loading === 'excel' ? '...' : '📊 Excel'}
      </button>
    </div>
  )
}
