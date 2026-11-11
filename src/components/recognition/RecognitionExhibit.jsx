import { useLayoutEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2 } from 'lucide-react'
import { CATEGORY_LABELS } from '../../data/recognition'
import { gsap } from '../../animations/scrollConfig'

const MAX_TILT = 5 // degrees, active frame only

/**
 * Circular offset of item `i` from the active item: 0 = front and center,
 * ±1 = flanking frames, ±2 = the frame resting behind the stage.
 */
function offsetOf(i, active, n) {
  if (n <= 1) return 0
  let d = i - active
  if (d > n / 2) d -= n
  if (d <= -n / 2) d += n
  return d
}

// Spatial placement for each offset: x (% of frame width), depth, turn, scale.
function placement(d) {
  const a = Math.abs(d)
  if (a === 0) return { x: 0, z: 0, ry: 0, s: 1, o: 1, zi: 4 }
  if (a === 1) return { x: Math.sign(d) * 64, z: -190, ry: -Math.sign(d) * 32, s: 0.84, o: 0.72, zi: 3 }
  return { x: 0, z: -420, ry: 0, s: 0.66, o: 0.16, zi: 1 }
}

/**
 * Desktop exhibition: a CSS-3D spatial carousel of floating frames.
 * - Click a flanking frame, use the arrows, the selector, ← / → keys or a
 *   swipe to move between records; click the front frame to open it.
 * - The front frame tilts toward the pointer and comes forward on hover.
 */
