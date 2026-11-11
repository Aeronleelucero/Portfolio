import { useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 820px)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const COARSE_QUERY = '(pointer: coarse)'

let webglSupport = null

/** Detects WebGL2 once (three.js r163+ requires WebGL2). */
export function hasWebGL() {
  if (webglSupport !== null) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    webglSupport = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupport = false
  }
  return webglSupport
}

function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useReducedMotion = () => useMediaQuery(REDUCED_QUERY)
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY)

/**
 * Device profile used to scale visual effects.
 * tier: 'high' (desktop) | 'low' (mobile / touch / low core count)
 */
export function useDeviceProfile() {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const reducedMotion = useMediaQuery(REDUCED_QUERY)
  const coarse = useMediaQuery(COARSE_QUERY)
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
  const low = isMobile || coarse || cores <= 4

  return {
    isMobile,
    reducedMotion,
    coarsePointer: coarse,
    tier: low ? 'low' : 'high',
    particleCount: low ? 900 : 2600,
    maxDpr: low ? 1.35 : 2,
    minDpr: low ? 1 : 1.25,
  }
}
