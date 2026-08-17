import { useRef } from 'react'
import { gsap, useGSAP } from '@animations/register'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { formatNumber } from '@lib/cx'

type AnimatedCounterProps = {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (reduced) {
        el.textContent = formatNumber(value)
        return
      }
      const state = { n: 0 }
      gsap.to(state, {
        n: value,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = formatNumber(Math.round(state.n))
        },
      })
    },
    { dependencies: [value, reduced] },
  )

  return (
    <span ref={ref} className={className}>
      0
    </span>
  )
}
