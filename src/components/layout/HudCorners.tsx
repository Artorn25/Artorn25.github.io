import { cx } from '@lib/cx'

export function HudCorners({ className }: { className?: string }) {
  return (
    <div className={cx('pointer-events-none absolute inset-2', className)} aria-hidden="true">
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-white/20" />
      <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-white/20" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/20" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/20" />
    </div>
  )
}
