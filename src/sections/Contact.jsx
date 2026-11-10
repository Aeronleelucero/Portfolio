import { useRef } from 'react'
import { ArrowUpRight, Download, Mail, MapPin, Phone, Printer } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import { GitHubIcon, LinkedInIcon } from '../components/ui/BrandIcons'
import { profile } from '../data/profile'
import { useReveal } from '../hooks/useReveal'

const stripProtocol = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

// Allow long URLs to wrap after each "/" (browsers also wrap after hyphens).
const breakableUrl = (url) =>
  stripProtocol(url)
    .split('/')
    .flatMap((part, i, all) => (i < all.length - 1 ? [part, '/', <wbr key={i} />] : [part]))

// Let long addresses wrap at the "@" rather than mid-word.
const breakableEmail = (email) => {
  const [user, domain] = email.split('@')
  return (
    <>
      {user}
      <wbr />@{domain}
    </>
  )
}

export default function Contact() {
  const root = useRef(null)
  useReveal(root)
  const { email, phone, github, linkedin } = profile.contact

  const channels = [
    email && { id: 'email', label: 'Email', value: breakableEmail(email), href: `mailto:${email}`, Icon: Mail },
    phone && { id: 'phone', label: 'Phone', value: phone.display, href: `tel:${phone.tel}`, Icon: Phone },
    github && { id: 'github', label: 'GitHub', value: stripProtocol(github), href: github, Icon: GitHubIcon, external: true },
    linkedin && { id: 'linkedin', label: 'LinkedIn', value: breakableUrl(linkedin), href: linkedin, Icon: LinkedInIcon, external: true },
  ].filter(Boolean)

  return (
    <section id="contact" ref={root} className="section" aria-labelledby="contact-title">
      <div className="station station--center station--finale" data-station="contact">
        <div className="container">
          <div className="panel panel--contact">
            <SectionHeader
              id="contact-title"
              number="07"
              label="Contact"
              title="Let’s build what’s next."
              lead="Open to conversations about software development roles, collaborations and projects."
            />

            <p className="contact__location" data-reveal>
              <MapPin size={15} strokeWidth={1.6} aria-hidden="true" />
              {profile.location}
            </p>

            {channels.length > 0 && (
              <ul className="channels" data-reveal>
                {channels.map(({ id, label, value, href, Icon, external }) => (
                  <li key={id}>
                    <a
                      className="channel"
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <span className="channel__top" aria-hidden="true">
                        <span className="channel__icon">
                          <Icon size={18} />
                        </span>
                        <ArrowUpRight className="channel__arrow" size={18} strokeWidth={1.6} />
                      </span>
                      <span className="channel__label">{label}</span>
                      <span className="channel__value">{value}</span>
                      {external && <span className="sr-only"> (opens in a new tab)</span>}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="contact__actions" data-reveal>
              <Button icon={Download} href={profile.cv.pdf} download={profile.cv.filename}>
                Download CV
              </Button>
              <Button variant="ghost" icon={Printer} href={profile.cv.web}>
                Print Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
