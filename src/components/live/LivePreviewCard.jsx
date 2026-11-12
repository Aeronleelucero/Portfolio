import { forwardRef, useEffect, useRef, useState } from 'react'
import { Maximize2, Waves } from 'lucide-react'

// The live site renders at a desktop size and is scaled down to the card, so
// the preview shows the real desktop composition instead of a cramped layout.
const FRAME_W = 1280
const FRAME_H = 800
// Keep the iframe alive briefly after the pointer leaves, so quick re-hovers
// don't reload it; after that it is unmounted to free the GPU.
const UNMOUNT_DELAY = 6000

/**
 * Featured live preview: a real poster frame at rest; on hover (mouse) the
 * actual deployed site is mounted in a sandboxed iframe and fades in.
 * Clicking (or tapping / pressing Enter) opens the full-screen modal.
 *
 * - The iframe is created only on demand, only while the card is on screen,
 *   and never while the full-screen modal is open (`suspended`).
 * - The iframe has pointer-events: none; a transparent button sits on top so
 *   the card stays clickable and keyboard-accessible.
 */
const LivePreviewCard = forwardRef(function LivePreviewCard({ live, label, onOpen, suspended }, buttonRef) {
  const root = useRef(null)
  const viewport = useRef(null)
  const unmountTimer = useRef(null)
  const [hovering, setHovering] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const [scale, setScale] = useState(0.4)

  const unmount = () => {
    clearTimeout(unmountTimer.current)
    setMounted(false)
    setLoaded(false)
  }

  // Only allow the iframe while the card is actually on screen.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scale the desktop-sized iframe to the card width.
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Off screen or modal open → drop the iframe immediately.
  useEffect(() => {
    if (!inView || suspended) {
      unmount()
      setHovering(false)
    }
  }, [inView, suspended])

  useEffect(() => () => clearTimeout(unmountTimer.current), [])

  const onPointerEnter = (e) => {
    if (e.pointerType !== 'mouse') return // touch: tap opens the modal instead
    clearTimeout(unmountTimer.current)
    setHovering(true)
    if (inView && !suspended) setMounted(true)
  }
  const onPointerLeave = (e) => {
    if (e.pointerType !== 'mouse') return
    setHovering(false)
    clearTimeout(unmountTimer.current)
    unmountTimer.current = setTimeout(unmount, UNMOUNT_DELAY)
  }

  const showLive = mounted && loaded && hovering

  // The scroll-reveal animation owns the outer element's transform, so the
  // hover scale lives on the inner .live-card.
  return (
    <div ref={root} className="live-shell" data-reveal>
      <div
        className={`live-card ${hovering ? 'is-hover' : ''} ${showLive ? 'is-live' : ''}`}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div ref={viewport} className="live-card__viewport" aria-hidden="true">
          <img className="live-card__poster" src={live.poster} alt="" width={FRAME_W} height={FRAME_H} loading="lazy" decoding="async" />
          {mounted && (
            <iframe
              className="live-card__frame"
              src={live.url}
              title={`${live.title} (live preview)`}
              width={FRAME_W}
              height={FRAME_H}
              style={{ transform: `scale(${scale})` }}
              tabIndex={-1}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setLoaded(true)}
            />
          )}
          <span className="live-card__shade" />
        </div>

        <span className="live-card__badge" aria-hidden="true">
          <span className="live-card__dot" />
          {mounted && !loaded ? 'Loading live site…' : 'Live site'}
        </span>
        <span className="live-card__hint" aria-hidden="true">
          <Waves size={14} strokeWidth={1.7} />
          <span className="live-card__hint-mouse">Hover to preview · click to dive in</span>
          <span className="live-card__hint-touch">Tap to open live</span>
          <Maximize2 size={13} strokeWidth={1.7} />
        </span>

        <button ref={buttonRef} type="button" className="live-card__hit" aria-haspopup="dialog" onClick={onOpen}>
          <span className="sr-only">Open {label} — live interactive preview</span>
        </button>
      </div>
    </div>
  )
})

export default LivePreviewCard
