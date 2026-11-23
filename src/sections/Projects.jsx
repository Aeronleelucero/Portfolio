import { useCallback, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import TagList from '../components/ui/TagList'
import InferenceFigure from '../components/ui/InferenceFigure'
import ScreenshotFigure from '../components/ui/ScreenshotFigure'
import LivePreviewCard from '../components/live/LivePreviewCard'
import LiveSiteModal from '../components/live/LiveSiteModal'
import { GitHubIcon } from '../components/ui/BrandIcons'
import { projects } from '../data/projects'
import { setActiveProject } from '../hooks/interaction'
import { useReveal } from '../hooks/useReveal'

function ProjectLinks({ links, title }) {
  if (!links.github && !links.demo) return null
  return (
    <div className="project__links" data-reveal>
      {links.github && (
        <a className="link-pill" href={links.github} target="_blank" rel="noopener noreferrer">
          <GitHubIcon size={16} />
          Source<span className="sr-only"> code for {title} on GitHub</span>
        </a>
      )}
      {links.demo && (
        <a className="link-pill" href={links.demo} target="_blank" rel="noopener noreferrer">
          <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
          Live demo<span className="sr-only"> of {title}</span>
        </a>
      )}
    </div>
  )
}

export default function Projects() {
  const root = useRef(null)
  const liveButton = useRef(null)
  const [liveProject, setLiveProject] = useState(null)
  const closeLive = useCallback(() => setLiveProject(null), [])
  useReveal(root)

  return (
    <section id="projects" ref={root} className="section" aria-labelledby="projects-title">
      <ol className="project-list">
        {projects.map((project, i) => (
          <li
            key={project.id}
            className={`station ${i % 2 === 0 ? 'station--left' : 'station--right'}`}
            data-station={`project-${project.id}`}
          >
            <div className="container">
              <article
                className={`panel project ${project.media ? 'project--media' : ''} ${project.live ? 'project--live' : ''} ${project.screenshot ? 'project--shot' : ''}`}
                aria-labelledby={`project-${project.id}-title`}
                onMouseEnter={() => setActiveProject(project.id)}
                onMouseLeave={() => setActiveProject(null)}
              >
                {i === 0 && (
                  <SectionHeader id="projects-title" number="05" label="Selected Projects" title="Things I have built." />
                )}
                <div className="project__meta" data-reveal>
                  <span className="project__index">
                    {project.index}
                    <span className="project__of"> / {project.total}</span>
                  </span>
                  <span className="project__category">
                    {project.featured && <span className="project__featured">Featured</span>}
                    {project.category}
                  </span>
                </div>
                <h3 id={`project-${project.id}-title`} className="project__title" data-reveal>
                  {project.title}
                  {project.subtitle && <span className="project__subtitle"> — {project.subtitle}</span>}
                </h3>
                <p className="project__tagline" data-reveal>
                  {project.meta}
                </p>
                <p className="project__summary" data-reveal>
                  {project.summary}
                </p>

                {project.live && (
                  <LivePreviewCard
                    live={project.live}
                    label={project.title}
                    suspended={Boolean(liveProject)}
                    onOpen={(event) => {
                      liveButton.current = event.currentTarget
                      setLiveProject(project)
                    }}
                  />
                )}

                {project.media && (
                  <InferenceFigure
                    src={project.media.src}
                    alt={project.media.alt}
                    inference={project.media.inference}
                  />
                )}

                {project.screenshot && <ScreenshotFigure {...project.screenshot} />}

                {project.description?.map((paragraph) => (
                  <p key={paragraph} className="project__description" data-reveal>
                    {paragraph}
                  </p>
                ))}

                {project.highlights.length > 0 && (
                  <ul className="project__highlights" data-reveal>
                    {project.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                <div data-reveal>
                  <TagList items={project.stack} label={`${project.title} technologies`} />
                </div>
                <ProjectLinks links={project.links} title={project.title} />
              </article>
            </div>
          </li>
        ))}
      </ol>
      <LiveSiteModal
        open={Boolean(liveProject)}
        live={liveProject?.live}
        title={liveProject?.title}
        onClose={closeLive}
        returnFocusRef={liveButton}
      />
    </section>
  )
}
