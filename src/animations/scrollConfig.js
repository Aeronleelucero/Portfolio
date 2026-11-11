import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { education } from '../data/education'
import { projects } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll "stations" — DOM elements marked with `data-station="<id>"`.
 * Each station has one camera keyframe and one scene keyframe; scrolling
 * between two stations interpolates between their keyframes.
 * Derived from the data files so adding a project or school just works.
 * Order matches document order.
 */
export const STATIONS = [
  'hero',
  'about',
  ...education.map((e) => `education-${e.id}`),
  'skills',
  ...projects.map((p) => `project-${p.id}`),
  'achievements',
  'contact',
]

/** Chapters shown in navigation (one per <section>). */
export const CHAPTERS = [
  { id: 'hero', label: 'Introduction', number: '01' },
  { id: 'about', label: 'About', number: '02' },
  { id: 'education', label: 'Education', number: '03' },
  { id: 'skills', label: 'Expertise', number: '04' },
  { id: 'projects', label: 'Projects', number: '05' },
  { id: 'achievements', label: 'Recognition', number: '06' },
  { id: 'contact', label: 'Contact', number: '07' },
]

export const SCROLL_SMOOTHING = {
  // Exponential damping factor for the camera following scroll (higher = snappier).
  default: 2.6,
  reducedMotion: 14,
}

/**
 * Shared, mutable scroll state read inside the render loop (no React
 * re-renders). `target` is the station position derived from scroll;
 * `current` is the damped value the 3D scene actually uses.
 */
export const scrollState = {
  target: 0,
  current: 0,
  max: STATIONS.length - 1,
}

// Handy for debugging camera choreography in the console (dev builds only).
if (import.meta.env.DEV && typeof window !== 'undefined') window.__scrollState = scrollState

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Tracks scroll with a single ScrollTrigger and converts the scroll position
 * into a fractional station index (e.g. 2.4 = 40% of the way from station 2
 * to station 3). Each station "holds" the camera while its content fills the
 * viewport; travel happens in the gaps between hold ranges.
 *
 * @returns cleanup function
 */
export function initScrollTracking() {
  let holds = []

  const measure = () => {
    const vh = window.innerHeight
    const maxScroll = ScrollTrigger.maxScroll(window)
    holds = STATIONS.map((id, i) => {
      const el = document.querySelector(`[data-station="${id}"]`)
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const h = rect.height
      let start, end
      if (h > vh) {
        start = top
        end = top + h - vh
      } else {
        start = end = top + (h - vh) / 2
      }
      if (i === 0) start = 0
      return [clamp(start, 0, maxScroll), clamp(end, 0, maxScroll)]
    })
  }

  const update = (scroll) => {
    if (!holds.length) return
    let value = 0
    for (let i = 0; i < holds.length; i++) {
      const h = holds[i]
      if (!h) continue
      if (scroll < h[0]) {
        // Between previous hold end and this hold start.
        const prev = holds[i - 1]
        if (!prev) {
          value = i
          break
        }
        const span = h[0] - prev[1]
        value = i - 1 + (span > 0 ? clamp((scroll - prev[1]) / span, 0, 1) : 1)
        break
      }
      value = i
      if (scroll <= h[1]) break
    }
    scrollState.target = value
  }

  measure()

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => update(self.scroll()),
    onRefresh: (self) => {
      measure()
      update(self.scroll())
    },
  })

  update(window.scrollY)
  scrollState.current = scrollState.target

  return () => trigger.kill()
}

/** Smoothly scroll to a chapter, honoring reduced motion. */
export function scrollToId(id, reducedMotion = false) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  // Move focus for keyboard and screen-reader users without a second jump.
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

export { gsap, ScrollTrigger }
