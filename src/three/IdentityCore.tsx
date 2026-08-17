import { Sparkles } from '@react-three/drei'
import { AdditiveBlending } from 'three'
import { SecurityCore } from './SecurityCore'
import { ParticleField } from './ParticleField'
import { HaloRing } from './HaloRing'
import { GridFloor, HudTicks, RadarArc } from './HoloField'
import { SceneFx } from './SceneFx'
import { useDeviceCapability } from '@hooks/useDeviceCapability'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { useWindowPointer } from '@hooks/useWindowPointer'

export function IdentityCore() {
  const capability = useDeviceCapability()
  const reduced = useReducedMotion()
  const pointer = useWindowPointer()

  return (
    <>
      <color attach="background" args={['#0b0b0b']} />
      <ambientLight intensity={0.28} />
      <pointLight position={[0.8, 0.9, 1.6]} color="#5ce1e6" intensity={1.35} distance={6} />
      <pointLight position={[-0.9, -0.5, 0.9]} color="#3dff8a" intensity={0.8} distance={5} />
      <GridFloor position={[0, -1.15, 0]} size={8} reduced={reduced} />
      <ParticleField capability={capability} reduced={reduced} pointer={pointer} radius={3.4} />
      {capability !== 'low' ? (
        <Sparkles count={18} scale={2.8} size={2.6} speed={reduced ? 0 : 0.5} opacity={0.6} color="#3dff8a" />
      ) : null}
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 2.4, 12, 1, true]} />
        <meshBasicMaterial
          color={[0.35, 2.2, 1.7]}
          transparent
          opacity={0.42}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <HudTicks radius={1.12} count={48} length={0.08} />
      <RadarArc radius={1.18} reduced={reduced} speed={0.9} />
      <HaloRing radius={1.05} color="#5ce1e6" opacity={0.4} speed={0.28} reduced={reduced} />
      <HaloRing
        radius={1.32}
        color="#3dff8a"
        opacity={0.24}
        tilt={[0.72, 0.28, 0.4]}
        speed={-0.18}
        reduced={reduced}
      />
      <SecurityCore position={[0, 0, 0]} reduced={reduced} pointer={pointer} />
      <SceneFx capability={capability} reduced={reduced} />
    </>
  )
}
