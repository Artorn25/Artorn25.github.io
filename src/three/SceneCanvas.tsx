import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useDeviceCapability } from '@hooks/useDeviceCapability'
import { useInView } from '@hooks/useInView'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { cx } from '@lib/cx'

type SceneCanvasProps = {
  children: ReactNode
  className?: string
  cameraPosition?: [number, number, number]
  fov?: number
  eager?: boolean
  interactive?: boolean
}

function KickFrame({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (enabled) invalidate()
  }, [enabled, invalidate])

  return null
}

export function SceneCanvas({
  children,
  className,
  cameraPosition = [0, 0.15, 6.6],
  fov = 42,
  eager = false,
  interactive = true,
}: SceneCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, '120px')
  const capability = useDeviceCapability()
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(eager)
  const dpr = capability === 'high' ? ([1, 1.25] as [number, number]) : 1

  useEffect(() => {
    if (inView) setMounted(true)
  }, [inView])

  const running = mounted && inView && !reduced

  return (
    <div
      ref={wrapRef}
      className={cx('h-full w-full', !interactive && 'pointer-events-none', className)}
    >
      {mounted ? (
        <Canvas
          dpr={dpr}
          camera={{ position: cameraPosition, fov, near: 0.1, far: 48 }}
          gl={{
            antialias: capability === 'high',
            alpha: false,
            powerPreference: capability === 'high' ? 'high-performance' : 'default',
            stencil: false,
          }}
          frameloop={running ? 'always' : 'demand'}
          performance={{ min: 0.5, debounce: 200 }}
        >
          <KickFrame enabled={!running} />
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      ) : null}
    </div>
  )
}
