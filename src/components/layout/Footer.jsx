import { profile } from '../../data/profile'
import { GitHubIcon, LinkedInIcon } from '../ui/BrandIcons'

export default function Footer() {
  const { github, linkedin } = profile.contact
  const socials = [
    github && { label: 'GitHub', href: github, Icon: GitHubIcon },
    linkedin && { label: 'LinkedIn', href: linkedin, Icon: LinkedInIcon },
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.fullName}
        </p>
        <p className="footer__meta">
          <a href={profile.cv.pdf} download={profile.cv.filename}>Download CV</a> ·{' '}
          <a href={profile.cv.web}>Printable resume</a>
        </p>
        {socials.length > 0 && (
          <ul className="footer__social" aria-label="Social links">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="footer__social-link">
                  <Icon size={16} />
                  {label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  )
}
