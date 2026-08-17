import { useMemo, useState } from 'react'
import { Html, Line, OrbitControls, Segment, Segments } from '@react-three/drei'
import { AdditiveBlending } from 'three'
import type { Repository, RepositoryCategory } from '@/types/repository'
import type { Technology } from '@/types/technology'
import type { RepositoryFilter } from '@services/repositoryService'
import { NetworkNode } from './NetworkNode'
import { DataPackets, type NetworkEdge } from './DataPackets'
import { HaloRing } from './HaloRing'
import { GridFloor } from './HoloField'
import { SceneFx } from './SceneFx'
import { useDeviceCapability } from '@hooks/useDeviceCapability'
import { useReducedMotion } from '@hooks/useReducedMotion'

export type GraphNode = {
  id: string
  kind: 'repo' | 'tech'
  label: string
  category?: RepositoryCategory
  position: [number, number, number]
}

export type GraphLink = {
  source: string
  target: string
}

const CATEGORY_ORDER: RepositoryCategory[] = [
  'Backend',
  'Frontend',
  'AI / ML',
  'Security',
  'DevOps',
  'Automation',
  'Experiments',
]

const CATEGORY_COLOR: Record<RepositoryCategory, string> = {
  Backend: '#3dff8a',
  Frontend: '#5ce1e6',
  'AI / ML': '#ff8a4c',
  Security: '#3dff8a',
  DevOps: '#5ce1e6',
  Automation: '#8a8a8a',
  Experiments: '#5ce1e6',
}

const INNER_RADIUS = 0.78
const RING_START = 1.28
const RING_GAP = 0.28
const MAX_INNER_TECH = 6
const DOME_HEIGHT = 0.82

export function buildRepositoryGraph(
  repositories: Repository[],
  technologies: Technology[],
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const usage = new Map<string, number>()

  repositories.forEach((repository) => {
    repository.technologies.forEach((name) => {
      usage.set(name, (usage.get(name) ?? 0) + 1)
    })
  })

  const catalog = new Map(technologies.map((technology) => [technology.name.toLowerCase(), technology]))
  const rankedTech = [...usage.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_INNER_TECH)
    .map(([name]) => {
      const match = catalog.get(name.toLowerCase())
      return match ?? { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name }
    })

  rankedTech.forEach((technology, index) => {
    const angle = (index / Math.max(rankedTech.length, 1)) * Math.PI * 2 - Math.PI / 2
    const dome = Math.sqrt(Math.max(0, 1 - (INNER_RADIUS / 3.05) ** 2)) * DOME_HEIGHT
    nodes.push({
      id: `tech-${technology.id}`,
      kind: 'tech',
      label: technology.name,
      position: [Math.cos(angle) * INNER_RADIUS, dome, Math.sin(angle) * INNER_RADIUS],
    })
  })

  CATEGORY_ORDER.forEach((category, categoryIndex) => {
    const group = repositories.filter((repository) => repository.category === category)
    const radius = RING_START + categoryIndex * RING_GAP
    group.forEach((repository, index) => {
      const angle = (index / Math.max(group.length, 1)) * Math.PI * 2 - Math.PI / 2
      const jitter = index % 2 === 0 ? 0 : 0.08
      const orbit = radius + jitter
      const dome = Math.sqrt(Math.max(0, 1 - (orbit / 3.05) ** 2)) * DOME_HEIGHT
      nodes.push({
        id: repository.id,
        kind: 'repo',
        label: repository.name,
        category,
        position: [
          Math.cos(angle) * orbit,
          dome + (index % 3) * 0.1 - 0.1,
          Math.sin(angle) * orbit,
        ],
      })

      repository.technologies.forEach((techName) => {
        const tech = rankedTech.find((item) => item.name.toLowerCase() === techName.toLowerCase())
        if (!tech) return
        links.push({ source: repository.id, target: `tech-${tech.id}` })
      })
    })
  })

  return { nodes, links }
}

