import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import { AdditiveBlending, DoubleSide, type Mesh, type MeshBasicMaterial } from 'three'
import { useDeviceCapability } from '@hooks/useDeviceCapability'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { useWindowPointer } from '@hooks/useWindowPointer'
import { HaloRing } from './HaloRing'
import { GridFloor, HologramSphere, HudTicks, RadarArc } from './HoloField'
import { SceneFx } from './SceneFx'
import { ParticleField } from './ParticleField'
import { ConnectionLines, DataPackets, type NetworkEdge } from './DataPackets'
import { NetworkNode } from './NetworkNode'

type ConnectionBeaconProps = {
  channels: string[]
}

const FALLBACK_CHANNELS = [
  'Backend',
  'Frontend',
  'AI / ML',
  'Security',
  'DevOps',
  'Experiments',
]

function BeaconPulse({ reduced, delay, color }: { reduced: boolean; delay: number; color: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || reduced) return
    const cycle = (state.clock.elapsedTime * 0.38 + delay) % 1
    const size = 0.32 + cycle * 1.05
    mesh.scale.set(size, size, 1)
    const material = mesh.material as MeshBasicMaterial
    material.opacity = (1 - cycle) * 0.28
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.02, 64]} />
      <meshBasicMaterial
        color={color}
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

function buildSatellites(channels: string[]) {
  const labels = (channels.length > 0 ? channels : FALLBACK_CHANNELS).slice(0, 10)
  return labels.map((label, index) => {
    const angle = (index / labels.length) * Math.PI * 2 - Math.PI / 2
    const radius = 0.9 + (index % 3) * 0.05
    const height = Math.sin(index * 1.35) * 0.22
    return {
      id: `${label}-${index}`,
      label,
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius] as [number, number, number],
    }
  })
}

function FitCamera() {
  useFrame((state) => {
    state.camera.lookAt(0, 0.04, 0)
  })

  return null
}

export function ConnectionBeacon({ channels }: ConnectionBeaconProps) {
  const capability = useDeviceCapability()
  const reduced = useReducedMotion()
  const pointer = useWindowPointer()
  const [hovered, setHovered] = useState<string | null>(null)
  const satellites = useMemo(() => buildSatellites(channels), [channels])
  const edges = useMemo<NetworkEdge[]>(
    () => satellites.map((satellite) => ({ start: [0, 0.02, 0], end: satellite.position })),
    [satellites],
  )
  const packetEdges = useMemo(
    () => (hovered ? edges.filter((_, index) => satellites[index]?.id === hovered) : edges.slice(0, 6)),
    [edges, hovered, satellites],
  )

  return (
    <>
      <color attach="background" args={['#0b0b0b']} />
      <fog attach="fog" args={['#0b0b0b', 2.8, 5.4]} />
      <ambientLight intensity={0.24} />
      <pointLight position={[0.6, 1.1, 1.4]} color="#5ce1e6" intensity={1.1} distance={6} />
      <pointLight position={[-0.7, 0.2, 0.8]} color="#3dff8a" intensity={0.7} distance={5} />
      <FitCamera />
      <GridFloor position={[0, -0.78, 0]} size={3.6} reduced={reduced} />
      <ParticleField capability={capability} reduced={reduced} pointer={pointer} radius={1.9} />
      {capability !== 'low' ? (
        <Sparkles count={14} scale={1.7} size={2} speed={reduced ? 0 : 0.4} opacity={0.5} color="#3dff8a" />
      ) : null}

      <BeaconPulse reduced={reduced} delay={0} color={[0.4, 2.3, 2.1]} />
      <BeaconPulse reduced={reduced} delay={0.33} color={[0.35, 2.2, 0.9]} />
      <BeaconPulse reduced={reduced} delay={0.66} color={[0.4, 2.3, 2.1]} />

      <mesh>
        <cylinderGeometry args={[0.01, 0.01, 1.35, 12, 1, true]} />
        <meshBasicMaterial
          color={[0.35, 2.2, 1.6]}
          transparent
          opacity={0.4}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <HologramSphere radius={0.34} color="#3dff8a" opacity={0.72} reduced={reduced} segments={32} />
      <HaloRing radius={0.46} tube={0.008} color="#5ce1e6" opacity={0.7} speed={0.55} reduced={reduced} />
      <HaloRing
        radius={0.58}
        tube={0.005}
        color="#3dff8a"
        opacity={0.4}
        tilt={[0.9, 0.3, 0.18]}
        speed={-0.32}
        reduced={reduced}
      />
      <HudTicks radius={0.8} count={40} length={0.05} />
      <RadarArc radius={0.86} reduced={reduced} speed={0.95} />

      <ConnectionLines edges={edges} opacity={hovered ? 0.08 : 0.16} />
      {hovered
        ? satellites
            .filter((satellite) => satellite.id === hovered)
            .map((satellite) => (
              <ConnectionLines
                key={`hot-${satellite.id}`}
                edges={[{ start: [0, 0.02, 0], end: satellite.position }]}
                opacity={0.55}
                color="#3dff8a"
              />
            ))
        : null}
      <DataPackets edges={packetEdges} reduced={reduced} trails={capability !== 'low'} />

      {satellites.map((satellite) => {
        const active = !hovered || hovered === satellite.id
        return (
          <group key={satellite.id}>
            <NetworkNode
              position={satellite.position}
              color={satellite.id === hovered ? '#3dff8a' : '#5ce1e6'}
              scale={1.05}
              active={active}
              highlighted={hovered === satellite.id}
              reduced={reduced}
              onPointerOver={() => setHovered(satellite.id)}
              onPointerOut={() => setHovered(null)}
            />
            {hovered === satellite.id ? (
              <Html
                position={[satellite.position[0], satellite.position[1] + 0.18, satellite.position[2]]}
                center
                zIndexRange={[40, 0]}
                style={{ pointerEvents: 'none', whiteSpace: 'nowrap', width: 'max-content' }}
                wrapperClass="pointer-events-none"
              >
                <div className="pointer-events-none w-max max-w-none whitespace-nowrap rounded border border-white/10 bg-void/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-fog">
                  {satellite.label}
                </div>
              </Html>
            ) : null}
          </group>
        )
      })}

      <SceneFx capability={capability} reduced={reduced} />
    </>
  )
}
