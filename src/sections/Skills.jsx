import { useEffect, useRef, useState } from 'react'
import SectionHeader from '../components/ui/SectionHeader'
import TagList from '../components/ui/TagList'
import { skillCategories } from '../data/skills'
import { setActiveSkill } from '../hooks/interaction'
import { useReveal } from '../hooks/useReveal'

/**
 * Categories are toggle buttons: hover/focus previews a category in the 3D
 * constellation, click (or tap) pins it. Fully usable without 3D.
 */
export default function Skills() {
  const root = useRef(null)
  const [pinned, setPinned] = useState(null)
  const [preview, setPreview] = useState(null)
  useReveal(root)

  const active = preview ?? pinned
  useEffect(() => {
    setActiveSkill(active)
  }, [active])
  useEffect(() => () => setActiveSkill(null), [])

  return (
    <section id="skills" ref={root} className="section" aria-labelledby="skills-title">
      <div className="station station--left" data-station="skills">
        <div className="container">
          <div className="panel panel--wide">
            <SectionHeader
              id="skills-title"
              number="04"
              label="Technical Expertise"
              title="A toolkit across the stack."
              lead="Select a category to bring it forward in the constellation."
              leadClassName="requires-3d"
            />
            <ul className="skills" onMouseLeave={() => setPreview(null)}>
              {skillCategories.map((cat) => {
                const isActive = active === cat.id
                return (
                  <li
                    key={cat.id}
                    className={`skill-cat ${isActive ? 'is-active' : ''}`}
                    data-reveal
                    onMouseEnter={() => setPreview(cat.id)}
                  >
                    <button
                      type="button"
                      className="skill-cat__toggle"
                      aria-pressed={pinned === cat.id}
                      onFocus={() => setPreview(cat.id)}
                      onBlur={() => setPreview(null)}
                      onClick={() => setPinned((p) => (p === cat.id ? null : cat.id))}
                    >
                      <span className="skill-cat__label">{cat.label}</span>
                      <span className="skill-cat__count">{String(cat.items.length).padStart(2, '0')}</span>
                    </button>
                    <p className="skill-cat__blurb">{cat.blurb}</p>
                    <TagList items={cat.items} label={`${cat.label} technologies`} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
