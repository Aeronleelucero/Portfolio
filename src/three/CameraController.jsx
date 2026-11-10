import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { createCameraTimeline } from '../animations/cameraTimeline'
import { createSceneTimeline } from '../animations/sceneTimeline'
import { initScrollTracking, scrollState, SCROLL_SMOOTHING } from '../animations/scrollConfig'
import { interaction } from '../hooks/interaction'
import { runtime } from './runtime'

/**
 * Drives the camera and the scene timeline from scroll.
 *
 * ScrollTrigger converts scroll position into a fractional station index
 * (`scrollState.target`). Every frame we damp toward it and scrub two paused
 * GSAP timelines — camera rig and scene state — to that time.
 */
export default function CameraController({ isMobile, reducedMotion, coarsePointer }) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)

  const { rig, timeline } = useMemo(() => createCameraTimeline(isMobile), [isMobile])
  const sceneTimeline = useMemo(() => createSceneTimeline(), [])
  const lookTarget = useRef(new Vector3())
  const up = useRef(new Vector3(0, 1, 0))
  const parallax = useRef({ x: 0, y: 0 })

  useEffect(() => {
    runtime.motion = reducedMotion ? 0 : 1
  }, [reducedMotion])

  useEffect(() => {
    const cleanup = initScrollTracking()
    // In on-demand rendering (reduced motion) re-render whenever scroll moves.
    const onScroll = () => invalidate()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cleanup()
      window.removeEventListener('scroll', onScroll)
    }
  }, [invalidate])

  useEffect(() => () => timeline.kill(), [timeline])
  useEffect(() => () => sceneTimeline.kill(), [sceneTimeline])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const lambda = reducedMotion ? SCROLL_SMOOTHING.reducedMotion : SCROLL_SMOOTHING.default

    let current = MathUtils.damp(scrollState.current, scrollState.target, lambda, dt)
    if (Math.abs(current - scrollState.target) < 0.0005) current = scrollState.target
    scrollState.current = current

    timeline.time(current)
    sceneTimeline.time(current)

    // Subtle pointer parallax and "handheld" breathing (desktop, full motion only).
    const usePointer = !reducedMotion && !coarsePointer
    const p = parallax.current
    p.x = MathUtils.damp(p.x, usePointer ? interaction.pointer.x : 0, 2.2, dt)
    p.y = MathUtils.damp(p.y, usePointer ? interaction.pointer.y : 0, 2.2, dt)
    const t = state.clock.elapsedTime
    const breathe = reducedMotion ? 0 : Math.sin(t * 0.45) * 0.05

    camera.position.set(rig.px + p.x * 0.4, rig.py + p.y * 0.25 + breathe, rig.pz)
    lookTarget.current.set(rig.tx + p.x * 0.12, rig.ty + p.y * 0.08, rig.tz)
    up.current.set(Math.sin(rig.roll), Math.cos(rig.roll), 0)
    camera.up.copy(up.current)
    camera.lookAt(lookTarget.current)
    runtime.focus.copy(lookTarget.current)

    if (Math.abs(camera.fov - rig.fov) > 0.01) {
      camera.fov = rig.fov
      camera.updateProjectionMatrix()
    }

    // Keep rendering while the camera is still settling (on-demand mode).
    if (current !== scrollState.target) invalidate()
  })

  return null
}
