import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Points } from 'three'
import { createPrng } from '@lib/prng'
import type { DeviceCapability } from '@hooks/useDeviceCapability'
import type { PointerRef } from '@hooks/useWindowPointer'

const COUNTS: Record<DeviceCapability, number> = {
  low: 36,
  medium: 72,
  high: 110,
}

type ParticleFieldProps = {
  capability: DeviceCapability
  reduced: boolean
  pointer: RefObject<PointerRef>
  radius?: number
}

export function ParticleField({
  capability,
  reduced,
  pointer,
  radius = 7.5,
}: ParticleFieldProps) {
  const pointsRef = useRef<Points>(null)
  const count = COUNTS[capability]
  const { positions, colors } = useMemo(() => {
    const random = createPrng(42)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const x = (random() - 0.5) * radius
      const y = (random() - 0.5) * radius * 0.72
      const z = (random() - 0.5) * radius
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      const mix = random()
      colors[i * 3] = (0.36 * mix + 0.24 * (1 - mix)) * 1.7
      colors[i * 3 + 1] = (0.88 * mix + 1 * (1 - mix)) * 1.7
      colors[i * 3 + 2] = (0.9 * mix + 0.54 * (1 - mix)) * 1.7
    }
    return { positions, colors }
  }, [count, radius])

  useFrame((state) => {
    const points = pointsRef.current
    if (!points || reduced) return
    const t = state.clock.elapsedTime
    points.rotation.y = t * 0.012 + pointer.current.x * 0.04
    points.rotation.x = pointer.current.y * 0.03 + Math.sin(t * 0.2) * 0.02
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={capability === 'low' ? 0.02 : 0.026}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
