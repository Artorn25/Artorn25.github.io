import { gsap, motion } from './register'

export function fadeIn(target: HTMLElement, reduced: boolean) {
  if (reduced) {
    gsap.set(target, { opacity: 1 })
    return
  }

  gsap.fromTo(
    target,
    { opacity: 0 },
    { opacity: 1, duration: motion.duration.base, ease: motion.ease.soft },
  )
}

export function collapseNetwork(nodes: HTMLElement[], reduced: boolean) {
  if (reduced) {
    gsap.set(nodes, { opacity: 1, scale: 1 })
    return
  }

  gsap.fromTo(
    nodes,
    { opacity: 0.2, scale: 0.7 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      stagger: 0.04,
      ease: motion.ease.out,
      scrollTrigger: {
        trigger: nodes[0],
        start: 'top 80%',
        once: true,
      },
    },
  )
}
