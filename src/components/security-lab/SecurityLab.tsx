import { useEffect, useState } from 'react'
import { useExperiments } from '@hooks/useExperiments'
import { usePortfolio } from '@context/PortfolioContext'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { Section } from '@layout/Section'
import { StatusDot } from '@ui/StatusDot'
import { HudCorners } from '@layout/HudCorners'
import { cx } from '@lib/cx'

export function SecurityLab() {
  const experiments = useExperiments()
  const { loading } = usePortfolio()
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState('')
  const [typed, setTyped] = useState('')
  const active = experiments.find((item) => item.id === activeId) ?? experiments[0]

  useEffect(() => {
    if (!activeId && experiments[0]) setActiveId(experiments[0].id)
  }, [activeId, experiments])

  useEffect(() => {
    if (!active) return
    const text = [
      `$ ${active.command}`,
      '',
      `STATUS: ${active.status.toUpperCase()}`,
      '',
      'RESULT:',
      active.result,
      '',
      'TECH:',
      active.technologies.join(' · '),
    ].join('\n')
    if (reduced) {
      setTyped(text)
      return
    }
    setTyped('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 2
      setTyped(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, 16)
    return () => window.clearInterval(timer)
  }, [active, reduced])

  if (!active) {
    return (
      <Section id="lab" index="04" label="SECURITY LAB" title="Experiment console">
        <p className="font-mono text-xs tracking-[0.16em] text-muted">
          {loading ? 'SYNCING LAB CONSOLE...' : 'No repository experiments detected.'}
        </p>
      </Section>
    )
  }

  return (
    <Section id="lab" index="04" label="SECURITY LAB" title="Experiment console">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ol className="space-y-2">
          {experiments.map((experiment) => (
            <li key={experiment.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveId(experiment.id)}
                onFocus={() => setActiveId(experiment.id)}
                onClick={() => setActiveId(experiment.id)}
                className={cx(
                  'flex w-full items-center justify-between border px-4 py-3 text-left font-mono text-xs tracking-[0.16em] transition-colors',
                  activeId === experiment.id
                    ? 'border-neon/40 bg-neon/10 text-neon'
                    : 'border-white/10 text-muted hover:text-white',
                )}
              >
                <span>
                  {experiment.index} // {experiment.name}
                </span>
                <StatusDot status={experiment.status} />
              </button>
            </li>
          ))}
        </ol>
        <div className="relative min-h-64 border border-white/10 bg-panel p-5">
          <HudCorners />
          <pre className="font-mono text-xs leading-6 whitespace-pre-wrap text-neon/90">{typed}</pre>
        </div>
      </div>
    </Section>
  )
}