export default function RecognitionExhibit({ items, active, onSelect, onOpen, openingId, reducedMotion }) {
  const n = items.length
  const parallax = useRef(null)
  const swipe = useRef(null)
  const current = items[active]

  const go = (step) => onSelect((active + step + n) % n)

  // Scroll-in depth: the stage tilts up from the floor as the section arrives.
  useLayoutEffect(() => {
    if (reducedMotion || !parallax.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        parallax.current,
        { rotationX: 16, y: 70, z: -140, transformPerspective: 1300 },
        {
          rotationX: 0,
          y: 0,
          z: 0,
          ease: 'none',
          scrollTrigger: { trigger: parallax.current, start: 'top bottom', end: 'top 35%', scrub: 0.8 },
        },
      )
    })
    return () => ctx.revert()
  }, [reducedMotion])

  const tilt = (e) => {
    if (reducedMotion || e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--tilt-y', `${(x * MAX_TILT * 2).toFixed(2)}deg`)
    el.style.setProperty('--tilt-x', `${(-y * MAX_TILT * 2).toFixed(2)}deg`)
  }
  const untilt = (e) => {
    e.currentTarget.style.removeProperty('--tilt-x')
    e.currentTarget.style.removeProperty('--tilt-y')
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  // Turned side frames project as trapezoids, so a click can land on the
  // stage just outside one. Treat stage clicks beside the front frame as
  // "previous" (left) / "next" (right).
  const onStageClick = (e) => {
    if (e.target !== e.currentTarget || n < 2) return
    const front = e.currentTarget.querySelector('.xcard.is-front')?.getBoundingClientRect()
    if (!front) return
    if (e.clientX > front.right) go(1)
    else if (e.clientX < front.left) go(-1)
  }

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') swipe.current = e.clientX
  }
  const onPointerUp = (e) => {
    if (swipe.current == null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }

  return (
    <div className="exhibit">
      <div
        className="exhibit__viewport"
        role="region"
        aria-roledescription="carousel"
        aria-label="Recognition exhibition. Use the left and right arrow keys to move between items."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div ref={parallax} className="exhibit__parallax">
          <div className="exhibit__stage" onClick={onStageClick}>
            <span className="exhibit__floor" aria-hidden="true" />
            {items.map((item, i) => {
              const d = offsetOf(i, active, n)
              const p = placement(d)
              const isFront = d === 0
              const isBack = Math.abs(d) >= 2
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`xcard xcard--${item.layout} ${isFront ? 'is-front' : ''} ${
                    openingId === item.id ? 'is-opening' : ''
                  }`}
                  style={{
                    '--x': `${p.x}%`,
                    '--z': `${p.z}px`,
                    '--ry': `${p.ry}deg`,
                    '--s': p.s,
                    '--o': p.o,
                    '--i': i,
                    zIndex: p.zi,
                  }}
                  tabIndex={isBack ? -1 : 0}
                  aria-hidden={isBack || undefined}
                  aria-haspopup={isFront ? 'dialog' : undefined}
                  aria-label={isFront ? `Open full-size preview: ${item.title}` : `Show ${item.title}`}
                  onClick={() => (isFront ? onOpen(item) : onSelect(i))}
                  onPointerMove={isFront ? tilt : undefined}
                  onPointerLeave={isFront ? untilt : undefined}
                >
                  <span className="xcard__float">
                    <span className="xcard__tilt">
                      <span className="xcard__frame">
                        <img
                          src={item.thumb}
                          width={item.width}
                          height={item.height}
                          alt={isFront ? item.alt : ''}
                          loading="lazy"
                          decoding="async"
                          style={item.focus ? { objectPosition: item.focus } : undefined}
                        />
                        <span className="xcard__glare" aria-hidden="true" />
                      </span>
                      {/* Revealed on hover / focus */}
                      <span className="xcard__caption" aria-hidden="true">
                        <span className="xcard__caption-cat">{CATEGORY_LABELS[item.category]}</span>
                        <span className="xcard__caption-title">{item.title}</span>
                        <span className="xcard__caption-org">{item.organization}</span>
                        {isFront && (
                          <span className="xcard__caption-cta">
                            <Maximize2 size={13} strokeWidth={1.7} /> Open preview
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {n > 1 && (
        <div className="exhibit__nav">
          <button type="button" className="exhibit__arrow" onClick={() => go(-1)} aria-label="Previous item">
            <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <ol className="exhibit__selector" aria-label="Choose an item">
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="exhibit__thumb"
                  aria-current={i === active ? 'true' : undefined}
                  aria-label={item.title}
                  onClick={() => onSelect(i)}
                >
                  <img
                    src={item.thumb}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={item.focus ? { objectPosition: item.focus } : undefined}
                  />
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="exhibit__arrow" onClick={() => go(1)} aria-label="Next item">
            <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      )}

      {current && (
        <div key={current.id} className="exhibit__details" aria-live="polite">
          <div className="exhibit__text">
            <p className="exhibit__meta">
              <span className="exhibit__category">{CATEGORY_LABELS[current.category]}</span>
              <span className="exhibit__count">
                {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
            </p>
            <h3 className="exhibit__title">{current.title}</h3>
            {(current.event || current.certificateType) && (
              <p className="exhibit__event">{current.event ?? current.certificateType}</p>
            )}
            <p className="exhibit__desc">{current.description}</p>
          </div>
          <div className="exhibit__side">
            <dl className="exhibit__facts">
              <div>
                <dt>Organization</dt>
                <dd>{current.organization}</dd>
              </div>
              {current.date && (
                <div>
                  <dt>{current.certificateId ? 'Completion date' : 'Date'}</dt>
                  <dd>{current.date}</dd>
                </div>
              )}
              {current.duration && (
                <div>
                  <dt>Duration</dt>
                  <dd>{current.duration}</dd>
                </div>
              )}
              {current.certificateId && (
                <div>
                  <dt>Certificate ID</dt>
                  <dd>{current.certificateId}</dd>
                </div>
              )}
            </dl>
            <div className="exhibit__actions">
              <button type="button" className="rcard__view" aria-haspopup="dialog" onClick={() => onOpen(current)}>
                <Maximize2 size={14} strokeWidth={1.7} aria-hidden="true" />
                View full size
              </button>
              {current.verificationUrl && (
                <a className="link-pill rcard__verify" href={current.verificationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} strokeWidth={1.7} aria-hidden="true" />
                  Verify Certificate
                  <span className="sr-only"> on the issuer’s website (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
