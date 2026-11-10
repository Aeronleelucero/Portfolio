import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, CylinderGeometry, Quaternion, TorusGeometry, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { accentGlow, chrome, darkMetal, satinMetal } from '../../materials'
import { runtime } from '../../runtime'

// Wire-frame basket: a trapezoid, wider at the top.
const TOP = { x: 1.05, z: 0.6, y: 0.55 }
const BOTTOM = { x: 0.8, z: 0.45, y: -0.35 }
const corners = (c) => [
  [-c.x, c.y, -c.z],
  [c.x, c.y, -c.z],
  [c.x, c.y, c.z],
  [-c.x, c.y, c.z],
]
const T = corners(TOP)
const B = corners(BOTTOM)
const EDGES = [
  ...[0, 1, 2, 3].map((i) => [T[i], T[(i + 1) % 4]]),
  ...[0, 1, 2, 3].map((i) => [B[i], B[(i + 1) % 4]]),
  ...[0, 1, 2, 3].map((i) => [T[i], B[i]]),
  // Handle and chassis
  [T[1], [1.45, 0.95, -0.6]],
  [T[2], [1.45, 0.95, 0.6]],
  [[1.45, 0.95, -0.6], [1.45, 0.95, 0.6]],
  [B[0], [-0.8, -0.72, -0.45]],
  [B[1], [0.8, -0.72, -0.45]],
  [B[2], [0.8, -0.72, 0.45]],
  [B[3], [-0.8, -0.72, 0.45]],
]
const WHEELS = [
  [-0.72, -0.82, -0.45],
  [0.72, -0.82, -0.45],
  [0.72, -0.82, 0.45],
  [-0.72, -0.82, 0.45],
]
const UP = new Vector3(0, 1, 0)

function Bar({ from, to, geometry }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from)
    const b = new Vector3(...to)
    const dir = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    }
  }, [from, to])
  return <mesh geometry={geometry} material={chrome} position={position} quaternion={quaternion} scale={[1, length, 1]} />
}

/**
 * CarMaLuTao Online Store — a chrome shopping cart; products drop into the
 * basket one after another, like items being added to an order.
 */
export default function CartEmblem({ focus }) {
  const products = useRef([])
  const wheels = useRef([])
  const geometries = useMemo(
    () => ({
      bar: new CylinderGeometry(0.018, 0.018, 1, 6),
      wheel: new TorusGeometry(0.11, 0.035, 8, 24),
      product: new RoundedBoxGeometry(0.42, 0.42, 0.42, 3, 0.04),
      tag: new BoxGeometry(0.2, 0.06, 0.01),
    }),
    [],
  )
  const slots = useMemo(
    () => [
      { x: -0.45, z: 0, mat: darkMetal, phase: 0 },
      { x: 0.05, z: -0.05, mat: satinMetal, phase: 0.33 },
      { x: 0.5, z: 0.05, mat: darkMetal, phase: 0.66 },
    ],
    [],
  )

  useFrame((state, delta) => {
    const speed = 0.28 + focus.current * 0.12
    const t = state.clock.elapsedTime * speed * runtime.motion
    slots.forEach((slot, i) => {
      const box = products.current[i]
      if (!box) return
      // Each product falls in, rests, then resets — staggered by phase.
      const cycle = runtime.motion ? (t + slot.phase) % 1 : 0.8
      const fall = Math.min(1, cycle / 0.25)
      const eased = 1 - Math.pow(1 - fall, 3)
      box.position.set(slot.x, 1.8 - eased * 1.85, slot.z)
      box.rotation.y = slot.phase * 4 + (1 - eased) * 1.2
      box.visible = cycle < 0.92
    })
    wheels.current.forEach((w) => w && (w.rotation.z -= delta * 0.6 * runtime.motion))
  })

  return (
    <group position={[-0.2, -0.15, 0]} rotation={[0.12, -0.5, 0]}>
      {EDGES.map(([a, b], i) => (
        <Bar key={i} from={a} to={b} geometry={geometries.bar} />
      ))}
      {WHEELS.map((p, i) => (
        <mesh key={i} ref={(el) => (wheels.current[i] = el)} geometry={geometries.wheel} material={darkMetal} position={p} />
      ))}
      {slots.map((slot, i) => (
        <group key={i} ref={(el) => (products.current[i] = el)}>
          <mesh geometry={geometries.product} material={slot.mat} />
          <mesh geometry={geometries.tag} material={accentGlow} position={[0, 0.1, 0.215]} />
        </group>
      ))}
    </group>
  )
}
