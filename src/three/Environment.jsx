import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment as DreiEnvironment, Lightformer } from '@react-three/drei'
import { Object3D } from 'three'
import { sceneState } from '../animations/sceneTimeline'
import { PALETTE } from './materials'
import { runtime } from './runtime'

/**
 * Lighting, fog and reflections.
 *
 * The environment map is generated procedurally from Lightformers (rendered
 * once into a cube map) — no HDR download, yet chrome surfaces get crisp
 * studio-style reflections with restrained purple and lavender accents.
 */
export default function SceneEnvironment() {
  const fog = useRef()
  const key = useRef()
  const rim = useRef()
  const rimTarget = useMemo(() => new Object3D(), [])

  useFrame(({ gl }) => {
    const s = sceneState
    if (fog.current) {
      fog.current.near = s.fogNear
      fog.current.far = s.fogFar
    }
    if (key.current) key.current.intensity = s.keyLight
    if (rim.current) {
      rim.current.intensity = s.rimLight
      // Violet rim light sits behind whatever the camera is looking at.
      rim.current.position.set(runtime.focus.x - 5, runtime.focus.y + 3, runtime.focus.z - 8)
      rimTarget.position.copy(runtime.focus)
      rimTarget.updateMatrixWorld()
    }
    gl.toneMappingExposure = s.exposure
  })

  return (
    <>
      <color attach="background" args={[PALETTE.bg]} />
      <fog ref={fog} attach="fog" args={[PALETTE.bg, 7, 40]} />

      <ambientLight intensity={0.16} color={PALETTE.teal} />
      <hemisphereLight args={[PALETTE.teal, PALETTE.bg, 0.3]} />
      <directionalLight ref={key} position={[6, 10, 7]} intensity={1.6} color={PALETTE.text} />
      <primitive object={rimTarget} />
      <directionalLight ref={rim} color={PALETTE.violet} intensity={2.6} target={rimTarget} />

      <DreiEnvironment resolution={512} frames={1} background={false} environmentIntensity={1.15}>
        {/* Soft studio dome so chrome never reflects pure black */}
        <Lightformer form="rect" color={PALETTE.accent} intensity={0.55} position={[0, 0, 12]} scale={[30, 14, 1]} />
        <Lightformer form="rect" color={PALETTE.violet} intensity={0.45} position={[0, 0, -12]} rotation-y={Math.PI} scale={[30, 14, 1]} />
        {/* Crisp key strips for highlights */}
        <Lightformer form="rect" intensity={3.2} position={[0, 7, -2]} rotation-x={Math.PI / 2} scale={[16, 2, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[-8, 1, 1]} rotation-y={Math.PI / 2} scale={[1.6, 9, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[8, 0.5, 2]} rotation-y={-Math.PI / 2} scale={[1.1, 8, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[2, 2, 9]} rotation-y={Math.PI} scale={[8, 0.8, 1]} />
        {/* Soft violet / electric purple accent bounce */}
        <Lightformer form="ring" color={PALETTE.accent} intensity={6} position={[5, -2, -7]} scale={4} />
        <Lightformer form="rect" color={PALETTE.violet} intensity={1.6} position={[-6, -3, -6]} scale={[6, 1, 1]} />
        {/* Lavender counter-reflection */}
        <Lightformer form="rect" color={PALETTE.teal} intensity={1.8} position={[-8, 2, -3]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" color={PALETTE.surface} intensity={0.8} position={[0, -7, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
      </DreiEnvironment>
    </>
  )
}
