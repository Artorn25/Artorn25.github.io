import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { AdditiveBlending, DoubleSide, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { createPrng } from '@lib/prng'
import { useDeviceCapability } from '@hooks/useDeviceCapability'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { useWindowPointer } from '@hooks/useWindowPointer'
import { DigitalGlobe } from './DigitalGlobe'
import { SecurityCore } from './SecurityCore'
import { NetworkNode } from './NetworkNode'
import { ConnectionLines, DataPackets, type NetworkEdge } from './DataPackets'
import { ParticleField } from './ParticleField'
import { GridFloor } from './HoloField'
import { SceneFx } from './SceneFx'

const NODE_COUNTS = {
  low: 8,
  medium: 12,
  high: 16,
} as const

function buildOrbitNodes(count: number) {
  const random = createPrng(21)
  const nodes: Array<{ id: string; position: [number, number, number] }> = []
  for (let i = 0; i < count; i += 1) {
    const theta = (i / count) * Math.PI * 2 + random() * 0.2
    const phi = 0.55 + random() * 1.9
    const radius = 2.15 + random() * 0.55
    nodes.push({
      id: `node-${i}`,
      position: [
        Math.sin(phi) * Math.cos(theta) * radius + 1.85,
        Math.cos(phi) * radius * 0.72,
        Math.sin(phi) * Math.sin(theta) * radius,
      ],
    })
  }
  return nodes
}

function CameraRig({
  reduced,
  pointer,
}: {
  reduced: boolean
  pointer: ReturnType<typeof useWindowPointer>
}) {
  useFrame((state) => {
    if (reduced) return
    const camera = state.camera
    camera.position.x += (pointer.current.x * 0.32 - camera.position.x) * 0.035
    camera.position.y += (0.18 + pointer.current.y * 0.16 - camera.position.y) * 0.035
    camera.lookAt(1.35, 0, 0)
  })

  return null
}

function ScanRing({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || reduced) return
    const cycle = (state.clock.elapsedTime * 0.16) % 1
    const size = 0.55 + cycle * 6.2
    mesh.scale.set(size, size, 1)
    const material = mesh.material as MeshBasicMaterial
    material.opacity = (1 - cycle) * 0.28
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[1.4, -2.33, 0]}>
      <ringGeometry args={[0.88, 1.05, 72]} />
      <meshBasicMaterial
        color={[0.4, 2.3, 2.1]}
        transparent
        opacity={0.2}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        side={DoubleSide}
      />
    </mesh>
  )
}

const CORE_ORIGIN: [number, number, number] = [1.85, 0.05, 0]

export function SecurityScene() {
  const capability = useDeviceCapability()
  const reduced = useReducedMotion()
  const pointer = useWindowPointer()
  const groupRef = useRef<Group>(null)
  const [coreHot, setCoreHot] = useState(false)
  const nodes = useMemo(() => buildOrbitNodes(NODE_COUNTS[capability]), [capability])
  const edges = useMemo<NetworkEdge[]>(() => {
    const links: NetworkEdge[] = nodes.map((node) => ({ start: CORE_ORIGIN, end: node.position }))
    for (let i = 0; i < nodes.length; i += 1) {
      const next = nodes[(i + 3) % nodes.length]
      const current = nodes[i]
      if (current && next) {
        links.push({ start: current.position, end: next.position })
      }
    }
    return links.slice(0, capability === 'low' ? 10 : 22)
  }, [nodes, capability])

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return
    groupRef.current.rotation.y += delta * 0.012
  })

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 7.5, 18]} />
      <ambientLight intensity={0.22} />
      <pointLight position={[1.85, 1.4, 2.2]} color="#5ce1e6" intensity={1.15} distance={12} />
      <pointLight position={[0.2, -0.6, 1.6]} color="#3dff8a" intensity={0.6} distance={10} />
      <CameraRig reduced={reduced} pointer={pointer} />
      <GridFloor position={[1.4, -2.35, 0]} reduced={reduced} />
      <ScanRing reduced={reduced} />
      <ParticleField capability={capability} reduced={reduced} pointer={pointer} />
      {capability !== 'low' ? (
        <Sparkles
          count={capability === 'high' ? 42 : 24}
          scale={[7, 4.2, 7]}
          size={3.2}
          speed={reduced ? 0 : 0.45}
          opacity={0.55}
          color="#5ce1e6"
          position={[1.4, 0.1, 0]}
        />
      ) : null}
      <group ref={groupRef}>
        <DigitalGlobe
          reduced={reduced}
          pointer={pointer}
          pointCount={capability === 'low' ? 48 : capability === 'medium' ? 80 : 110}
        />
        <SecurityCore reduced={reduced} pointer={pointer} onProximity={setCoreHot} />
        {nodes.map((node, index) => (
          <NetworkNode
            key={node.id}
            position={node.position}
            color={index % 3 === 0 ? '#3dff8a' : '#5ce1e6'}
            highlighted={coreHot}
            reduced={reduced}
            scale={0.9}
          />
        ))}
        <ConnectionLines edges={edges} opacity={0.2} />
        <DataPackets
          edges={edges.slice(0, capability === 'low' ? 4 : 8)}
          reduced={reduced}
          trails={capability !== 'low'}
        />
      </group>
      <SceneFx capability={capability} reduced={reduced} vignette />
    </>
  )
}
