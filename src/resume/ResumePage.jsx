import { ArrowLeft, Download, Printer } from 'lucide-react'
import { profile } from '../data/profile'
import { education } from '../data/education'
import { skillCategories } from '../data/skills'
import { projects } from '../data/projects'
import { achievements, ACHIEVEMENT_TYPE_LABELS } from '../data/achievements'

const stripProtocol = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/**
 * Conventional resume rendered from the same data as the portfolio.
 * Readable on screen, optimized for print / "Save as PDF".
 */
export default function ResumePage() {
  const { email, phone, github, linkedin } = profile.contact
  const contacts = [
    { label: profile.location },
    phone && { label: phone.display, href: `tel:${phone.tel}` },
    email && { label: email, href: `mailto:${email}` },
    github && { label: stripProtocol(github), href: github },
    linkedin && { label: stripProtocol(linkedin), href: linkedin },
  ].filter(Boolean)

  // Milestones and projects already appear above; list only awards / experience.
  const honors = achievements.filter((a) => !['milestone', 'project'].includes(a.type))

  return (
    <>
      <div className="toolbar" role="toolbar" aria-label="Resume actions">
        <a href="/" className="toolbar__btn">
          <ArrowLeft size={16} aria-hidden="true" /> Portfolio
        </a>
        <a href={profile.cv.pdf} download={profile.cv.filename} className="toolbar__btn">
          <Download size={16} aria-hidden="true" /> Download CV (PDF)
        </a>
        <button type="button" className="toolbar__btn toolbar__btn--primary" onClick={() => window.print()}>
          <Printer size={16} aria-hidden="true" /> Print Resume
        </button>
      </div>

      <main className="sheet">
        <header className="r-header">
          <h1>{profile.fullName}</h1>
          <p className="r-role">
            {profile.title} | {profile.role}
          </p>
          <ul className="r-contacts">
            {contacts.map((c) => (
              <li key={c.label}>{c.href ? <a href={c.href}>{c.label}</a> : c.label}</li>
            ))}
          </ul>
        </header>

        <section className="r-section" aria-labelledby="r-summary">
          <h2 id="r-summary">Professional Summary</h2>
          <p>{profile.summary}</p>
        </section>

        <section className="r-section" aria-labelledby="r-education">
          <h2 id="r-education">Education</h2>
          {[...education].reverse().map((e) => (
            <article key={e.id} className="r-entry">
              <div className="r-entry__head">
                <h3>{e.credential}</h3>
                <span className="r-entry__date">{e.period}</span>
              </div>
              <p className="r-entry__sub">{e.institution}</p>
            </article>
          ))}
        </section>

        <section className="r-section" aria-labelledby="r-skills">
          <h2 id="r-skills">Technical Skills</h2>
          <dl className="r-skills">
            {skillCategories.map((c) => (
              <div key={c.id}>
                <dt>{c.label}</dt>
                <dd>{c.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="r-section" aria-labelledby="r-projects">
          <h2 id="r-projects">Projects</h2>
          {projects.filter((p) => p.inResume !== false).map((p) => (
            <article key={p.id} className="r-entry">
              <div className="r-entry__head">
                <h3>
                  {p.title}
                  {p.subtitle && ` — ${p.subtitle}`}
                </h3>
                <span className="r-entry__date">{p.meta}</span>
              </div>
              {p.highlights.length > 1 && <p className="r-entry__sub">{p.cvSummary ?? p.summary}</p>}
              <ul className="r-bullets">
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              {(p.links.github || p.links.demo) && (
                <p className="r-entry__links">
                  {p.links.github && <a href={p.links.github}>{stripProtocol(p.links.github)}</a>}
                  {p.links.github && p.links.demo && ' · '}
                  {p.links.demo && <a href={p.links.demo}>{stripProtocol(p.links.demo)}</a>}
                </p>
              )}
            </article>
          ))}
        </section>

        {honors.length > 0 && (
          <section className="r-section" aria-labelledby="r-honors">
            <h2 id="r-honors">Achievements &amp; Experience</h2>
            {honors.map((a) => (
              <article key={a.id} className="r-entry">
                <div className="r-entry__head">
                  <h3>{a.title}</h3>
                  <span className="r-entry__date">{a.marker}</span>
                </div>
                <p className="r-entry__sub">
                  {ACHIEVEMENT_TYPE_LABELS[a.type]} · {a.organization}
                </p>
                <p>{a.description}</p>
              </article>
            ))}
          </section>
        )}

        <section className="r-section" aria-labelledby="r-strengths">
          <h2 id="r-strengths">Additional Strengths</h2>
          <p>{profile.strengths.join(' • ')}</p>
        </section>
      </main>
    </>
  )
}
