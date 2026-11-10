/** Chapter heading: "04 — Expertise" eyebrow, title and optional lead. */
export default function SectionHeader({ number, label, title, lead, leadClassName = '', id, as: Heading = 'h2' }) {
  return (
    <header className="section-header">
      <p className="eyebrow" data-reveal>
        <span className="eyebrow__num">{number}</span>
        <span className="eyebrow__rule" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <Heading id={id} className="section-title" data-reveal>
        {title}
      </Heading>
      {lead && (
        <p className={`section-lead ${leadClassName}`.trim()} data-reveal>
          {lead}
        </p>
      )}
    </header>
  )
}
