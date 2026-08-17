import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { AdditiveBlending, BackSide, Vector3, type Group } from 'three'
import { createPrng } from '@lib/prng'
import type { PointerRef } from '@hooks/useWindowPointer'
import { HaloRing } from './HaloRing'
import { HologramSphere, HudTicks, RadarArc, ScanSweep } from './HoloField'

function fibonacciSphere(count: number, radius: number) {
  const points: Vector3[] = []
  const random = createPrng(11)
  const offset = 2 / count
  const increment = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i += 1) {
    const y = i * offset - 1 + offset / 2
    const r = Math.sqrt(1 - y * y)
    const phi = i * increment + random() * 0.08
    points.push(new Vector3(Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius))
  }
  return points
}

function buildArcs(points: Vector3[], count: number) {
  const arcs: Array<Array<[number, number, number]>> = []
  const step = Math.max(1, Math.floor(points.length / (count + 1)))
  for (let i = 0; i < count; i += 1) {
    const start = points[i * step]
    const end = points[(i * step + Math.floor(points.length / 2)) % points.length]
    if (!start || !end) continue
    const mid = start.clone().add(end).multiplyScalar(0.5)
    if (mid.lengthSq() < 0.0001) continue
    mid.normalize().multiplyScalar(start.length() * 1.24)
    const curve: Array<[number, number, number]> = []
    for (let sample = 0; sample <= 18; sample += 1) {
      const t = sample / 18
      const inverse = 1 - t
      curve.push([
        inverse * inverse * start.x + 2 * inverse * t * mid.x + t * t * end.x,
        inverse * inverse * start.y + 2 * inverse * t * mid.y + t * t * end.y,
        inverse * inverse * start.z + 2 * inverse * t * mid.z + t * t * end.z,
      ])
    }
    arcs.push(curve)
  }
  return arcs
}

type DigitalGlobeProps = {
  position?: [number, number, number]
  reduced: boolean
  pointer: RefObject<PointerRef>
  pointCount: number
}

export function DigitalGlobe({
  position = [1.85, 0.05, 0],
  reduced,
  pointer,
  pointCount,
}: DigitalGlobeProps) {
  const groupRef = useRef<Group>(null)
  const points = useMemo(() => fibonacciSphere(pointCount, 1.55), [pointCount])
  const positions = useMemo(() => {
    const array = new Float32Array(points.length * 3)
    points.forEach((point, index) => {
      array[index * 3] = point.x
      array[index * 3 + 1] = point.y
      array[index * 3 + 2] = point.z
    })
    return array
  }, [points])
  const arcs = useMemo(
    () => buildArcs(points, pointCount > 80 ? 8 : pointCount > 48 ? 6 : 4),
    [points, pointCount],
  )

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return
    const speed = reduced ? 0.04 : 0.12
    group.rotation.y += delta * speed
    group.rotation.x = pointer.current.y * 0.08
    group.rotation.z = pointer.current.x * 0.05
    if (!reduced) {
      group.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.35) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[1.48, 32, 32]} />
        <meshBasicMaterial color="#041312" transparent opacity={0.55} />
      </mesh>
      <HologramSphere
        radius={1.55}
        reduced={reduced}
        segments={pointCount > 80 ? 64 : 40}
        opacity={0.52}
      />
      <mesh>
        <sphereGeometry args={[1.62, 24, 24]} />
        <meshBasicMaterial
          color={[0.22, 1.9, 0.72]}
          wireframe
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={1.14}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial
          color={[0.4, 2.2, 2.1]}
          transparent
          opacity={0.1}
          side={BackSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <ScanSweep reduced={reduced} radius={1.58} />
      <HudTicks radius={1.68} count={72} length={0.06} color="#5ce1e6" opacity={0.55} />
      <RadarArc radius={1.78} reduced={reduced} speed={0.85} />
      <HaloRing radius={1.58} tube={0.007} color="#5ce1e6" opacity={0.5} speed={0.08} reduced={reduced} />
      <HaloRing
        radius={1.72}
        tube={0.004}
        color="#3dff8a"
        opacity={0.28}
        tilt={[0.95, 0.45, 0.18]}
        speed={-0.06}
        reduced={reduced}
      />
      <HaloRing
        radius={1.92}
        tube={0.003}
        color="#5ce1e6"
        opacity={0.16}
        tilt={[1.2, -0.55, 0.08]}
        speed={0.04}
        reduced={reduced}
      />
      {arcs.map((arc, index) => (
        <Line
          key={`arc-${index}`}
          points={arc}
          color={index % 2 === 0 ? '#5ce1e6' : '#3dff8a'}
          lineWidth={1.15}
          transparent
          opacity={0.38}
        />
      ))}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          color={[1.6, 2.4, 2.1]}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
