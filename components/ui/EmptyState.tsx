interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 24px',
      textAlign: 'center',
      background: 'rgba(22,27,34,0.5)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: 12,
    }}>
      {icon && (
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4a5568',
          marginBottom: 16,
        }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 12.5, color: '#4a5568', maxWidth: 280, lineHeight: 1.6 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}