type RepositoryNetworkProps = {
  nodes: GraphNode[]
  links: GraphLink[]
  filter: RepositoryFilter
  hoveredRepoId: string | null
  hoveredTech: string | null
  onHoverRepo: (id: string | null) => void
  onSelectRepo: (id: string) => void
}

function isNodeActive(
  node: GraphNode,
  filter: RepositoryFilter,
  hoveredRepoId: string | null,
  hoveredTech: string | null,
  links: GraphLink[],
  nodes: GraphNode[],
) {
  if (hoveredTech) {
    if (node.kind === 'tech') return node.label === hoveredTech
    return links.some(
      (link) =>
        link.source === node.id && nodes.find((item) => item.id === link.target)?.label === hoveredTech,
    )
  }

  if (hoveredRepoId) {
    if (node.id === hoveredRepoId) return true
    return links.some(
      (link) =>
        (link.source === hoveredRepoId && link.target === node.id) ||
        (link.target === hoveredRepoId && link.source === node.id),
    )
  }

  if (filter === 'all') return true
  if (node.kind === 'repo') return node.category === filter
  return links.some((link) => {
    const repo = nodes.find((item) => item.id === link.source)
    return link.target === node.id && repo?.category === filter
  })
}

function OrbitRing({
  radius,
  color,
  opacity,
  y = 0,
}: {
  radius: number
  color: string
  opacity: number
  y?: number
}) {
  const points = useMemo(() => {
    const ring: Array<[number, number, number]> = []
    for (let index = 0; index <= 96; index += 1) {
      const angle = (index / 96) * Math.PI * 2
      ring.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius])
    }
    return ring
  }, [radius, y])

  return <Line points={points} color={color} lineWidth={1} transparent opacity={opacity} />
}

