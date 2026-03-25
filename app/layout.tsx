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
      <body>
        <Sidebar />
        <main className="ml-56 min-h-screen p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
