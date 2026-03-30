'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/formatters'
import { Plus, Trash2, Download, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Item {
  descricao: string
  quantidade: number
  valorUnit: number
}

export default function OrcamentoPage() {
  const { success, error: toastError } = useToast()

  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [validade, setValidade] = useState('15')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [observacoes, setObservacoes] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [items, setItems] = useState<Item[]>([
    { descricao: '', quantidade: 1, valorUnit: 0 },
  ])
  const [generating, setGenerating] = useState(false)

  const addItem = () => setItems(prev => [...prev, { descricao: '', quantidade: 1, valorUnit: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const subtotal = items.reduce((s, i) => s + i.quantidade * i.valorUnit, 0)
  const numero = `ORC-${Date.now().toString().slice(-6)}`

  const gerarPDF = async () => {
    if (!cliente.trim()) { toastError('Cliente obrigatório', 'Informe o nome do cliente'); return }
    if (items.every(i => !i.descricao.trim())) { toastError('Itens obrigatórios', 'Adicione pelo menos um item'); return }

    setGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const W = 210, pad = 18
      let y = 0

      // Header background
      doc.setFillColor(13, 17, 23)
      doc.rect(0, 0, W, 45, 'F')

      // Accent bar
      doc.setFillColor(245, 158, 11)
      doc.rect(0, 0, 5, 45, 'F')

      // Empresa
      doc.setTextColor(245, 158, 11)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa || 'Gestão Financeira', pad, 16)

      doc.setTextColor(139, 148, 158)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('ORÇAMENTO', pad, 24)

      // Numero e data
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(numero, W - pad, 14, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(139, 148, 158)
      const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
      doc.text(`Data: ${dataFormatada}`, W - pad, 21, { align: 'right' })
      doc.text(`Válido por: ${validade} dias`, W - pad, 27, { align: 'right' })

      y = 55

      // Dados do cliente
      doc.setFillColor(22, 27, 34)
      doc.roundedRect(pad, y, W - pad * 2, endereco ? 22 : 16, 3, 3, 'F')
      doc.setTextColor(139, 148, 158)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('CLIENTE', pad + 6, y + 6)
      doc.setTextColor(240, 246, 252)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(cliente, pad + 6, y + 13)
      if (telefone) {
        doc.setTextColor(139, 148, 158)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(telefone, pad + 6 + doc.getTextWidth(cliente) + 6, y + 13)
      }
      if (endereco) {
        doc.setTextColor(139, 148, 158)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(endereco, pad + 6, y + 20)
      }

      y += (endereco ? 22 : 16) + 10

      // Tabela header
      doc.setFillColor(245, 158, 11)
      doc.rect(pad, y, W - pad * 2, 8, 'F')
      doc.setTextColor(13, 17, 23)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('DESCRIÇÃO', pad + 4, y + 5.5)
      doc.text('QTD', W - pad - 60, y + 5.5, { align: 'right' })
      doc.text('UNIT.', W - pad - 34, y + 5.5, { align: 'right' })
      doc.text('TOTAL', W - pad - 4, y + 5.5, { align: 'right' })
      y += 8

      // Itens
      items.filter(i => i.descricao.trim()).forEach((item, idx) => {
        const total = item.quantidade * item.valorUnit
        const bg = idx % 2 === 0 ? [22, 27, 34] : [17, 21, 28]
        doc.setFillColor(bg[0], bg[1], bg[2])
        doc.rect(pad, y, W - pad * 2, 9, 'F')
        doc.setTextColor(240, 246, 252)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(item.descricao, pad + 4, y + 6)
        doc.text(String(item.quantidade), W - pad - 60, y + 6, { align: 'right' })
        doc.text(formatCurrency(item.valorUnit), W - pad - 34, y + 6, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.text(formatCurrency(total), W - pad - 4, y + 6, { align: 'right' })
        y += 9
      })

      y += 4

      // Total
      doc.setFillColor(245, 158, 11)
      doc.roundedRect(W - pad - 70, y, 70, 12, 2, 2, 'F')
      doc.setTextColor(13, 17, 23)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL', W - pad - 64, y + 8)
      doc.setFontSize(11)
      doc.text(formatCurrency(subtotal), W - pad - 4, y + 8, { align: 'right' })

      y += 20

      // Observações
      if (observacoes.trim()) {
        doc.setFillColor(22, 27, 34)
        const obsLines = doc.splitTextToSize(observacoes, W - pad * 2 - 12)
        const obsH = obsLines.length * 5 + 14
        doc.roundedRect(pad, y, W - pad * 2, obsH, 3, 3, 'F')
        doc.setTextColor(139, 148, 158)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('OBSERVAÇÕES', pad + 6, y + 7)
        doc.setTextColor(200, 210, 220)
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'normal')
        doc.text(obsLines, pad + 6, y + 13)
        y += obsH + 8
      }

      // Footer
      const footerY = 285
      doc.setDrawColor(48, 54, 61)
      doc.line(pad, footerY, W - pad, footerY)
      doc.setTextColor(74, 85, 104)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text('Este orçamento é válido pelo prazo indicado acima. Após aprovação, entrar em contato para agendamento.', W / 2, footerY + 5, { align: 'center' })
      doc.setTextColor(245, 158, 11)
      doc.text('Gestão Financeira', W / 2, footerY + 10, { align: 'center' })

      doc.save(`orcamento-${cliente.replace(/\s+/g, '-').toLowerCase()}-${numero}.pdf`)
      success('PDF gerado!', `Orçamento ${numero} baixado com sucesso`)
    } catch {
      toastError('Erro ao gerar PDF', 'Tente novamente')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>Orçamento</h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 2 }}>Gere orçamentos profissionais em PDF para seus clientes</p>
        </div>
        <button
          onClick={gerarPDF}
          disabled={generating}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Download size={15} />
          {generating ? 'Gerando...' : 'Baixar PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dados da empresa */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h2 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 14 }}>Sua Empresa</h2>
          <div className="space-y-3">
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Nome da Empresa</label>
              <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ex: Martins Pro Serv" className="input-field" style={{ fontSize: '0.85rem' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Data</label>
                <input type="date" value={data} onChange={e => setData(e.target.value)} className="input-field" style={{ fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Validade (dias)</label>
                <input type="number" value={validade} onChange={e => setValidade(e.target.value)} className="input-field" style={{ fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dados do cliente */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
          <h2 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 14 }}>Cliente</h2>
          <div className="space-y-3">
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Nome *</label>
              <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" className="input-field" style={{ fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Telefone</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="input-field" style={{ fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Endereço</label>
              <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro" className="input-field" style={{ fontSize: '0.85rem' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Itens */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b' }}>Itens do Orçamento</h2>
          <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
            <Plus size={13} /> Adicionar Item
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 110px 36px', gap: 8, marginBottom: 6 }}>
          {['Descrição', 'Qtd', 'Valor Unit.', 'Total', ''].map(h => (
            <div key={h} style={{ fontSize: '0.65rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: h === 'Total' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 110px 36px', gap: 8, alignItems: 'center' }}>
              <input value={item.descricao} onChange={e => updateItem(i, 'descricao', e.target.value)} placeholder="Descrição do serviço/produto" className="input-field" style={{ fontSize: '0.82rem' }} />
              <input type="number" min="1" value={item.quantidade} onChange={e => updateItem(i, 'quantidade', +e.target.value)} className="input-field" style={{ fontSize: '0.82rem', textAlign: 'center' }} />
              <input type="number" step="0.01" value={item.valorUnit || ''} onChange={e => updateItem(i, 'valorUnit', +e.target.value)} placeholder="0,00" className="input-field" style={{ fontSize: '0.82rem' }} />
              <div style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b', padding: '0 4px' }}>
                {formatCurrency(item.quantidade * item.valorUnit)}
              </div>
              <button onClick={() => removeItem(i)} disabled={items.length === 1} style={{ background: 'none', border: 'none', cursor: items.length === 1 ? 'default' : 'pointer', color: items.length === 1 ? 'transparent' : 'rgba(239,68,68,0.4)', display: 'flex', justifyContent: 'center' }}
                onMouseEnter={e => { if (items.length > 1) e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { if (items.length > 1) e.currentTarget.style.color = 'rgba(239,68,68,0.4)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, paddingTop: 12, borderTop: '1px solid #30363d' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 2 }}>TOTAL DO ORÇAMENTO</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(subtotal)}</div>
          </div>
        </div>
      </motion.div>

      {/* Observações */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
        <h2 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 14 }}>Observações</h2>
        <textarea
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          placeholder="Condições de pagamento, prazo de entrega, garantia, etc."
          className="input-field"
          rows={3}
          style={{ fontSize: '0.85rem', width: '100%', resize: 'vertical' }}
        />
      </motion.div>

      {/* Preview info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8 }}>
        <FileText size={16} color="#f59e0b" />
        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
          O PDF será gerado com fundo escuro profissional, logo da empresa, tabela de itens e totais. Número do orçamento: <strong style={{ color: '#f59e0b' }}>{numero}</strong>
        </span>
      </motion.div>
    </div>
  )
}
