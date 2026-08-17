import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@animations/register'
import { typeTerminalLines } from '@animations/hero'
import { useReducedMotion } from '@hooks/useReducedMotion'

const LINES = [
  '> INITIALIZING KERNEL...',
  '> LOADING IDENTITY MODULE...',
  '> MOUNTING REPOSITORY NETWORK...',
  '> CALIBRATING SECURITY CORE...',
  '> SYSTEM READY',
]

type BootSequenceProps = {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-boot-line]'))
      typeTerminalLines(lines, reduced, () => {
        window.setTimeout(() => {
          setVisible(false)
          onComplete()
        }, reduced ? 0 : 420)
      })
    },
    { dependencies: [reduced, onComplete] },
  )

  useEffect(() => {
    const skip = () => {
      setVisible(false)
      onComplete()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') skip()
    }
    const failSafe = window.setTimeout(skip, 3200)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(failSafe)
      window.removeEventListener('keydown', onKey)
    }
  }, [onComplete])

  if (!visible) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer border-0 bg-transparent"
        onClick={() => {
          setVisible(false)
          onComplete()
        }}
        aria-label="Skip boot sequence"
      />
      <div
        className="pointer-events-none relative z-10 w-[min(32rem,90vw)] border border-white/10 bg-panel/80 p-6 font-mono text-sm text-neon"
        aria-hidden="true"
      >
        {LINES.map((line) => (
          <p key={line} data-boot-line>
            {line}
          </p>
        ))}
        <p className="mt-4 text-[11px] tracking-[0.2em] text-muted">PRESS ENTER TO SKIP</p>
      </div>
    </div>
  )
}
