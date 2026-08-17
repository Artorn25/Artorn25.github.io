import { useEffect, useState, type RefObject } from 'react'

export function useInView(ref: RefObject<Element | null>, rootMargin = '240px') {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting))
      },
      { rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}