export function RepositoryNetwork({
  nodes,
  links,
  filter,
  hoveredRepoId,
  hoveredTech,
  onHoverRepo,
  onSelectRepo,
}: RepositoryNetworkProps) {
  const capability = useDeviceCapability()
  const reduced = useReducedMotion()
  const [tooltipId, setTooltipId] = useState<string | null>(null)
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const hoveredLinks = useMemo(() => {
    if (!hoveredRepoId && !hoveredTech) return []
    return links.filter((link) => {
      const source = nodeMap.get(link.source)
      const target = nodeMap.get(link.target)
      if (!source || !target) return false
      return (
        isNodeActive(source, filter, hoveredRepoId, hoveredTech, links, nodes) &&
        isNodeActive(target, filter, hoveredRepoId, hoveredTech, links, nodes)
      )
    })
  }, [filter, hoveredRepoId, hoveredTech, links, nodeMap, nodes])
  const hoveredKeys = useMemo(
    () => new Set(hoveredLinks.map((link) => `${link.source}-${link.target}`)),
    [hoveredLinks],
  )

  const packets = useMemo<NetworkEdge[]>(
    () =>
      hoveredLinks.flatMap((link) => {
        const source = nodeMap.get(link.source)
        const target = nodeMap.get(link.target)
        if (!source || !target) return []
        return [{ start: source.position, end: target.position }]
      }),
    [hoveredLinks, nodeMap],
  )

  const idleLinks = useMemo(
    () =>
      links.flatMap((link) => {
        const source = nodeMap.get(link.source)
        const target = nodeMap.get(link.target)
        if (!source || !target) return []
        if (hoveredKeys.has(`${link.source}-${link.target}`)) return []
        const active =
          isNodeActive(source, filter, hoveredRepoId, hoveredTech, links, nodes) &&
          isNodeActive(target, filter, hoveredRepoId, hoveredTech, links, nodes)
        return [{ start: source.position, end: target.position, active }]
      }),
    [filter, hoveredKeys, hoveredRepoId, hoveredTech, links, nodeMap, nodes],
  )

  return (
    <>
      <color attach="background" args={['#0b0b0b']} />
      <fog attach="fog" args={['#0b0b0b', 5.2, 9.5]} />
      <ambientLight intensity={0.28} />
      <pointLight position={[0, 2.2, 2.4]} color="#5ce1e6" intensity={1} distance={12} />
      <GridFloor position={[0, -0.35, 0]} size={7.2} reduced={reduced} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={!reduced}
        autoRotateSpeed={0.55}
        minDistance={4.4}
        maxDistance={6.8}
        minPolarAngle={0.32}
        maxPolarAngle={1.22}
        target={[0, 0.22, 0]}
        zoomSpeed={0.55}
      />
      <group>
        <mesh position={[0, DOME_HEIGHT * 0.92, 0]}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshBasicMaterial
            color={[0.4, 2.2, 2.1]}
            transparent
            opacity={0.16}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <group position={[0, DOME_HEIGHT * 0.92, 0]}>
          <HaloRing radius={0.34} tube={0.01} color="#5ce1e6" opacity={0.55} speed={0.35} reduced={reduced} />
          <mesh>
            <icosahedronGeometry args={[0.14, 0]} />
            <meshBasicMaterial color={[0.36, 2.2, 0.9]} wireframe transparent opacity={0.9} toneMapped={false} />
          </mesh>
        </group>

        {CATEGORY_ORDER.map((category, index) => {
          const active = filter === 'all' || filter === category
          const radius = RING_START + index * RING_GAP
          const y = Math.sqrt(Math.max(0, 1 - (radius / 3.05) ** 2)) * DOME_HEIGHT
          return (
            <OrbitRing
              key={category}
              radius={radius}
              y={y}
              color={CATEGORY_COLOR[category]}
              opacity={active ? 0.32 : 0.07}
            />
          )
        })}

        {idleLinks.length > 0 ? (
          <Segments limit={Math.max(idleLinks.length, 1)} lineWidth={0.7} transparent opacity={0.28}>
            {idleLinks.map((link, index) => (
              <Segment
                key={`idle-${index}`}
                start={link.start}
                end={link.end}
                color={link.active ? '#5ce1e6' : '#2a2a2a'}
              />
            ))}
          </Segments>
        ) : null}

        {hoveredLinks.map((link) => {
          const source = nodeMap.get(link.source)
          const target = nodeMap.get(link.target)
          if (!source || !target) return null
          return (
            <Line
              key={`${link.source}-${link.target}`}
              points={[source.position, target.position]}
              color="#3dff8a"
              lineWidth={1.4}
              transparent
              opacity={0.7}
            />
          )
        })}

        <DataPackets edges={packets} reduced={reduced} trails={capability !== 'low'} />

        {nodes.map((node) => {
          const active = isNodeActive(node, filter, hoveredRepoId, hoveredTech, links, nodes)
          const highlighted = node.id === hoveredRepoId || node.label === hoveredTech
          const showTooltip = highlighted || tooltipId === node.id
          const color =
            node.kind === 'repo' && node.category ? CATEGORY_COLOR[node.category] : '#5ce1e6'
          return (
            <group key={node.id}>
              <NetworkNode
                position={node.position}
                color={color}
                scale={node.kind === 'repo' ? 1.2 : 0.9}
                active={active}
                highlighted={highlighted || tooltipId === node.id}
                reduced={reduced}
                onPointerOver={() => {
                  setTooltipId(node.id)
                  if (node.kind === 'repo') onHoverRepo(node.id)
                }}
                onPointerOut={() => {
                  setTooltipId(null)
                  onHoverRepo(null)
                }}
                onClick={() => {
                  if (node.kind === 'repo') onSelectRepo(node.id)
                }}
              />
              {showTooltip ? (
                <Html
                  position={[node.position[0], node.position[1] + 0.22, node.position[2]]}
                  center
                  zIndexRange={[40, 0]}
                  style={{ pointerEvents: 'none', whiteSpace: 'nowrap', width: 'max-content' }}
                  wrapperClass="pointer-events-none"
                >
                  <div className="pointer-events-none w-max max-w-none whitespace-nowrap rounded border border-white/10 bg-void/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-fog">
                    {node.label}
                  </div>
                </Html>
              ) : null}
            </group>
          )
        })}
      </group>
      <SceneFx capability={capability} reduced={reduced} />
    </>
  )
}
