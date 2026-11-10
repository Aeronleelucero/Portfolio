import { useRef } from 'react'
import { BrainCircuit, GraduationCap, Layers, RefreshCw, ShieldCheck, Terminal } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import TagList from '../components/ui/TagList'
import { GitHubIcon, LinkedInIcon } from '../components/ui/BrandIcons'
import { profile } from '../data/profile'
import { useReveal } from '../hooks/useReveal'

const HIGHLIGHT_ICONS = {
  degree: GraduationCap,
  stack: Layers,
  security: ShieldCheck,
  ai: BrainCircuit,
  linux: Terminal,
  growth: RefreshCw,
}

function Portrait() {
  const { photo } = profile
  return (
    <figure className="portrait" data-reveal>
      <div className="portrait__frame">
        <img
          src={photo.src}
          srcSet={`${photo.srcSmall} 480w, ${photo.src} 960w`}
          sizes="(max-width: 820px) 60vw, 15rem"
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption className="portrait__caption">
        <span>{profile.fullName}</span>
        <span className="portrait__role">{profile.title}</span>
        <span className="portrait__role portrait__role--accent">{profile.secondaryTitle}</span>
      </figcaption>
    </figure>
  )
}

/** Primary title + secondary identity, intro line and profile highlights. */
function ProfessionalProfile() {
  const { identity } = profile
  return (
    <section className="identity" aria-labelledby="identity-title" data-reveal>
      <p className="identity__label">Professional profile</p>
      <h3 id="identity-title" className="identity__title">
        <span className="identity__primary">{profile.title}</span>
        <span className="identity__divider" aria-hidden="true" />
        <span className="identity__secondary">
          <ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" />
          {profile.secondaryTitle}
        </span>
      </h3>
      <p className="identity__intro">{identity.intro}</p>
      <ul className="identity__grid">
        {identity.highlights.map(({ icon, text }) => {
          const Icon = HIGHLIGHT_ICONS[icon]
          return (
            <li key={text} className="identity__item">
              {Icon && <Icon className="identity__icon" size={17} strokeWidth={1.5} aria-hidden="true" />}
              <span>{text}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function About() {
  const root = useRef(null)
  useReveal(root)
  const { github, linkedin } = profile.contact
  const socials = [
    github && { label: 'GitHub', href: github, Icon: GitHubIcon },
    linkedin && { label: 'LinkedIn', href: linkedin, Icon: LinkedInIcon },
  ].filter(Boolean)

  return (
    <section id="about" ref={root} className="section" aria-labelledby="about-title">
      <div className="station station--right" data-station="about">
        <div className="container">
          <div className="panel panel--about">
            <div className="about__grid">
              <Portrait />
              <div className="about__content">
                <SectionHeader
                  id="about-title"
                  number="02"
                  label="About"
                  title="Building practical software with reliable foundations."
                />
                <div className="about__body">
                  {profile.about.map((p, i) => (
                    <p key={i} data-reveal>
                      {p}
                    </p>
                  ))}
                </div>
                <div className="about__focus" data-reveal>
                  <TagList items={profile.focus} label="Areas of focus" />
                </div>
                {socials.length > 0 && (
                  <ul className="about__links" aria-label="Profiles" data-reveal>
                    {socials.map(({ label, href, Icon }) => (
                      <li key={label}>
                        <a className="link-pill" href={href} target="_blank" rel="noopener noreferrer">
                          <Icon size={16} />
                          {label}
                          <span className="sr-only"> profile (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <ProfessionalProfile />

            <dl className="facts" data-reveal>
              {profile.facts.map((f) => (
                <div key={f.label} className="facts__item">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
