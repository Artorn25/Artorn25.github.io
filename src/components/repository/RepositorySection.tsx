import { lazy, Suspense, useMemo, useRef } from 'react'
import { useGSAP } from '@animations/register'
import { animateFilterChange } from '@animations/repository'
import { revealOnScroll } from '@animations/scroll'
import { useRepositoryFeed } from '@hooks/useRepositories'
import { useTechnologies } from '@hooks/useTechnologies'
import { useMediaQuery } from '@hooks/useMediaQuery'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { usePortfolio } from '@context/PortfolioContext'
import { buildRepositoryGraph } from '@three/RepositoryNetwork'
import { SceneCanvas } from '@three/SceneCanvas'
import { Section } from '@layout/Section'
import { HudCorners } from '@layout/HudCorners'
import { RepositoryCard } from './RepositoryCard'
import { RepositoryFilter } from './RepositoryFilter'
import { RepositoryDetail } from './RepositoryDetail'

const RepositoryNetwork = lazy(() =>
  import('@three/RepositoryNetwork').then((module) => ({ default: module.RepositoryNetwork })),
)

export function RepositorySection() {
  const { repositories, loading, error } = useRepositoryFeed()
  const technologies = useTechnologies()
  const reduced = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const rootRef = useRef<HTMLDivElement>(null)
  const {
    filter,
    setFilter,
    hoveredRepoId,
    setHoveredRepoId,
    hoveredTech,
    selectedRepo,
    openRepository,
    closeRepository,
  } = usePortfolio()

  const visible = useMemo(
    () => (filter === 'all' ? repositories : repositories.filter((item) => item.category === filter)),
    [filter, repositories],
  )
  const graph = useMemo(
    () => buildRepositoryGraph(repositories, technologies),
    [repositories, technologies],
  )

  useGSAP(
    () => {
      if (rootRef.current) revealOnScroll(rootRef.current, reduced)
    },
    { scope: rootRef, dependencies: [reduced] },
  )

  useGSAP(
    () => {
      if (rootRef.current) animateFilterChange(rootRef.current, reduced)
    },
    { scope: rootRef, dependencies: [filter, reduced] },
  )

  return (
    <Section id="projects" index="02" label="REPOSITORY NETWORK" title="Connected systems">
      <div ref={rootRef}>
        <div data-reveal>
          <RepositoryFilter value={filter} onChange={setFilter} />
        </div>

        {!isMobile && repositories.length > 0 ? (
          <div data-reveal className="relative mt-8 h-[420px] overflow-hidden border border-white/8 bg-surface contain-[paint]">
            <HudCorners />
            <SceneCanvas className="cursor-grab active:cursor-grabbing" cameraPosition={[3.4, 2.6, 3.6]} fov={42}>
              <Suspense fallback={null}>
                <RepositoryNetwork
                  nodes={graph.nodes}
                  links={graph.links}
                  filter={filter}
                  hoveredRepoId={hoveredRepoId}
                  hoveredTech={hoveredTech}
                  onHoverRepo={setHoveredRepoId}
                  onSelectRepo={openRepository}
                />
              </Suspense>
            </SceneCanvas>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-8 font-mono text-xs tracking-[0.16em] text-muted">SYNCING REPOSITORY NETWORK...</p>
        ) : null}

        {error ? (
          <p className="mt-8 font-mono text-xs tracking-[0.14em] text-alert">
            Failed to reach backend: {error}. Start the API on :8080 and refresh.
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((repository) => (
            <RepositoryCard
              key={repository.id}
              repository={repository}
              dimmed={Boolean(hoveredRepoId && hoveredRepoId !== repository.id)}
              onHover={setHoveredRepoId}
              onOpen={openRepository}
            />
          ))}
        </div>
      </div>
      {selectedRepo ? <RepositoryDetail repository={selectedRepo} onClose={closeRepository} /> : null}
    </Section>
  )
}
