import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { GithubIcon } from '@ui/Icons'
import { useProfile } from '@hooks/useProfile'
import { Button } from '@ui/Button'
import { cx } from '@lib/cx'

const LINKS = [
  { href: '#about', label: 'ABOUT' },
  { href: '#projects', label: 'PROJECTS' },
  { href: '#stack', label: 'STACK' },
  { href: '#lab', label: 'LAB' },
  { href: '#activity', label: 'ACTIVITY' },
  { href: '#contact', label: 'CONTACT' },
]

export function Navbar() {
  const profile = useProfile()
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      ref={headerRef}
      className={cx(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-300 ease-out',
        scrolled ? 'glass-nav' : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Primary">
        <a href="#system" className="font-mono text-xs tracking-[0.28em] text-white">
          {profile.systemName}
        </a>
        <div className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] tracking-[0.2em] text-muted transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <Button href={profile.githubUrl} external variant="outline">
            <GithubIcon size={14} />
            GITHUB
          </Button>
        </div>
        <button
          type="button"
          className="border border-white/10 p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </nav>
      {open ? (
        <div id="mobile-nav" className="border-t border-white/10 bg-void/95 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs tracking-[0.2em] text-fog"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button href={profile.githubUrl} external>
              GITHUB
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
