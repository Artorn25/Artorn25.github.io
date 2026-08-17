import { gsap, motion } from './register'

export function revealOnScroll(root: HTMLElement, reduced: boolean) {
  const items = root.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!items.length) return

  if (reduced) {
    gsap.set(items, { opacity: 1, y: 0 })
    return
  }

  items.forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: motion.ease.out,
        force3D: true,
        overwrite: 'auto',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
      },
    )
  })
}
