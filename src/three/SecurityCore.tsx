import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Vector3, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import type { PointerRef } from '@hooks/useWindowPointer'
import { HaloRing } from './HaloRing'
import { HologramSphere } from './HoloField'

type SecurityCoreProps = {
  position?: [number, number, number]
  reduced: boolean
  pointer: RefObject<PointerRef>
  onProximity?: (near: boolean) => void
}

const mouse = new Vector3()
const core = new Vector3()

export function SecurityCore({
  position = [1.85, 0.05, 0],
  reduced,
  pointer,
  onProximity,
}: SecurityCoreProps) {
  const groupRef = useRef<Group>(null)
  const glowRef = useRef<Mesh>(null)
  const nearRef = useRef(false)
  const neon = useMemo(() => new Color('#3dff8a').multiplyScalar(1.8), [])
  const cyan = useMemo(() => new Color('#5ce1e6').multiplyScalar(1.7), [])

  useFrame((state, delta) => {
    const group = groupRef.current
    const glow = glowRef.current
    if (!group) return

    mouse.set(pointer.current.x * 3.2, pointer.current.y * 2.1, 0.4)
    core.set(...position)
    const distance = mouse.distanceTo(core)
    const near = distance < 1.85
    if (near !== nearRef.current) {
      nearRef.current = near
      onProximity?.(near)
    }

    const speed = reduced ? 0.08 : near ? 0.95 : 0.32
    group.rotation.y += delta * speed
    group.rotation.x += delta * speed * 0.35
    group.position.y = position[1] + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.05)

    if (glow) {
      const material = glow.material as MeshBasicMaterial
      material.opacity += ((near ? 0.42 : 0.2) - material.opacity) * 0.08
      const pulse = 1.32 + (near ? 0.2 : 0.08) + Math.sin(state.clock.elapsedTime * 2.1) * 0.06
      glow.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <pointLight color="#3dff8a" intensity={1.45} distance={5.2} decay={2} />
      <HologramSphere radius={0.46} color="#3dff8a" opacity={0.7} reduced={reduced} segments={32} />
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshBasicMaterial color={neon} wireframe transparent opacity={0.95} toneMapped={false} />
      </mesh>
      <mesh ref={glowRef} scale={1.32}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={0.38}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshBasicMaterial
          color={neon}
          transparent
          opacity={0.55}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <HaloRing radius={0.58} tube={0.008} color="#5ce1e6" opacity={0.7} speed={0.62} reduced={reduced} />
      <HaloRing
        radius={0.72}
        tube={0.005}
        color="#3dff8a"
        opacity={0.48}
        tilt={[0.85, 0.35, 0.2]}
        speed={-0.38}
        reduced={reduced}
      />
      <HaloRing
        radius={0.86}
        tube={0.004}
        color="#5ce1e6"
        opacity={0.28}
        tilt={[1.25, -0.45, 0.15]}
        speed={0.2}
        reduced={reduced}
      />
    </group>
  )
}
