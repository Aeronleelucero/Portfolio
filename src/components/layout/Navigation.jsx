import { useEffect, useRef, useState } from 'react'
import { Download, Menu, X } from 'lucide-react'
import { CHAPTERS, scrollToId } from '../../animations/scrollConfig'
import { profile } from '../../data/profile'
import { useReducedMotion } from '../../hooks/useDeviceProfile'

const LINKS = CHAPTERS.slice(1)

export default function Navigation({ active }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reducedMotion = useReducedMotion()
  const toggleRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('menu-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('menu-open')
    }
  }, [open])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id, reducedMotion)
  }

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner">
        <a href="#hero" className="nav__brand" onClick={(e) => go(e, 'hero')} aria-label={`${profile.fullName} — back to top`}>
          <span className="nav__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="nav__name">{profile.firstName} {profile.lastName}</span>
        </a>

        <nav aria-label="Primary" className="nav__primary">
          <ul className="nav__links" id="nav-links">
            {LINKS.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className={`nav__link ${active === c.id ? 'is-active' : ''}`}
                  aria-current={active === c.id ? 'location' : undefined}
                  onClick={(e) => go(e, c.id)}
                >
                  <span className="nav__num" aria-hidden="true">{c.number}</span>
                  {c.label}
                </a>
              </li>
            ))}
            <li className="nav__resume-item">
              <a className="nav__resume" href={profile.cv.pdf} download={profile.cv.filename}>
                <Download size={15} strokeWidth={1.7} aria-hidden="true" />
                Download CV
              </a>
            </li>
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
        </button>
      </div>
    </header>
  )
}
