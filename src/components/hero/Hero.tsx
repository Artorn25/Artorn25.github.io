import { lazy, Suspense, useRef } from 'react'
import { GithubIcon } from '@ui/Icons'
import { useGSAP } from '@animations/register'
import { animateHeroIntro } from '@animations/hero'
import { useProfile } from '@hooks/useProfile'
import { useRepositorySummary } from '@hooks/useRepositories'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { Button } from '@ui/Button'
import { HeroTerminal } from './HeroTerminal'
import { SceneCanvas } from '@three/SceneCanvas'

const SecurityScene = lazy(() =>
  import('@three/SecurityScene').then((module) => ({ default: module.SecurityScene })),
)

export function Hero() {
  const profile = useProfile()
  const summary = useRepositorySummary()
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const archiveCount = summary.total > 0 ? summary.total : profile.stats.repositories

  useGSAP(
    () => {
      if (!rootRef.current) return
      animateHeroIntro(rootRef.current, reduced)
    },
    { dependencies: [reduced] },
  )

  return (
    <section id="system" ref={rootRef} className="relative isolate min-h-svh overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SceneCanvas className="h-full w-full" cameraPosition={[0, 0.2, 6.8]} eager interactive={false}>
          <Suspense fallback={null}>
            <SecurityScene />
          </Suspense>
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 py-28 md:px-10">
        <p data-hero-meta className="font-mono text-[11px] tracking-[0.28em] text-cyan/80">
          00 // ARCHIVE
        </p>
        <div className="mt-6 max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            <span data-hero-line className="block">
              REPOSITORY
            </span>
            <span data-hero-line className="mt-2 block text-fog/70">
              &amp;
            </span>
            <span data-hero-line className="block">
              SOURCE FOLDER
            </span>
          </h1>
          <p data-hero-line className="mt-6 max-w-md text-base leading-7 text-muted md:text-lg">
            {archiveCount > 0
              ? `A mounted archive of ${archiveCount} GitHub repositories — indexed, categorized, and ready to inspect.`
              : 'A mounted archive of GitHub repositories — indexed, categorized, and ready to inspect.'}
          </p>
          <div data-hero-actions className="mt-8 flex flex-wrap gap-3">
            <Button href="#projects" variant="primary">
              OPEN ARCHIVE
            </Button>
            <Button href={profile.githubUrl} external>
              <GithubIcon size={14} />
              GITHUB
            </Button>
          </div>
        </div>

        <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3" data-hero-meta>
          <Meta label="ARCHIVE STATUS" value="MOUNTED" />
          <Meta label="REPOSITORY SYNC" value="ACTIVE" />
          <Meta label="INDEX STATUS" value="LIVE" />
        </div>

        <div className="mt-10">
          <HeroTerminal />
        </div>
      </div>
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/8 bg-panel/50 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 font-mono text-xs tracking-[0.18em] text-neon">{value}</p>
    </div>
  )
}
