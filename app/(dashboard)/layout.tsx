'use client'

import { SessionProvider } from 'next-auth/react'
import { ShellLayout } from '@/components/ui/ShellLayout'
import { ToastProvider } from '@/components/ui/Toast'
import { ConfirmProvider } from '@/components/ui/ConfirmModal'
import { shimmerCss } from '@/components/ui/Skeleton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ConfirmProvider>
          <style>{shimmerCss}</style>
          <ShellLayout>{children}</ShellLayout>
        </ConfirmProvider>
      </ToastProvider>
    </SessionProvider>
  )
}
