import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 600): number {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let handle: number
    const frame = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(target * eased)
      if (progress < 1) handle = requestAnimationFrame(frame)
    }
    handle = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(handle)
  }, [target, duration])
  return current
}
