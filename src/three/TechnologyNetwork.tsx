import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { type Group } from 'three'
import type { Technology } from '@/types/technology'
import { NetworkNode } from './NetworkNode'
import { SecurityCore } from './SecurityCore'
import { DataPackets, type NetworkEdge } from './DataPackets'
import { GridFloor, RadarArc } from './HoloField'
import { SceneFx } from './SceneFx'
import { useDeviceCapability } from '@hooks/useDeviceCapability'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { useWindowPointer } from '@hooks/useWindowPointer'

type TechnologyNetworkProps = {
  technologies: Technology[]
  hoveredTech: string | null
  onHover: (name: string | null) => void
}

export function TechnologyNetwork({
  technologies,
  hoveredTech,
  onHover,
}: TechnologyNetworkProps) {
  const capability = useDeviceCapability()
  const reduced = useReducedMotion()
  const pointer = useWindowPointer()
  const groupRef = useRef<Group>(null)
  const nodes = useMemo(
    () =>
      technologies.map((technology, index) => {
        const angle = (index / technologies.length) * Math.PI * 2
        const radius = 2.1 + (index % 3) * 0.28
        return {
          ...technology,
          position: [
            Math.cos(angle) * radius,
            Math.sin(index * 0.9) * 0.55,
            Math.sin(angle) * radius,
          ] as [number, number, number],
        }
      }),
    [technologies],
  )
  const packetEdges = useMemo<NetworkEdge[]>(() => {
    const selected = hoveredTech ? nodes.filter((node) => node.name === hoveredTech) : nodes.slice(0, 6)
    return selected.map((node) => ({ start: [0, 0, 0], end: node.position }))
  }, [hoveredTech, nodes])

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return
    groupRef.current.rotation.y += delta * 0.08
    groupRef.current.rotation.x = pointer.current.y * 0.12
  })

  return (
    <>
      <color attach="background" args={['#0b0b0b']} />
      <ambientLight intensity={0.26} />
      <pointLight position={[0, 1.2, 2.4]} color="#5ce1e6" intensity={1} distance={10} />
      <GridFloor position={[0, -1.45, 0]} size={10} reduced={reduced} />
      <RadarArc radius={2.55} reduced={reduced} speed={0.45} />
      <SecurityCore position={[0, 0, 0]} reduced={reduced} pointer={pointer} />
      <group ref={groupRef}>
        {nodes.map((node) => {
          const active = !hoveredTech || hoveredTech === node.name
          const highlighted = hoveredTech === node.name
          return (
            <group key={node.id}>
              <Line
                points={[[0, 0, 0], node.position]}
                color={highlighted ? '#3dff8a' : '#5ce1e6'}
                lineWidth={highlighted ? 1.4 : 1}
                transparent
                opacity={!hoveredTech ? 0.14 : highlighted ? 0.55 : 0.04}
              />
              <NetworkNode
                position={node.position}
                color={node.group === 'AI / ML' ? '#3dff8a' : '#5ce1e6'}
                active={active}
                highlighted={highlighted}
                reduced={reduced}
                scale={1}
                onPointerOver={() => onHover(node.name)}
                onPointerOut={() => onHover(null)}
              />
              <Html
                position={[node.position[0], node.position[1] + 0.18, node.position[2]]}
                center
                style={{ pointerEvents: 'auto', whiteSpace: 'nowrap', width: 'max-content' }}
              >
                <button
                  type="button"
                  className="pointer-events-auto w-max max-w-none whitespace-nowrap border-0 bg-transparent font-mono text-[10px] tracking-[0.12em] text-fog/80 hover:text-neon"
                  onMouseEnter={() => onHover(node.name)}
                  onMouseLeave={() => onHover(null)}
                >
                  {node.name}
                </button>
              </Html>
            </group>
          )
        })}
        <DataPackets edges={packetEdges} reduced={reduced} trails={capability !== 'low'} />
      </group>
      <SceneFx capability={capability} reduced={reduced} />
    </>
  )
}
