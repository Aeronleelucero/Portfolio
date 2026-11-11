import { useRef } from 'react'
import SectionHeader from '../components/ui/SectionHeader'
import RecognitionGallery from '../components/recognition/RecognitionGallery'
import { useReveal } from '../hooks/useReveal'

export default function Achievements() {
  const root = useRef(null)
  useReveal(root)

  return (
    <section id="achievements" ref={root} className="section" aria-labelledby="achievements-title">
      <div className="station station--left" data-station="achievements">
        <div className="container">
          <div className="panel panel--gallery">
            <SectionHeader
              id="achievements-title"
              number="06"
              label="Certifications & Achievements"
              title="Credentials & Recognition."
              lead="A collection of certifications, competitions, and experiences that represent my continuous learning and professional development."
            />

            <RecognitionGallery />
          </div>
        </div>
      </div>
    </section>
  )
}
