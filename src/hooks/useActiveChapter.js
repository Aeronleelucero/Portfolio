import { useEffect, useState } from 'react'
import { CHAPTERS, ScrollTrigger } from '../animations/scrollConfig'

/** Returns the id of the chapter currently crossing the viewport center. */
export function useActiveChapter() {
  const [active, setActive] = useState(CHAPTERS[0].id)

  useEffect(() => {
    const triggers = CHAPTERS.map(({ id }) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(id),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return active
}
