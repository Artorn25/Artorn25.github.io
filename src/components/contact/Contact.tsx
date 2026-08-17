import { lazy, Suspense } from 'react'
import { Mail } from 'lucide-react'
import type { CSSProperties } from 'react'
import { GithubIcon, LinkedinIcon } from '@ui/Icons'
import { useProfile } from '@hooks/useProfile'
import { useMediaQuery } from '@hooks/useMediaQuery'
import { Section } from '@layout/Section'
import { Button } from '@ui/Button'
import { StatusDot } from '@ui/StatusDot'
import { HudCorners } from '@layout/HudCorners'
import { SceneCanvas } from '@three/SceneCanvas'

const ConnectionBeacon = lazy(() =>
  import('@three/ConnectionBeacon').then((module) => ({ default: module.ConnectionBeacon })),
)

export function Contact() {
  const profile = useProfile()
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Section id="contact" index="06" label="ESTABLISH CONNECTION" title="Available for collaboration">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div data-reveal>
          <StatusDot status="online" className="mb-6" />
          <p className="font-mono text-xs tracking-[0.2em] text-muted">SYSTEM STATUS: ONLINE</p>
          <h3 className="mt-6 text-sm tracking-[0.2em] text-muted">AVAILABLE FOR</h3>
          <ul className="mt-4 space-y-2">
            {profile.availableFor.map((item) => (
              <li key={item} className="border border-white/8 px-4 py-2 text-sm text-fog">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={profile.githubUrl} external variant="primary">
              <GithubIcon size={14} />
              GITHUB
            </Button>
            {profile.linkedinUrl ? (
              <Button href={profile.linkedinUrl} external>
                <LinkedinIcon size={14} />
                LINKEDIN
              </Button>
            ) : null}
            {profile.email ? (
              <Button href={`mailto:${profile.email}`}>
                <Mail size={14} aria-hidden="true" />
                EMAIL
              </Button>
            ) : null}
          </div>
        </div>
        {isMobile ? (
          <NetworkCollapse />
        ) : (
          <div
            data-reveal
            className="relative h-72 overflow-hidden border border-white/8 bg-surface contain-[paint] lg:h-80"
          >
            <HudCorners />
            <SceneCanvas cameraPosition={[0, 0.38, 2.55]} fov={38}>
              <Suspense fallback={null}>
                <ConnectionBeacon channels={profile.availableFor} />
              </Suspense>
            </SceneCanvas>
          </div>
        )}
      </div>
    </Section>
  )
}

function NetworkCollapse() {
  const nodes = Array.from({ length: 12 }, (_, index) => index)

  return (
    <div data-reveal className="relative grid h-72 place-items-center border border-white/8 bg-surface">
      {nodes.map((node) => {
        const angle = (node / nodes.length) * Math.PI * 2
        const x = Math.cos(angle) * 38
        const y = Math.sin(angle) * 38
        return (
          <span
            key={node}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan/70 motion-reduce:animate-none"
            style={
              {
                '--tx': `${x}%`,
                '--ty': `${y}%`,
                animation: `pulse-node 3.6s ease-in-out ${node * 0.12}s infinite`,
              } as CSSProperties
            }
          />
        )
      })}
      <span className="relative h-4 w-4 rounded-full bg-neon shadow-[0_0_24px_rgba(61,255,138,0.6)]" />
      <style>{`
        @keyframes pulse-node {
          0%, 100% { opacity: 0.35; transform: translate(var(--tx), var(--ty)) scale(0.85); }
          50% { opacity: 1; transform: translate(calc(var(--tx) * 0.18), calc(var(--ty) * 0.18)) scale(1); }
        }
      `}</style>
    </div>
  )
}
