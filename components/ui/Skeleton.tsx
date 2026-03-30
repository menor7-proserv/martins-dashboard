export function Skeleton({ width = '100%', height = 16, radius = 6, style }: {
  width?: string | number
  height?: string | number
  radius?: number
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #1f2937 25%, #2d3748 50%, #1f2937 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

export function KpiSkeleton() {
  return (
    <div style={{
      background: 'rgba(22,27,34,0.9)',
      border: '1px solid #30363d',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <Skeleton width={80} height={11} radius={4} />
      <Skeleton width={140} height={32} radius={6} style={{ marginTop: 12 }} />
      <Skeleton width={100} height={10} radius={4} style={{ marginTop: 10 }} />
    </div>
  )
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div style={{
      background: 'rgba(22,27,34,0.9)',
      border: '1px solid #30363d',
      borderRadius: 12,
      padding: 20,
    }}>
      <Skeleton width={120} height={11} radius={4} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={height} radius={8} />
    </div>
  )
}

export const shimmerCss = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`
