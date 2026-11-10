import { lazy, Suspense, useEffect, useState } from 'react'
import Navigation from './components/layout/Navigation'
import ChapterRail from './components/layout/ChapterRail'
import Footer from './components/layout/Footer'
import StaticBackdrop from './components/layout/StaticBackdrop'
import CanvasBoundary from './components/layout/CanvasBoundary'
import Hero from './sections/Hero'
import About from './sections/About'
import Education from './sections/Education'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Achievements from './sections/Achievements'
import Contact from './sections/Contact'
import { ScrollTrigger } from './animations/scrollConfig'
import { hasWebGL, useDeviceProfile } from './hooks/useDeviceProfile'
import { useActiveChapter } from './hooks/useActiveChapter'
import { trackPointer } from './hooks/interaction'

// The 3D scene (three.js + R3F + drei) is code-split so the CV content
// paints immediately and stays usable while the scene downloads.
const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  const profile = useDeviceProfile()
  const [webgl] = useState(() => hasWebGL())
  const active = useActiveChapter()

  useEffect(() => trackPointer(), [])

  // Layout can shift once web fonts arrive — re-measure scroll positions.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh())
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('no-webgl', !webgl)
  }, [webgl])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {webgl ? (
        <CanvasBoundary fallback={<StaticBackdrop reason="error" />}>
          <Suspense fallback={<StaticBackdrop reason="loading" />}>
            <Scene profile={profile} />
          </Suspense>
        </CanvasBoundary>
      ) : (
        <StaticBackdrop reason="no-webgl" />
      )}
      <div className="vignette" aria-hidden="true" />

      <Navigation active={active} />
      <ChapterRail active={active} />

      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Education />
        <Skills />
        <Projects />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
