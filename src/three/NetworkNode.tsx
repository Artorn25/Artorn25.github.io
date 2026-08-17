import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Vector3, type Group } from 'three'

type NetworkNodeProps = {
  position: [number, number, number]
  color?: string
  scale?: number
  active?: boolean
  highlighted?: boolean
  reduced?: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
  onClick?: () => void
}

const temp = new Vector3()

export function NetworkNode({
  position,
  color = '#5ce1e6',
  scale = 1,
  active = true,
  highlighted = false,
  reduced = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: NetworkNodeProps) {
  const groupRef = useRef<Group>(null)
  const accent = useMemo(() => new Color(color).multiplyScalar(highlighted ? 2.1 : 1.55), [color, highlighted])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const speed = highlighted ? 1.4 : 0.45
    if (!reduced) group.rotation.y += delta * speed
    const target = (active ? scale : scale * 0.52) * (highlighted ? 1.35 : 1)
    temp.set(target, target, target)
    group.scale.lerp(temp, 0.1)
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation()
        onPointerOver?.()
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        onPointerOut?.()
      }}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
    >
      <mesh>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={active ? (highlighted ? 0.95 : 0.72) : 0.18}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.042, 12, 12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? (highlighted ? 0.85 : 0.45) : 0.12}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={1.75}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={highlighted ? 0.24 : active ? 0.07 : 0.02}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
