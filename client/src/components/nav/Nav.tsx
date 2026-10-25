import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from '../icons/ArrowUpRight'

const LINKS = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Work Experience' },
  { href: '#blog', label: 'Read blogs' },
  { href: '#about', label: 'About' },
]

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = () => setMenuOpen(false)

  // Escape closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="relative mx-auto w-full max-w-[1340px] px-7 pt-7">
      <nav aria-label="Main" className="flex w-full flex-wrap items-center justify-between gap-6 py-1.5">
        <a href="#" className="font-display text-[19px] font-bold tracking-tight">
          Portfolio<span className="text-accent">.</span>
        </a>

        {/* Desktop links (≥1024) */}
        <div className="hidden items-center gap-[18px] text-[14px] font-medium text-fg-subtle lg:flex">
          {LINKS.map((link, i) => (
            <span key={link.href} className="contents">
              {i > 0 && (
                <span aria-hidden="true" className="text-border">
                  /
                </span>
              )}
              <a href={link.href} className="transition-colors duration-150 hover:text-fg">
                {link.label}
              </a>
            </span>
          ))}
        </div>

        {/* Get in touch (tablet + desktop) */}
        <a
          href="#contact"
          className="hidden items-center gap-[9px] text-[14px] font-bold text-fg transition-opacity duration-150 hover:opacity-70 md:flex"
        >
          Get in touch
          <ArrowUpRight size={13} strokeWidth={2.2} />
        </a>

        {/* Hamburger (mobile only) */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex cursor-pointer flex-col gap-[5px] p-1.5 md:hidden"
        >
          <span className="block h-0.5 w-[22px] bg-fg" />
          <span className="block h-0.5 w-[22px] bg-fg" />
        </button>
      </nav>

      {/* Mobile menu (sits in the page flow, per the design) */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="mt-2 flex flex-col gap-3.5 border-t border-line px-1 pt-[18px] pb-[22px] text-[15px] font-medium text-fg md:hidden"
      >
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <a href="#contact" onClick={closeMenu} className="font-bold text-accent">
          Get in touch <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  )
}
