import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BoxGeometry,
  CanvasTexture,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SRGBColorSpace,
  TorusGeometry,
} from 'three'
import { chrome, PALETTE } from '../materials'
import { runtime } from '../runtime'

/*
 * Inner gyroscope ring of the Digital Core — revealed when the shell opens.
 *
 * Fits inside the closed shell: the inner faces of the shell plates sit at
 * ≥ 0.636 from the centre, and every point of this ring stays within 0.575,
 * so nothing intersects even when sealed. As the shell opens it turns to face
 * the camera and its violet → magenta track brightens.
 */
const RING_R = 0.54
const RING_TUBE = 0.02
const TRACK_R = 0.505
const TRACK_TUBE = 0.007
const NODE_COUNT = 8

/** Emissive map that runs around the circumference: violet ↔ magenta. */
function makeTrackTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 4
  const g = c.getContext('2d')
  const grad = g.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0, PALETTE.violet)
  grad.addColorStop(0.5, PALETTE.accent)
  grad.addColorStop(1, PALETTE.violet)
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 4)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

export default function CoreRing({ reveal }) {
  const camera = useThree((s) => s.camera)
  const orient = useRef() // turns toward the camera as the shell opens
  const spin = useRef() // independent spin about the ring's own axis
  const tumble = useRef({ x: 0.7, y: 0.4 })

  const parts = useMemo(() => {
    const texture = makeTrackTexture()
    return {
      texture,
      ring: new TorusGeometry(RING_R, RING_TUBE, 12, 160),
      track: new TorusGeometry(TRACK_R, TRACK_TUBE, 8, 160),
      node: new BoxGeometry(0.035, 0.035, 0.07),
      trackMaterial: new MeshStandardMaterial({
        color: '#120a1a',
        emissive: '#ffffff',
        emissiveMap: texture,
        emissiveIntensity: 0.6,
        roughness: 0.4,
        metalness: 0.3,
      }),
      nodeMaterials: [PALETTE.violet, PALETTE.accent].map(
        (emissive) =>
          new MeshStandardMaterial({ color: '#160c1f', emissive, emissiveIntensity: 0.8, roughness: 0.35, metalness: 0.5 }),
      ),
      nodes: Array.from({ length: NODE_COUNT }, (_, i) => (i / NODE_COUNT) * Math.PI * 2),
    }
  }, [])
  useEffect(
    () => () => {
      parts.texture.dispose()
      parts.ring.dispose()
      parts.track.dispose()
      parts.node.dispose()
      parts.trackMaterial.dispose()
      parts.nodeMaterials.forEach((m) => m.dispose())
    },
    [parts],
  )

  const tmp = useMemo(
    () => ({ facing: new Quaternion(), idle: new Quaternion(), parentInv: new Quaternion(), probe: new Object3D() }),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const motion = runtime.motion
    const r = reveal.current // 0 sealed … 1 fully open
    const g = orient.current
    if (!g) return

    // Idle gyroscope tumble while enclosed.
    tumble.current.x += dt * 0.21 * motion
    tumble.current.y += dt * 0.13 * motion
    tmp.idle.setFromEuler(tmp.probe.rotation.set(tumble.current.x, tumble.current.y, 0))

    // Facing orientation: the ring's normal (+Z) points at the camera, in the
    // parent's local space (the core leans with the pointer).
    g.parent.getWorldQuaternion(tmp.parentInv).invert()
    g.getWorldPosition(tmp.probe.position)
    tmp.probe.lookAt(camera.position)
    tmp.facing.copy(tmp.parentInv).multiply(tmp.probe.quaternion)

    const face = MathUtils.smoothstep(r, 0.15, 0.85)
    g.quaternion.slerpQuaternions(tmp.idle, tmp.facing, face)

    if (spin.current) spin.current.rotation.z += dt * (0.18 + r * 0.22) * motion

    parts.trackMaterial.emissiveIntensity = 0.55 + r * 1.9
    parts.nodeMaterials.forEach((m) => (m.emissiveIntensity = 0.7 + r * 1.6))
  })

  return (
    <group ref={orient}>
      <group ref={spin}>
        <mesh geometry={parts.ring} material={chrome} />
        <mesh geometry={parts.track} material={parts.trackMaterial} />
        {parts.nodes.map((a, i) => (
          <mesh
            key={i}
            geometry={parts.node}
            material={parts.nodeMaterials[i % 2]}
            position={[Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0]}
            rotation={[0, 0, a]}
          />
        ))}
      </group>
    </group>
  )
}
