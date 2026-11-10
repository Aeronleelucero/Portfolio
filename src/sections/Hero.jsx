import { useLayoutEffect, useRef } from 'react'
import { ArrowDown, Download, MapPin } from 'lucide-react'
import Button from '../components/ui/Button'
import { profile } from '../data/profile'
import { gsap, scrollToId } from '../animations/scrollConfig'
import { useReducedMotion } from '../hooks/useDeviceProfile'

const splitChars = (text) =>
  [...text].map((ch, i) => (
    <span key={i} className="char" aria-hidden="true">
      {ch === ' ' ? ' ' : ch}
    </span>
  ))

export default function Hero() {
  const root = useRef(null)
  const reducedMotion = useReducedMotion()

  // Opening title sequence.
  useLayoutEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.25 })
      tl.from('.hero__eyebrow', { autoAlpha: 0, y: 16, duration: 0.9 })
        .from('.hero__name .char', { yPercent: 115, duration: 1.2, stagger: 0.025 }, '-=0.5')
        .from('.hero__tagline, .hero__location, .hero__actions', { autoAlpha: 0, y: 18, duration: 1, stagger: 0.1 }, '-=0.8')
        .from('.hero__hud, .scroll-indicator', { autoAlpha: 0, duration: 1.2 }, '-=0.6')
    }, root)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="hero" ref={root} className="section hero" data-station="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">
            <span className="eyebrow__rule" aria-hidden="true" />
            <span>{profile.headline}</span>
          </p>

          <h1 id="hero-title" className="hero__name">
            <span className="sr-only">{profile.fullName}</span>
            {profile.nameLines.map((line, i) => (
              <span key={line} className={`hero__line ${i === profile.nameLines.length - 1 ? 'hero__line--outline' : ''}`}>
                {splitChars(line.toUpperCase())}
              </span>
            ))}
          </h1>

          <p className="hero__tagline">{profile.tagline}</p>

          <p className="hero__location">
            <MapPin size={14} strokeWidth={1.6} aria-hidden="true" />
            {profile.location}
          </p>

          <div className="hero__actions">
            <Button icon={Download} href={profile.cv.pdf} download={profile.cv.filename}>
              Download CV
            </Button>
            <Button variant="ghost" icon={ArrowDown} onClick={() => scrollToId('projects', reducedMotion)}>
              View Projects
            </Button>
          </div>
        </div>
      </div>

      <div className="hero__hud" aria-hidden="true">
        <span className="hud__line" />
        <span className="hud__label">Digital Core</span>
        <span className="hud__meta">SE · AI · Backend</span>
      </div>

      <a
        href="#about"
        className="scroll-indicator"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('about', reducedMotion)
        }}
      >
        <span className="scroll-indicator__text">Scroll to explore</span>
        <span className="scroll-indicator__line" aria-hidden="true" />
      </a>
    </section>
  )
}
