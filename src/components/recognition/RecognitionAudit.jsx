import { BadgeCheck, ChevronDown } from 'lucide-react'

const fmt = (n) => n.toFixed(1)

/**
 * Optional technical-evaluation details for a recognition record, collapsed
 * by default so the certificate stays the primary presentation. Native
 * <details> gives keyboard and screen-reader support; the bars fill from
 * empty when opened (CSS @starting-style, static under reduced motion).
 */
export default function RecognitionAudit({ audit }) {
  if (!audit) return null
  return (
    <details className="raudit">
      <summary className="raudit__summary">
        <span>Technical evaluation</span>
        <span className="raudit__score">
          {fmt(audit.composite)}
          <span className="raudit__scale">/{audit.scale}</span>
        </span>
        <ChevronDown className="raudit__chevron" size={15} strokeWidth={1.7} aria-hidden="true" />
      </summary>

      <div className="raudit__body">
        <p className="raudit__headline">
          <span className="raudit__grade">{audit.grade}</span>
          <span>
            {audit.distinction}
            <span className="raudit__cleared">
              <BadgeCheck size={14} strokeWidth={1.8} aria-hidden="true" />
              Academic audit: {audit.status}
            </span>
          </span>
        </p>

        <ul className="raudit__bars">
          {audit.categories.map((c, i) => (
            <li key={c.id} className="raudit__bar" style={{ '--v': c.score / audit.scale, '--i': i }}>
              <span className="raudit__label">{c.label}</span>
              <span className="raudit__value">
                {fmt(c.score)}
                <span className="raudit__scale">/{audit.scale}</span>
              </span>
              <span className="raudit__track" aria-hidden="true">
                <span className="raudit__fill" />
              </span>
            </li>
          ))}
        </ul>

        <p className="raudit__composite">
          <span>Composite performance rating</span>
          <strong>
            {fmt(audit.composite)} / {audit.scale}
          </strong>
        </p>
      </div>
    </details>
  )
}
