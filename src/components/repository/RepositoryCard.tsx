import { Star, GitFork } from 'lucide-react'
import type { Repository } from '@/types/repository'
import { StatusDot } from '@ui/StatusDot'
import { Button } from '@ui/Button'
import { cx } from '@lib/cx'

type RepositoryCardProps = {
  repository: Repository
  dimmed?: boolean
  onHover: (id: string | null) => void
  onOpen: (id: string) => void
}

export function RepositoryCard({ repository, dimmed, onHover, onOpen }: RepositoryCardProps) {
  return (
    <article
      data-repo-card
      className={cx(
        'card-glow flex h-full flex-col border border-white/10 bg-panel/80 p-5',
        dimmed && 'opacity-35',
      )}
      onMouseEnter={() => onHover(repository.id)}
      onMouseLeave={() => onHover(null)}
    >
      <StatusDot status={repository.status} />
      <h3 className="mt-4 text-lg font-medium tracking-tight text-white">{repository.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{repository.description}</p>
      <p className="mt-4 font-mono text-[11px] tracking-[0.08em] text-cyan/80">
        {repository.technologies.slice(0, 3).join(' · ')}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Star size={13} aria-hidden="true" />
          {repository.stars}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitFork size={13} aria-hidden="true" />
          {repository.forks}
        </span>
        <span className="font-mono tracking-[0.16em] text-[10px]">{repository.category.toUpperCase()}</span>
      </div>
      <div className="mt-5">
        <Button onClick={() => onOpen(repository.id)} variant="primary" className="w-full">
          VIEW PROJECT
        </Button>
      </div>
    </article>
  )
}
