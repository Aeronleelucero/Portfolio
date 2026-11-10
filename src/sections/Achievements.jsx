import { useRef } from 'react'
import SectionHeader from '../components/ui/SectionHeader'
import { achievements, ACHIEVEMENT_TYPE_LABELS } from '../data/achievements'
import { useReveal } from '../hooks/useReveal'

export default function Achievements() {
  const root = useRef(null)
  useReveal(root)

  return (
    <section id="achievements" ref={root} className="section" aria-labelledby="achievements-title">
      <div className="station station--left" data-station="achievements">
        <div className="container">
          <div className="panel panel--wide">
            <SectionHeader
              id="achievements-title"
              number="06"
              label="Milestones"
              title="Milestones along the way."
            />
            <ol className="timeline">
              {achievements.map((a) => (
                <li key={a.id} className="timeline__item" data-reveal>
                  <span className="timeline__marker">{a.marker}</span>
                  <div className="timeline__body">
                    <p className="timeline__type">{ACHIEVEMENT_TYPE_LABELS[a.type]}</p>
                    <h3 className="timeline__title">{a.title}</h3>
                    <p className="timeline__org">{a.organization}</p>
                    <p className="timeline__desc">{a.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
