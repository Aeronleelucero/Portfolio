import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '../animations/scrollConfig'
import { useReducedMotion } from './useDeviceProfile'

/**
 * Reveals every `[data-reveal]` element inside `ref` as it scrolls into view.
 * Content is visible by default (CSS never hides it), so if JavaScript or
 * GSAP fails the CV still reads correctly. With reduced motion the content
 * simply stays put.
 */
export function useReveal(ref) {
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion || !ref.current) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('[data-reveal]', ref.current)
      gsap.set(items, { autoAlpha: 0, y: 36 })
      ScrollTrigger.batch(items, {
        // Fire as soon as an element (offset 36px by the set above) peeks into
        // view, so content near the bottom of a station is never left hidden.
        start: 'top 97%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.09,
            overwrite: true,
          }),
      })
    }, ref)
    return () => ctx.revert()
  }, [ref, reducedMotion])
}
