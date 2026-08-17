import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Trail } from '@react-three/drei'
import { AdditiveBlending, Color, Vector3, type Mesh } from 'three'
import { createPrng } from '@lib/prng'

export type NetworkEdge = {
  start: [number, number, number]
  end: [number, number, number]
}

type DataPacketsProps = {
  edges: NetworkEdge[]
  reduced: boolean
  active?: boolean
  trails?: boolean
}

export function ConnectionLines({
  edges,
  opacity = 0.22,
  color = '#5ce1e6',
}: {
  edges: NetworkEdge[]
  opacity?: number
  color?: string
}) {
  const accent = useMemo(() => new Color(color), [color])
  return (
    <>
      {edges.map((edge, index) => (
        <Line
          key={`${edge.start.join(',')}-${index}`}
          points={[edge.start, edge.end]}
          color={accent}
          lineWidth={1.05}
          transparent
          opacity={opacity}
        />
      ))}
    </>
  )
}

function Packet({
  edge,
  offset,
  trails,
}: {
  edge: NetworkEdge
  offset: number
  trails: boolean
}) {
  const meshRef = useRef<Mesh>(null)
  const start = useMemo(() => new Vector3(), [])
  const end = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const linear = (t * 0.24 + offset) % 1
    const eased = linear * linear * (3 - 2 * linear)
    start.set(...edge.start)
    end.set(...edge.end)
    mesh.position.lerpVectors(start, end, eased)
    const pulse = 0.78 + Math.sin(t * 8 + offset * 14) * 0.32
    mesh.scale.setScalar(pulse)
  })

  const sphere = (
    <mesh ref={meshRef} position={edge.start}>
      <sphereGeometry args={[0.03, 10, 10]} />
      <meshBasicMaterial
        color={[0.4, 2.4, 1.1]}
        transparent
        opacity={0.98}
        blending={AdditiveBlending}
        toneMapped={false}
      />
      <mesh scale={2.8}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial
          color={[0.4, 2.2, 2.1]}
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </mesh>
  )

  if (!trails) return sphere

  return (
    <Trail
      width={0.22}
      length={5}
      decay={1.15}
      stride={0.02}
      color="#3dff8a"
      attenuation={(width) => width * width}
    >
      {sphere}
    </Trail>
  )
}

export function DataPackets({ edges, reduced, active = true, trails = false }: DataPacketsProps) {
  const random = useMemo(() => createPrng(99), [])
  const offsets = useMemo(() => edges.map(() => random()), [edges, random])

  if (reduced || !active) return null

  return (
    <>
      {edges.map((edge, index) => (
        <Packet
          key={`packet-${index}`}
          edge={edge}
          offset={offsets[index] ?? 0}
          trails={trails}
        />
      ))}
    </>
  )
}
