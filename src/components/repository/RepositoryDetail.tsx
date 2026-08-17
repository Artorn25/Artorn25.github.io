import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Repository } from '@/types/repository'
import { useGSAP } from '@animations/register'
import { animatePanelOpen } from '@animations/repository'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { StatusDot } from '@ui/StatusDot'
import { Button } from '@ui/Button'

type RepositoryDetailProps = {
  repository: Repository
  onClose: () => void
}

export function RepositoryDetail({ repository, onClose }: RepositoryDetailProps) {
  const panelRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (!panelRef.current) return
      animatePanelOpen(panelRef.current, reduced)
    },
    { dependencies: [repository.id, reduced] },
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.activeElement
    panelRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm">
      <button type="button" className="h-full flex-1 cursor-default border-0 bg-transparent" onClick={onClose} aria-label="Close repository panel" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="repo-detail-title"
        tabIndex={-1}
        className="h-full w-full max-w-lg overflow-y-auto border-l border-white/10 bg-surface p-6 outline-none md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-cyan/80">REPOSITORY</p>
            <h2 id="repo-detail-title" className="mt-2 text-2xl font-semibold text-white">
              {repository.name}
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted">STATUS</p>
            <div className="mt-2">
              <StatusDot status={repository.status} />
            </div>
          </div>
          <p className="leading-7 text-fog">{repository.longDescription}</p>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted">LANGUAGE</p>
            <p className="mt-2 font-mono text-cyan">{repository.language}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted">TECHNOLOGIES</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {repository.technologies.map((tech) => (
                <li key={tech} className="border border-white/10 px-2 py-1 font-mono text-[11px] text-fog">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted">ARCHITECTURE</p>
            <ol className="mt-3 space-y-2 font-mono text-xs text-fog">
              {repository.architecture.map((layer, index) => (
                <li key={layer} className="flex flex-col items-start">
                  <span>{layer}</span>
                  {index < repository.architecture.length - 1 ? (
                    <span className="ml-4 text-muted">↓</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted">SECURITY</p>
            <ul className="mt-2 space-y-1 text-fog">
              {repository.security.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button href={repository.githubUrl} external variant="primary">
            VIEW GITHUB
          </Button>
          <Button onClick={onClose}>CLOSE</Button>
        </div>
      </aside>
    </div>
  )
}
