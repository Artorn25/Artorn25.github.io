import { useProfile } from '@hooks/useProfile'
import { ScanlineOverlay } from './ScanlineOverlay'
import { StatusBar } from './StatusBar'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const profile = useProfile()

  return (
    <div className="relative min-h-svh bg-void text-fog">
      <a
        href="#system"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-panel focus:px-4 focus:py-2"
      >
        Skip to system
      </a>
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" aria-hidden="true" />
      <ScanlineOverlay />
      <StatusBar />
      <p className="sr-only">{profile.systemName} portfolio</p>
      {children}
    </div>
  )
}
