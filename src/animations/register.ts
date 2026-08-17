import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
gsap.ticker.lagSmoothing(1000, 16)

export { gsap, ScrollTrigger, useGSAP }

export const motion = {
  duration: {
    fast: 0.28,
    base: 0.55,
    slow: 0.9,
  },
  ease: {
    out: 'power3.out',
    inOut: 'power2.inOut',
    soft: 'power2.out',
  },
} as const
