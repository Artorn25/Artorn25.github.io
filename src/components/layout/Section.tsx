import type { ReactNode } from 'react'
import { cx } from '@lib/cx'

type SectionProps = {
  id: string
  index: string
  label: string
  title: string
  children: ReactNode
  className?: string
}

export function Section({ id, index, label, title, children, className }: SectionProps) {
  return (
    <section id={id} className={cx('relative scroll-mt-24 px-6 py-24 md:px-10 md:py-32', className)}>
      <div className="mx-auto max-w-6xl">
        <header data-reveal className="mb-12">
          <p className="font-mono text-[11px] tracking-[0.28em] text-cyan/80">
            {index} // {label}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        </header>
        {children}
      </div>
    </section>
  )
}
