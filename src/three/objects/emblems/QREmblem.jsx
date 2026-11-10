import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, Color, MeshStandardMaterial, Object3D } from 'three'
import { accentGlow, chrome, PALETTE } from '../../materials'
import { runtime } from '../../runtime'

const N = 21
const CELL = 0.125
const HALF = ((N - 1) * CELL) / 2

/** Deterministic QR-like module pattern: finder squares, timing lines, noise. */
function buildPattern() {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const finder = (x, y, ox, oy) => {
    const dx = x - ox
    const dy = y - oy
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
    const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6
    const center = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
    return ring || center
  }
  const cells = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let on =
        finder(x, y, 0, 0) ?? finder(x, y, N - 7, 0) ?? finder(x, y, 0, N - 7)
      const nearFinder = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9)
      if (on === null) {
        if (nearFinder) on = false
        else if (y === 6 || x === 6) on = (x + y) % 2 === 0
        else on = rand() > 0.52
      }
      if (on) cells.push([x, y])
    }
  }
  return cells
}

const base = new Color('#c4c8d0')
const hot = new Color(PALETTE.accent).multiplyScalar(2.2)
const tmp = new Color()

/**
 * QR Attendance — a voxel QR code with a red scan line sweeping across it;
 * modules lift and flare as the scanner passes, like a code being read.
 */
export default function QREmblem({ focus }) {
  const mesh = useRef()
  const scan = useRef()
  const cells = useMemo(() => buildPattern(), [])
  const dummy = useMemo(() => new Object3D(), [])
  const geometry = useMemo(() => new BoxGeometry(CELL * 0.86, CELL * 0.86, 0.08), [])
  const material = useMemo(() => new MeshStandardMaterial({ color: '#ffffff', metalness: 0.85, roughness: 0.28 }), [])
  const bar = useMemo(() => new BoxGeometry(1, 1, 1), [])

  useLayoutEffect(() => {
    cells.forEach((_, i) => mesh.current.setColorAt(i, base))
    mesh.current.instanceColor.needsUpdate = true
  }, [cells])

  useFrame((state) => {
    const speed = 0.35 + focus.current * 0.15
    const phase = runtime.motion ? (state.clock.elapsedTime * speed) % 1 : 0.5
    const scanY = HALF + 0.3 - phase * (HALF * 2 + 0.6)
    if (scan.current) scan.current.position.y = scanY

    cells.forEach(([x, y], i) => {
      const px = x * CELL - HALF
      const py = HALF - y * CELL
      const d = Math.abs(py - scanY)
      const lift = Math.max(0, 1 - d / 0.35)
      dummy.position.set(px, py, lift * 0.18)
      dummy.scale.set(1, 1, 1 + lift * 1.5)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, tmp.copy(base).lerp(hot, lift * lift))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
  })

  const frame = HALF + 0.32
  const arm = 0.42
  const corners = [
    [-1, 1], [1, 1], [1, -1], [-1, -1],
  ]

  return (
    <group rotation={[0, 0.18, 0]}>
      <instancedMesh ref={mesh} args={[geometry, material, cells.length]} frustumCulled={false} />
      <mesh ref={scan} geometry={bar} material={accentGlow} scale={[HALF * 2 + 0.5, 0.012, 0.012]} position={[0, 0, 0.2]} />
      {corners.map(([sx, sy], i) => (
        <group key={i} position={[sx * frame, sy * frame, 0]}>
          <mesh geometry={bar} material={chrome} position={[(-sx * arm) / 2, 0, 0]} scale={[arm, 0.035, 0.035]} />
          <mesh geometry={bar} material={chrome} position={[0, (-sy * arm) / 2, 0]} scale={[0.035, arm, 0.035]} />
        </group>
      ))}
    </group>
  )
}
