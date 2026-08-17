import { REPOSITORY_CATEGORIES } from '@/types/repository'
import type { RepositoryFilter } from '@services/repositoryService'
import { cx } from '@lib/cx'

const FILTERS: Array<{ id: RepositoryFilter; label: string }> = [
  { id: 'all', label: 'ALL' },
  ...REPOSITORY_CATEGORIES.map((category) => ({
    id: category,
    label: category.toUpperCase(),
  })),
]

type RepositoryFilterProps = {
  value: RepositoryFilter
  onChange: (value: RepositoryFilter) => void
}

export function RepositoryFilter({ value, onChange }: RepositoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Repository categories">
      {FILTERS.map((filter) => {
        const active = value === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.id)}
            className={cx(
              'border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors',
              active
                ? 'border-neon/50 bg-neon/10 text-neon'
                : 'border-white/10 text-muted hover:border-white/25 hover:text-white',
            )}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
