import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@lib/cx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  href?: string
  external?: boolean
}

const variants = {
  primary:
    'border-neon/50 bg-neon/10 text-neon hover:bg-neon/16 hover:shadow-[0_0_24px_rgba(61,255,138,0.12)]',
  ghost: 'border-transparent bg-transparent text-fog hover:text-white',
  outline: 'border-white/15 bg-transparent text-white hover:border-cyan/50 hover:text-cyan',
}

export function Button({
  children,
  variant = 'outline',
  href,
  external,
  className,
  ...props
}: ButtonProps) {
  const classes = cx(
    'inline-flex items-center justify-center gap-2 border px-4 py-2 font-mono text-[11px] tracking-[0.22em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out',
    variants[variant],
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
      >
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
