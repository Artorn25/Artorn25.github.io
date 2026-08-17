import { useState } from 'react'
import type { Technology, TechnologyGroup } from '@/types/technology'
import { Button } from '@ui/Button'
import { cx } from '@lib/cx'

const PREVIEW_COUNT = 6

type TechnologyGroupListProps = {
  group: TechnologyGroup
  items: Technology[]
  hoveredTech: string | null
  onHover: (name: string | null) => void
}

export function TechnologyGroupList({ group, items, hoveredTech, onHover }: TechnologyGroupListProps) {
  const [expanded, setExpanded] = useState(false)
  const overflow = items.length > PREVIEW_COUNT
  const visible = expanded || !overflow ? items : items.slice(0, PREVIEW_COUNT)
  const hiddenCount = items.length - PREVIEW_COUNT

  return (
    <div data-reveal>
      <h3 className="font-mono text-[11px] tracking-[0.22em] text-cyan/80">{group.toUpperCase()}</h3>
      <ul className="mt-3 space-y-2">
        {visible.map((technology) => (
          <li key={technology.id}>
            <button
              type="button"
              onMouseEnter={() => onHover(technology.name)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(technology.name)}
              onBlur={() => onHover(null)}
              className={cx(
                'w-full border px-3 py-2 text-left text-sm transition-colors',
                hoveredTech === technology.name
                  ? 'border-neon/40 bg-neon/10 text-neon'
                  : 'border-white/10 text-fog hover:border-white/25',
              )}
            >
              {technology.name}
            </button>
          </li>
        ))}
      </ul>
      {overflow ? (
        <Button
          variant="ghost"
          className="mt-2 px-0 tracking-[0.16em]"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? 'SHOW LESS' : `SHOW MORE +${hiddenCount}`}
        </Button>
      ) : null}
    </div>
  )
}
