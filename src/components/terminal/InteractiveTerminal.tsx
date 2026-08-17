import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useProfile } from '@hooks/useProfile'
import { useRepositorySummary } from '@hooks/useRepositories'
import { useTechnologies } from '@hooks/useTechnologies'
import { HudCorners } from '@layout/HudCorners'

type Line = {
  id: number
  text: string
}

const COMMANDS = ['help', 'about', 'projects', 'stack', 'github', 'contact', 'clear'] as const

export function InteractiveTerminal() {
  const profile = useProfile()
  const summary = useRepositorySummary()
  const technologies = useTechnologies()
  const [lines, setLines] = useState<Line[]>([
    { id: 0, text: `${profile.systemName.toLowerCase()}@portfolio:~$ help` },
    { id: 1, text: 'Available commands: help, about, projects, stack, github, contact, clear' },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(2)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [lines])

  const push = (text: string) => {
    idRef.current += 1
    setLines((current) => [...current, { id: idRef.current, text }])
  }

  const run = (input: string) => {
    const command = input.trim().toLowerCase()
    push(`user@portfolio:~$ ${input}`)
    if (!command) return

    switch (command) {
      case 'help':
        push(`Available commands: ${COMMANDS.join(', ')}`)
        break
      case 'about':
        push(`${profile.rolePrimary} & ${profile.roleSecondary}`)
        push(profile.headline)
        break
      case 'projects':
        push('Scanning repository network...')
        push(`> ${summary.total} repositories found`)
        push(`> ${summary.backend} backend systems`)
        push(`> ${summary.frontend} frontend applications`)
        push(`> ${summary.ai} AI experiments`)
        push(`> ${summary.security} security projects`)
        break
      case 'stack':
        push(technologies.map((technology) => technology.name).join(' · ') || 'No stack detected yet')
        break
      case 'github':
        push(profile.githubUrl)
        break
      case 'contact':
        if (profile.email) push(profile.email)
        if (profile.linkedinUrl) push(profile.linkedinUrl)
        if (!profile.email && !profile.linkedinUrl) push(profile.githubUrl)
        break
      case 'clear':
        setLines([])
        break
      default:
        push(`command not found: ${command}`)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const next = value
    setHistory((current) => (next.trim() ? [...current, next] : current))
    setHistoryIndex(-1)
    setValue('')
    run(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setValue(history[nextIndex] ?? '')
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = historyIndex + 1
      if (nextIndex >= history.length) {
        setHistoryIndex(-1)
        setValue('')
        return
      }
      setHistoryIndex(nextIndex)
      setValue(history[nextIndex] ?? '')
    }
  }

  return (
    <div
      className="relative border border-white/10 bg-panel p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <HudCorners />
      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-muted">INTERACTIVE TERMINAL</p>
      <div className="max-h-64 overflow-y-auto font-mono text-xs leading-6 text-neon/90">
        {lines.map((line) => (
          <p key={line.id}>{line.text}</p>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2 font-mono text-xs text-neon">
        <label htmlFor="terminal-input" className="shrink-0">
          user@portfolio:~$
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          className="w-full border-0 bg-transparent text-white outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </form>
    </div>
  )
}
