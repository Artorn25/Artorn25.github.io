import { lazy, Suspense } from 'react'
import { usePortfolio } from '@context/PortfolioContext'
import { useAllRepositories } from '@hooks/useRepositories'
import { useTechnologies, useTechnologyGroups } from '@hooks/useTechnologies'
import { useMediaQuery } from '@hooks/useMediaQuery'
import { Section } from '@layout/Section'
import { SceneCanvas } from '@three/SceneCanvas'
import { TechnologyGroupList } from './TechnologyGroupList'

const TechnologyNetwork = lazy(() =>
  import('@three/TechnologyNetwork').then((module) => ({ default: module.TechnologyNetwork })),
)

export function TechnologyMatrix() {
  const technologies = useTechnologies()
  const groups = useTechnologyGroups()
  const repositories = useAllRepositories()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { hoveredTech, setHoveredTech, loading, error } = usePortfolio()
  const related = hoveredTech
    ? repositories.filter((repository) => repository.technologies.includes(hoveredTech))
    : []

  return (
    <Section id="stack" index="03" label="TECHNOLOGY MATRIX" title="Connected stack">
      {!isMobile && technologies.length > 0 ? (
        <div data-reveal className="relative mb-10 h-[380px] overflow-hidden border border-white/8 bg-surface">
          <SceneCanvas cameraPosition={[0, 0.4, 6.4]}>
            <Suspense fallback={null}>
              <TechnologyNetwork
                technologies={technologies}
                hoveredTech={hoveredTech}
                onHover={setHoveredTech}
              />
            </Suspense>
          </SceneCanvas>
        </div>
      ) : null}

      {loading ? (
        <p className="mb-8 font-mono text-xs tracking-[0.16em] text-muted">SYNCING TECHNOLOGY MATRIX...</p>
      ) : null}

      {error ? (
        <p className="mb-8 font-mono text-xs tracking-[0.14em] text-alert">Failed to reach backend: {error}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {groups.map((group) => (
          <TechnologyGroupList
            key={group}
            group={group}
            items={technologies.filter((technology) => technology.group === group)}
            hoveredTech={hoveredTech}
            onHover={setHoveredTech}
          />
        ))}
      </div>

      {hoveredTech ? (
        <p className="mt-8 font-mono text-xs tracking-[0.14em] text-muted">
          {hoveredTech} linked to {related.length} repositor{related.length === 1 ? 'y' : 'ies'}
        </p>
      ) : null}
    </Section>
  )
}
