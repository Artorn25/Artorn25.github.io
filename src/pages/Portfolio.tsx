import { useCallback, useRef, useState } from 'react'
import { useGSAP } from '@animations/register'
import { revealOnScroll } from '@animations/scroll'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { PortfolioProvider } from '@context/PortfolioContext'
import { AppShell } from '@layout/AppShell'
import { BootSequence } from '@layout/BootSequence'
import { Navbar } from '@navigation/Navbar'
import { Hero } from '@hero/Hero'
import { Identity } from '@about/Identity'
import { RepositorySection } from '@repository/RepositorySection'
import { TechnologyMatrix } from '@technology/TechnologyMatrix'
import { SecurityLab } from '@security-lab/SecurityLab'
import { SystemActivity } from '@activity/SystemActivity'
import { Contact } from '@contact/Contact'
import { FinalSection } from '@contact/FinalSection'

export function Portfolio() {
  const [booted, setBooted] = useState(false)
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const completeBoot = useCallback(() => setBooted(true), [])

  useGSAP(
    () => {
      if (!booted || !rootRef.current) return
      revealOnScroll(rootRef.current, reduced)
    },
    { dependencies: [booted, reduced] },
  )

  return (
    <PortfolioProvider>
      <AppShell>
        {!booted ? <BootSequence onComplete={completeBoot} /> : null}
        <Navbar />
        <div ref={rootRef}>
          <Hero />
          <Identity />
          <RepositorySection />
          <TechnologyMatrix />
          <SecurityLab />
          <SystemActivity />
          <Contact />
          <FinalSection />
        </div>
      </AppShell>
    </PortfolioProvider>
  )
}
