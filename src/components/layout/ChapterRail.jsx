import { useEffect, useRef } from 'react'
import { CHAPTERS, ScrollTrigger, scrollToId } from '../../animations/scrollConfig'
import { useReducedMotion } from '../../hooks/useDeviceProfile'

/**
 * Fixed chapter index on the right edge (desktop): shows the current chapter
 * and overall journey progress, and doubles as quick navigation.
 */
export default function ChapterRail({ active }) {
  const fill = useRef(null)
  const reducedMotion = useReducedMotion()
  const current = CHAPTERS.find((c) => c.id === active) ?? CHAPTERS[0]

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (fill.current) fill.current.style.transform = `scaleY(${self.progress})`
      },
    })
    return () => st.kill()
  }, [])

  return (
    <nav className="rail" aria-label="Chapters">
      <p className="rail__counter" aria-hidden="true">
        <span className="rail__current">{current.number}</span>
        <span className="rail__total">/ {CHAPTERS[CHAPTERS.length - 1].number}</span>
      </p>
      <div className="rail__track" aria-hidden="true">
        <span ref={fill} className="rail__fill" />
      </div>
      <ol className="rail__list">
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className={`rail__dot ${active === c.id ? 'is-active' : ''}`}
              aria-current={active === c.id ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(c.id, reducedMotion)
              }}
            >
              <span className="rail__label">{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
