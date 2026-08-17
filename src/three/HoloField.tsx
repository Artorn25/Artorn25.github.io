import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  type Group,
  type Mesh,
  type ShaderMaterial,
} from 'three'

const HOLO_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

const HOLO_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uScan;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - abs(dot(viewDirection, normalize(vNormal))), 2.5);

  float lat = abs(fract(vUv.y * 22.0) - 0.5);
  float lon = abs(fract(vUv.x * 40.0) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.035, min(lat, lon));

  float scanPos = fract(vUv.y + uTime * 0.12 * uScan);
  float scan = smoothstep(0.0, 0.03, scanPos) * (1.0 - smoothstep(0.06, 0.14, scanPos));

  float hatch = 0.65 + 0.35 * sin(vUv.y * 90.0 + uTime * 8.0 * uScan);

  vec3 color = uColor * (0.22 + fresnel * 1.8 + grid * 0.7 + scan * 2.2);
  float alpha = uOpacity * (0.1 + fresnel * 0.75 + grid * 0.2 + scan * 0.45) * hatch;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`

const FLOOR_VERT = /* glsl */ `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

const FLOOR_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uFadeStart;
uniform float uFadeEnd;
varying vec3 vWorldPosition;

void main() {
  vec2 uv = vWorldPosition.xz * 0.62;
  vec2 cell = abs(fract(uv) - 0.5);
  float line = min(cell.x, cell.y);
  float grid = 1.0 - smoothstep(0.0, 0.022, line);

  vec2 major = abs(fract(uv * 0.25) - 0.5);
  float majorLine = min(major.x, major.y);
  float majorGrid = 1.0 - smoothstep(0.0, 0.012, majorLine);

  float dist = length(vWorldPosition.xz);
  float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, dist);
  float wave = 0.75 + 0.25 * sin(uTime * 1.6 - dist * 0.9);

  float alpha = (grid * 0.16 + majorGrid * 0.38) * fade * wave;
  vec3 color = uColor * (1.0 + majorGrid * 1.4);
  gl_FragColor = vec4(color, alpha);
}
`

type HologramSphereProps = {
  radius?: number
  color?: string
  opacity?: number
  reduced?: boolean
  segments?: number
}

export function HologramSphere({
  radius = 1.55,
  color = '#5ce1e6',
  opacity = 0.48,
  reduced = false,
  segments = 64,
}: HologramSphereProps) {
  const materialRef = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color(color).multiplyScalar(1.55) },
      uOpacity: { value: opacity },
      uScan: { value: reduced ? 0 : 1 },
    }),
    [color, opacity, reduced],
  )

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    material.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime
  })

  return (
    <mesh>
      <sphereGeometry args={[radius, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={HOLO_VERT}
        fragmentShader={HOLO_FRAG}
      />
    </mesh>
  )
}

type GridFloorProps = {
  position?: [number, number, number]
  color?: string
  reduced?: boolean
  size?: number
}

export function GridFloor({
  position = [0, -2.35, 0],
  color = '#5ce1e6',
  reduced = false,
  size = 18,
}: GridFloorProps) {
  const materialRef = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color(color).multiplyScalar(1.35) },
      uFadeStart: { value: size * 0.18 },
      uFadeEnd: { value: size * 0.46 },
    }),
    [color, size],
  )

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    material.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={[size, size, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        side={DoubleSide}
        uniforms={uniforms}
        vertexShader={FLOOR_VERT}
        fragmentShader={FLOOR_FRAG}
      />
    </mesh>
  )
}

export function HudTicks({
  radius,
  count = 64,
  length = 0.07,
  color = '#5ce1e6',
  opacity = 0.5,
}: {
  radius: number
  count?: number
  length?: number
  color?: string
  opacity?: number
}) {
  const points = useMemo(() => {
    const ticks: Array<[number, number, number]> = []
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2
      const extra = index % 8 === 0 ? length * 1.8 : length
      const cosine = Math.cos(angle)
      const sine = Math.sin(angle)
      ticks.push([cosine * radius, 0, sine * radius])
      ticks.push([cosine * (radius + extra), 0, sine * (radius + extra)])
    }
    return ticks
  }, [count, length, radius])

  return (
    <Line
      segments
      points={points}
      color={color}
      lineWidth={1.1}
      transparent
      opacity={opacity}
    />
  )
}

export function ScanSweep({ reduced, radius = 1.58 }: { reduced: boolean; radius?: number }) {
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return
    groupRef.current.rotation.y += delta * 0.55
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[radius * 2.05, radius * 2.05]} />
        <meshBasicMaterial
          color={[0.18, 1.8, 1.1]}
          transparent
          opacity={0.07}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <mesh position={[radius * 0.98, 0, 0]}>
        <planeGeometry args={[0.045, radius * 2.05]} />
        <meshBasicMaterial
          color={[0.45, 2.8, 2.4]}
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export function RadarArc({
  radius,
  reduced,
  speed = 0.7,
}: {
  radius: number
  reduced: boolean
  speed?: number
}) {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current || reduced) return
    meshRef.current.rotation.z += delta * speed
  })

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[radius, 0.012, 8, 48, Math.PI * 0.38]} />
        <meshBasicMaterial
          color={[0.35, 2.4, 2.1]}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
