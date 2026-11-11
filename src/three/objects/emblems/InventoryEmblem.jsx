import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, Color, MeshStandardMaterial, Object3D } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { chrome, darkMetal, PALETTE } from '../../materials'
import { runtime } from '../../runtime'

const SHELVES = [-0.95, 0, 0.95]
const SLOTS = [-0.8, 0, 0.8]
const CRATE = 0.62
const ACCENT_SLOTS = new Set([1, 5])
// Slots whose crates slide in and out, like stock moving through inventory.
const MOVING = { 2: 0, 4: 2.1, 6: 4.2 }

const grey = new Color('#958ca6')
const red = new Color(PALETTE.accent).multiplyScalar(1.3)

/** PAWS4PALS — a shelving rack with crates sliding in and out of stock. */
export default function InventoryEmblem({ focus }) {
  const crates = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const geometries = useMemo(
    () => ({
      crate: new RoundedBoxGeometry(CRATE, CRATE * 0.72, CRATE, 3, 0.04),
      bar: new BoxGeometry(1, 1, 1),
    }),
    [],
  )
  const material = useMemo(() => new MeshStandardMaterial({ color: '#ffffff', metalness: 0.75, roughness: 0.32 }), [])
  const count = SHELVES.length * SLOTS.length

  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) crates.current.setColorAt(i, ACCENT_SLOTS.has(i) ? red : grey)
    crates.current.instanceColor.needsUpdate = true
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime * (0.8 + focus.current * 0.4) * runtime.motion
    let i = 0
    SHELVES.forEach((y) => {
      SLOTS.forEach((x) => {
        const phase = MOVING[i]
        let slide = 0
        if (phase !== undefined) {
          // Ease out to the front, pause, slide back.
          const s = Math.sin(t * 0.8 + phase)
          slide = Math.max(0, s) ** 2 * 0.9
        }
        dummy.position.set(x, y + (CRATE * 0.72) / 2 + 0.03, slide)
        dummy.updateMatrix()
        crates.current.setMatrixAt(i, dummy.matrix)
        i++
      })
    })
    crates.current.instanceMatrix.needsUpdate = true
  })

  const width = 2.75
  return (
    <group position={[0, -0.25, 0]} rotation={[0, -0.32, 0]}>
      {SHELVES.map((y) => (
        <mesh key={y} geometry={geometries.bar} material={darkMetal} position={[0, y, 0]} scale={[width, 0.05, 0.85]} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geometries.bar} material={chrome} position={[(s * width) / 2, 0.15, 0.4]} scale={[0.05, 2.75, 0.05]} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`b${s}`} geometry={geometries.bar} material={chrome} position={[(s * width) / 2, 0.15, -0.4]} scale={[0.05, 2.75, 0.05]} />
      ))}
      <instancedMesh ref={crates} args={[geometries.crate, material, count]} frustumCulled={false} />
    </group>
  )
}
