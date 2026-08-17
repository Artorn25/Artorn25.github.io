import { lazy, Suspense } from 'react'
import { useProfile } from '@hooks/useProfile'
import { Section } from '@layout/Section'
import { AnimatedCounter } from '@ui/AnimatedCounter'
import { SceneCanvas } from '@three/SceneCanvas'
import { HudCorners } from '@layout/HudCorners'

const IdentityCore = lazy(() =>
  import('@three/IdentityCore').then((module) => ({ default: module.IdentityCore })),
)

export function Identity() {
  const profile = useProfile()

  return (
    <Section id="about" index="01" label="IDENTITY" title="Technical identity">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div data-reveal className="relative border border-white/10 bg-panel/70 p-6 md:p-8">
          <HudCorners />
          <p className="font-mono text-xs tracking-[0.24em] text-neon">
            {profile.rolePrimary || 'SOFTWARE DEVELOPER'}
          </p>
          <h3 className="mt-6 text-sm tracking-[0.22em] text-muted">FOCUS AREAS</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {profile.focusAreas.map((area) => (
              <li key={area} className="border border-white/8 bg-raised/60 px-3 py-2 text-sm text-fog">
                {area}
              </li>
            ))}
          </ul>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="PROJECTS" value={profile.stats.projects} />
            <Stat label="REPOSITORIES" value={profile.stats.repositories} />
            <Stat label="TECHNOLOGIES" value={profile.stats.technologies} />
            <Stat label="EXPERIMENTS" value={profile.stats.experiments} />
          </dl>
        </div>
        <div data-reveal className="relative h-72 overflow-hidden border border-white/8 bg-surface lg:h-80">
          <SceneCanvas cameraPosition={[0, 0, 3.2]} fov={50} interactive={false}>
            <Suspense fallback={null}>
              <IdentityCore />
            </Suspense>
          </SceneCanvas>
        </div>
      </div>
    </Section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-[0.2em] text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-2xl text-white">
        <AnimatedCounter value={value} />
      </dd>
    </div>
  )
}
