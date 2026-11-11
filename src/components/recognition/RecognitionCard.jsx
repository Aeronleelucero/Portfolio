import { useRef } from 'react'
import { ExternalLink, Maximize2 } from 'lucide-react'
import { CATEGORY_LABELS } from '../../data/recognition'

const MAX_TILT = 3 // degrees

/**
 * One gallery card. The image is a button (keyboard + touch) that opens the
 * full-size preview; clicking anywhere else on the card does the same for
 * mouse users. Links inside the card keep their own behavior.
 */
export default function RecognitionCard({ item, index, onOpen, allowTilt, opening = false }) {
  const card = useRef(null)
  const isPhotoCrop = item.layout === 'photo'

  const tilt = (e) => {
    if (!allowTilt || e.pointerType !== 'mouse' || !card.current) return
    const r = card.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.current.style.setProperty('--ry', `${(x * MAX_TILT * 2).toFixed(2)}deg`)
    card.current.style.setProperty('--rx', `${(-y * MAX_TILT * 2).toFixed(2)}deg`)
  }
  const resetTilt = () => {
    card.current?.style.removeProperty('--rx')
    card.current?.style.removeProperty('--ry')
  }

  const openFromCard = (e) => {
    if (e.target.closest('a, button')) return
    onOpen(item)
  }

  return (
    <article
      ref={card}
      className={`rcard rcard--${item.layout} ${opening ? 'is-opening' : ''}`}
      style={{ '--i': index }}
      aria-labelledby={`rcard-${item.id}`}
      onClick={openFromCard}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
    >
      <button
        type="button"
        className="rcard__media"
        aria-haspopup="dialog"
        aria-label={`View full size: ${item.title}`}
        onClick={() => onOpen(item)}
      >
        <span
          className="rcard__frame"
          style={isPhotoCrop ? undefined : { aspectRatio: `${item.width} / ${item.height}` }}
        >
          <img
            src={item.thumb}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            style={item.focus ? { objectPosition: item.focus } : undefined}
          />
        </span>
        <span className="rcard__zoom" aria-hidden="true">
          <Maximize2 size={15} strokeWidth={1.6} />
        </span>
      </button>

      <div className="rcard__body">
        <p className="rcard__meta">
          <span className="rcard__category">{CATEGORY_LABELS[item.category]}</span>
          {item.date && <time className="rcard__date">{item.date}</time>}
        </p>
        <h3 id={`rcard-${item.id}`} className="rcard__title">
          {item.title}
        </h3>
        {item.event && <p className="rcard__event">{item.event}</p>}
        {item.certificateType && <p className="rcard__event">{item.certificateType}</p>}
        <p className="rcard__org">{item.organization}</p>
        <p className="rcard__desc">{item.description}</p>

        {(item.duration || item.certificateId) && (
          <dl className="rcard__facts">
            {item.duration && (
              <div>
                <dt>Duration</dt>
                <dd>{item.duration}</dd>
              </div>
            )}
            {item.certificateId && (
              <div>
                <dt>Certificate ID</dt>
                <dd>{item.certificateId}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="rcard__actions">
          <button type="button" className="rcard__view" aria-haspopup="dialog" onClick={() => onOpen(item)}>
            <Maximize2 size={14} strokeWidth={1.7} aria-hidden="true" />
            View<span className="sr-only"> {item.title}</span> full size
          </button>
          {item.verificationUrl && (
            <a className="link-pill rcard__verify" href={item.verificationUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} strokeWidth={1.7} aria-hidden="true" />
              Verify Certificate
              <span className="sr-only"> on the issuer’s website (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
