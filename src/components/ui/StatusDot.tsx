import { cx } from '@lib/cx'

const labels = {
  active: 'ACTIVE',
  archived: 'ARCHIVED',
  experimental: 'EXPERIMENTAL',
  completed: 'COMPLETED',
  running: 'RUNNING',
  queued: 'QUEUED',
  online: 'ONLINE',
} as const

const tones = {
  active: 'bg-neon',
  archived: 'bg-muted',
  experimental: 'bg-warn',
  completed: 'bg-neon',
  running: 'bg-cyan',
  queued: 'bg-warn',
  online: 'bg-neon',
} as const

type StatusDotProps = {
  status: keyof typeof labels
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-fog', className)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', tones[status])} aria-hidden="true" />
      <span>{labels[status]}</span>
    </span>
  )
}
