import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/ui/Sidebar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard Financeiro — Martins Pro Serv',
  description: 'Painel financeiro interno',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.className}>
      <body style={{ backgroundColor: '#0a0a0f', color: '#f0f4f8' }}>
        <Sidebar />
        <main style={{ marginLeft: '14rem', minHeight: '100vh', padding: '1.5rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
