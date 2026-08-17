import { useEffect, useState } from 'react'

function formatClock(date: Date) {
  return date.toISOString().replace('T', ' ').slice(0, 19) + 'Z'
}

export function StatusBar() {
  const [now, setNow] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(formatClock(new Date())), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-30 hidden font-mono text-[10px] tracking-[0.18em] text-muted md:block">
      <p>
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-neon" />
        SYSTEM ONLINE
      </p>
      <p className="mt-1 text-white/35">{now}</p>
    </div>
  )
}
