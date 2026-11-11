import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { recognition, RECOGNITION_CATEGORIES } from '../../data/recognition'
import { ScrollTrigger } from '../../animations/scrollConfig'
import { useReducedMotion } from '../../hooks/useDeviceProfile'
import { setActiveRecognition } from '../../hooks/interaction'
import RecognitionCard from './RecognitionCard'
import RecognitionExhibit from './RecognitionExhibit'
import RecognitionModal from './RecognitionModal'

// Featured photo first, then certificates, then event documentation.
const LAYOUT_ORDER = { feature: 0, document: 1, photo: 2 }
const ordered = [...recognition].sort((a, b) => LAYOUT_ORDER[a.layout] - LAYOUT_ORDER[b.layout])
const countFor = (id) => (id === 'all' ? recognition.length : recognition.filter((r) => r.category === id).length)

// The spatial exhibition needs a wide stage; tablets and phones get the grid.
const EXHIBIT_QUERY = '(min-width: 1100px)'
const subscribe = (cb) => {
  const mql = window.matchMedia(EXHIBIT_QUERY)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
const useExhibitMode = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(EXHIBIT_QUERY).matches, () => false)

const OPEN_DELAY = 260 // ms — the chosen frame comes forward before the preview opens

export default function RecognitionGallery() {
  const [filter, setFilter] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [preview, setPreview] = useState(null)
  const [openingId, setOpeningId] = useState(null)
  const reducedMotion = useReducedMotion()
  const exhibitMode = useExhibitMode()
  const firstRender = useRef(true)
  const openTimer = useRef(null)

  const items = useMemo(
    () => (filter === 'all' ? ordered : ordered.filter((r) => r.category === filter)),
    [filter],
  )
  const active = Math.min(activeIndex, Math.max(items.length - 1, 0))

  const chooseFilter = (id) => {
    setFilter(id)
    setActiveIndex(0)
  }

  // Tell the 3D scene which record is in focus (its helix node lights up).
  useEffect(() => {
    setActiveRecognition(preview?.id ?? (exhibitMode ? items[active]?.id : null) ?? null)
  }, [preview, exhibitMode, items, active])
  useEffect(() => () => setActiveRecognition(null), [])

  // Layout height changes with the filter or mode — re-measure scroll stations.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [filter, exhibitMode])

  useEffect(() => () => clearTimeout(openTimer.current), [])

  const open = useCallback(
    (item) => {
      if (reducedMotion) {
        setPreview(item)
        return
      }
      setOpeningId(item.id)
      clearTimeout(openTimer.current)
      openTimer.current = setTimeout(() => {
        setPreview(item)
        setOpeningId(null)
      }, OPEN_DELAY)
    },
    [reducedMotion],
  )
  const close = useCallback(() => setPreview(null), [])
  const activeLabel = RECOGNITION_CATEGORIES.find((c) => c.id === filter)?.label

  return (
    <div className={`gallery ${preview || openingId ? 'is-focused' : ''}`}>
      <div className="gallery__filters" role="group" aria-label="Filter by category" data-reveal>
        {RECOGNITION_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="gallery__filter"
            aria-pressed={filter === c.id}
            onClick={() => chooseFilter(c.id)}
          >
            {c.label}
            <span className="gallery__count" aria-hidden="true">
              {countFor(c.id)}
            </span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {`${activeLabel}: ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
      </p>

      <div className="gallery__stage" data-reveal>
        {items.length === 0 ? (
          <p className="gallery__empty">No items in this category yet.</p>
        ) : exhibitMode ? (
          <div key={filter} className={reducedMotion ? '' : 'gallery__switch'}>
            <RecognitionExhibit
              items={items}
              active={active}
              onSelect={setActiveIndex}
              onOpen={open}
              openingId={openingId}
              reducedMotion={reducedMotion}
            />
          </div>
        ) : (
          <ul key={filter} className={`gallery__grid ${reducedMotion ? '' : 'is-animated'}`}>
            {items.map((item, i) => (
              <li key={item.id} className={`gallery__cell gallery__cell--${item.layout}`}>
                <RecognitionCard
                  item={item}
                  index={i}
                  onOpen={open}
                  opening={openingId === item.id}
                  allowTilt={!reducedMotion}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <RecognitionModal item={preview} onClose={close} />
    </div>
  )
}
