export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      {children}
    </div>
  )
}
