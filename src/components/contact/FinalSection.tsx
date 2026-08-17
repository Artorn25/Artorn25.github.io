import { useProfile } from '@hooks/useProfile'
import { Button } from '@ui/Button'

export function FinalSection() {
  const profile = useProfile()

  return (
    <section className="relative px-6 py-28 md:px-10" aria-label="Session complete">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] tracking-[0.28em] text-cyan/80">07 // SESSION</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          CONNECTION TERMINATED
        </h2>
        <p className="mt-4 font-mono text-xs tracking-[0.2em] text-neon">SYSTEM STATUS: ONLINE</p>
        <p className="mt-10 text-sm tracking-[0.18em] text-muted">Built with</p>
        <p className="mt-3 font-mono text-xs tracking-[0.2em] text-fog">
          React · Three.js · GSAP · TypeScript
        </p>
        <div className="mt-8 flex justify-center">
          <Button href={profile.githubUrl} external variant="primary">
            GITHUB
          </Button>
        </div>
        <p className="mt-10 font-mono text-neon">
          {profile.systemName.toLowerCase()}@portfolio:~$
          <span className="ml-1 inline-block w-2 animate-pulse bg-neon motion-reduce:animate-none">&nbsp;</span>
        </p>
      </div>
    </section>
  )
}
