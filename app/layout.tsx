import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Martins Pro Serv — Dashboard Financeiro',
  description: 'Controle financeiro interno',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.className}>
      <body>{children}</body>
    </html>
  )
}
