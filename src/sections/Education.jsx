import { useRef } from 'react'
import { GraduationCap } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import { education } from '../data/education'
import { useReveal } from '../hooks/useReveal'

export default function Education() {
  const root = useRef(null)
  useReveal(root)

  return (
    <section id="education" ref={root} className="section" aria-labelledby="education-title">
      <ol className="edu-list">
        {education.map((entry, i) => (
          <li key={entry.id} className="station station--right" data-station={`education-${entry.id}`}>
            <div className="container">
              <article className="panel edu-card" aria-labelledby={`edu-${entry.id}`}>
                {i === 0 && (
                  <SectionHeader
                    id="education-title"
                    number="03"
                    label="Education"
                    title="A path through computing."
                  />
                )}
                <div className="edu-card__meta" data-reveal>
                  <span className="edu-card__step">
                    Stage {String(i + 1).padStart(2, '0')} / {String(education.length).padStart(2, '0')}
                  </span>
                  <span className="edu-card__period">{entry.period}</span>
                </div>
                <h3 id={`edu-${entry.id}`} className="edu-card__title" data-reveal>
                  <GraduationCap className="edu-card__icon" aria-hidden="true" size={22} strokeWidth={1.4} />
                  {entry.credential}
                </h3>
                <p className="edu-card__institution" data-reveal>
                  {entry.institution}
                </p>
                <p className="edu-card__summary" data-reveal>
                  {entry.summary}
                </p>
              </article>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
