import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  Color,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import { chrome, createSignalMaterial, PALETTE } from '../../materials'
import { runtime } from '../../runtime'

const W = 2.6
const H = 1.7
const BAR = 0.045
const RIPPLES = 4
const BUBBLES = 14

/**
 * Aqua — an abstract "portal into water": a framed glass pane holding a deep
 * teal pool, concentric ripples spreading across it and bubbles drifting up.
 * (The real fish live in the embedded site; nothing here imitates them.)
 */
export default function PortalEmblem({ focus }) {
  const ripples = useRef([])
  const bubbles = useRef()
  const dummy = useMemo(() => new Object3D(), [])

  const parts = useMemo(() => {
    const deep = new MeshBasicMaterial({ color: new Color('#0d2a36'), transparent: true, opacity: 0.85 })
    return {
      bar: new BoxGeometry(1, 1, 1),
      deep,
      ring: new TorusGeometry(1, 0.012, 6, 96),
      rippleMats: Array.from({ length: RIPPLES }, () =>
        new MeshBasicMaterial({ color: new Color(PALETTE.teal).multiplyScalar(1.6), transparent: true, depthWrite: false }),
      ),
      bubble: new SphereGeometry(0.035, 10, 10),
      bubbleMat: new MeshBasicMaterial({ color: new Color('#bfe3ee'), transparent: true, opacity: 0.55 }),
      edge: createSignalMaterial(1.2),
      seeds: Array.from({ length: BUBBLES }, (_, i) => ({ x: ((i * 0.618) % 1) - 0.5, phase: (i * 0.37) % 1, speed: 0.12 + ((i * 0.29) % 1) * 0.1 })),
    }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime * runtime.motion
    const speed = 0.22 + focus.current * 0.12
    ripples.current.forEach((r, i) => {
      if (!r) return
      const p = runtime.motion ? (t * speed + i / RIPPLES) % 1 : (i + 0.5) / RIPPLES
      r.scale.setScalar(0.12 + p * 0.68)
      parts.rippleMats[i].opacity = Math.sin(p * Math.PI) * (0.55 + focus.current * 0.3)
    })
    if (bubbles.current) {
      parts.seeds.forEach((b, i) => {
        const p = runtime.motion ? (t * b.speed + b.phase) % 1 : b.phase
        dummy.position.set(b.x * (W - 0.4) + Math.sin(t * 1.3 + i) * 0.04, -H / 2 + 0.1 + p * (H - 0.2), 0.03)
        dummy.scale.setScalar(0.6 + p * 0.6)
        dummy.updateMatrix()
        bubbles.current.setMatrixAt(i, dummy.matrix)
      })
      bubbles.current.instanceMatrix.needsUpdate = true
    }
    parts.edge.emissiveIntensity = 0.9 + focus.current * 1.1
  })

  return (
    <group position={[0, 0.05, 0]} rotation={[0, -0.22, 0]}>
      {/* Water pane */}
      <mesh geometry={parts.bar} material={parts.deep} scale={[W, H, 0.02]} />
      {/* Frame */}
      <mesh geometry={parts.bar} material={chrome} position={[0, H / 2, 0]} scale={[W + BAR, BAR, BAR]} />
      <mesh geometry={parts.bar} material={chrome} position={[0, -H / 2, 0]} scale={[W + BAR, BAR, BAR]} />
      <mesh geometry={parts.bar} material={chrome} position={[-W / 2, 0, 0]} scale={[BAR, H, BAR]} />
      <mesh geometry={parts.bar} material={chrome} position={[W / 2, 0, 0]} scale={[BAR, H, BAR]} />
      <mesh geometry={parts.bar} material={parts.edge} position={[0, -H / 2 + 0.07, 0.025]} scale={[W - 0.3, 0.012, 0.012]} />
      {/* Ripples */}
      {parts.rippleMats.map((m, i) => (
        <mesh key={i} ref={(el) => (ripples.current[i] = el)} geometry={parts.ring} material={m} position={[0, -0.05, 0.03]} />
      ))}
      <instancedMesh ref={bubbles} args={[parts.bubble, parts.bubbleMat, BUBBLES]} frustumCulled={false} />
    </group>
  )
}
