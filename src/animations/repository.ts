import { gsap, motion } from './register'

export function animateFilterChange(root: HTMLElement, reduced: boolean) {
  const cards = root.querySelectorAll<HTMLElement>('[data-repo-card]')
  if (!cards.length) return

  if (reduced) {
    gsap.set(cards, { opacity: 1, y: 0 })
    return
  }

  gsap.fromTo(
    cards,
    { opacity: 0, y: 12 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.03,
      ease: motion.ease.out,
      force3D: true,
      overwrite: 'auto',
    },
  )
}

export function animatePanelOpen(panel: HTMLElement, reduced: boolean) {
  if (reduced) {
    gsap.set(panel, { opacity: 1, x: 0 })
    return
  }

  gsap.fromTo(
    panel,
    { opacity: 0, x: 48 },
    { opacity: 1, x: 0, duration: motion.duration.base, ease: motion.ease.out },
  )
}
