import { gsap, motion } from './register'

export function animateHeroIntro(root: HTMLElement, reduced: boolean) {
  const title = root.querySelectorAll('[data-hero-line]')
  const actions = root.querySelector('[data-hero-actions]')
  const meta = root.querySelectorAll('[data-hero-meta]')

  if (reduced) {
    gsap.set([title, actions, meta], { opacity: 1, y: 0 })
    return
  }

  const timeline = gsap.timeline({ defaults: { ease: motion.ease.out, force3D: true } })
  timeline.from(title, {
    y: 22,
    opacity: 0,
    duration: 0.75,
    stagger: 0.07,
  })
  timeline.from(
    actions,
    { y: 12, opacity: 0, duration: 0.5 },
    '-=0.4',
  )
  timeline.from(
    meta,
    { y: 8, opacity: 0, duration: 0.45, stagger: 0.05 },
    '-=0.32',
  )
}

export function typeTerminalLines(
  lines: HTMLElement[],
  reduced: boolean,
  onComplete?: () => void,
) {
  if (reduced) {
    gsap.set(lines, { opacity: 1 })
    onComplete?.()
    return
  }

  gsap.fromTo(
    lines,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: 0.28,
      stagger: 0.16,
      ease: 'power2.out',
      onComplete,
    },
  )
}
