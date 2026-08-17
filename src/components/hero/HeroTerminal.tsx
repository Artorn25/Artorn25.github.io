import { useRef } from 'react'
import { useGSAP } from '@animations/register'
import { typeTerminalLines } from '@animations/hero'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { StatusDot } from '@ui/StatusDot'
import { HudCorners } from '@layout/HudCorners'

const LINES = [
  '> MOUNTING SOURCE FOLDER...',
  '> INDEXING REPOSITORIES...',
  '> MAPPING ARCHIVE TREE...',
  '> LINKING GITHUB REMOTE...',
  '> ARCHIVE READY',
]

export function HeroTerminal() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-term-line]'))
      typeTerminalLines(lines, reduced)
    },
    { dependencies: [reduced] },
  )

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-sm border border-white/10 bg-panel/80 p-4 backdrop-blur-sm"
      aria-label="System terminal"
    >
      <HudCorners />
      <div className="space-y-1 font-mono text-[11px] leading-6 text-neon/90">
        {LINES.map((line) => (
          <p key={line} data-term-line>
            {line}
          </p>
        ))}
      </div>
      <div className="mt-4">
        <StatusDot status="online" />
      </div>
    </div>
  )
}
