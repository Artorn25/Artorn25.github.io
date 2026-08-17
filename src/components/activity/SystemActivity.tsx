import { useActivity } from '@hooks/useActivity'
import { Section } from '@layout/Section'
import { AnimatedCounter } from '@ui/AnimatedCounter'
import { ContributionGraph } from './ContributionGraph'
import { InteractiveTerminal } from '@terminal/InteractiveTerminal'

export function SystemActivity() {
  const { stats } = useActivity()

  return (
    <Section id="activity" index="05" label="SYSTEM ACTIVITY" title="Operational telemetry">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="COMMITS" value={stats.commits} />
        <Stat label="REPOSITORIES" value={stats.repositories} />
        <Stat label="LANGUAGES" value={stats.languages} />
        <Stat label="EXPERIMENTS" value={stats.experiments} />
      </div>
      <div data-reveal className="mt-8">
        <ContributionGraph />
      </div>
      <div data-reveal className="mt-8">
        <InteractiveTerminal />
      </div>
    </Section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div data-reveal className="border border-white/10 bg-panel/70 p-5">
      <p className="font-mono text-[10px] tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 font-mono text-3xl text-white">
        <AnimatedCounter value={value} />
      </p>
    </div>
  )
}
