import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Mesh } from 'three'

type HaloRingProps = {
  radius: number
  tube?: number
  color?: string
  opacity?: number
  tilt?: [number, number, number]
  speed?: number
  reduced?: boolean
}

export function HaloRing({
  radius,
  tube = 0.006,
  color = '#5ce1e6',
  opacity = 0.4,
  tilt = [Math.PI / 2, 0, 0],
  speed = 0.2,
  reduced = false,
}: HaloRingProps) {
  const meshRef = useRef<Mesh>(null)
  const accent = useMemo(() => new Color(color).multiplyScalar(1.65), [color])

  useFrame((_, delta) => {
    if (!meshRef.current || reduced) return
    meshRef.current.rotation.z += delta * speed
  })

  return (
    <group rotation={tilt}>
      <mesh ref={meshRef}>
        <torusGeometry args={[radius, tube, 8, 96]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
