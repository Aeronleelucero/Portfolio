import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { accentGlow, chrome, darkMetal, glass, satinMetal } from '../../materials'
import { runtime } from '../../runtime'

const PAGE_W = 1.5
const PAGE_H = 2.0
const FACE_Z = 0.026
// Body copy below the cover image: [x offset, width].
const LINES = [
  [0, 1.1],
  [-0.05, 1.0],
  [0, 1.1],
  [-0.1, 0.9],
]
const DRAFT_MAX = 0.8 // the line being "typed"
const DRAFT_LEFT = -0.55

/**
 * Artikly — an article page with a headline, cover image and body copy;
 * the last line is being written, a cursor blinking at its end. Earlier
 * drafts fan out behind it.
 */
export default function ArticleEmblem({ focus }) {
  const back = useRef()
  const draft = useRef()
  const cursor = useRef()
  const geometries = useMemo(
    () => ({
      page: new RoundedBoxGeometry(PAGE_W, PAGE_H, 0.04, 4, 0.06),
      box: new BoxGeometry(1, 1, 1),
    }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime * runtime.motion
    // Typing: the draft line grows, holds, then starts over.
    const cycle = (t * 0.35) % 1
    const w = runtime.motion === 0 ? DRAFT_MAX * 0.7 : DRAFT_MAX * Math.min(cycle / 0.75, 1) + 0.001
    if (draft.current) {
      draft.current.scale.x = w
      draft.current.position.x = DRAFT_LEFT + w / 2
    }
    if (cursor.current) {
      cursor.current.position.x = DRAFT_LEFT + w + 0.04
      cursor.current.visible = runtime.motion === 0 || Math.sin(t * 9) > -0.2
    }
    if (back.current) back.current.rotation.z = 0.1 + Math.sin(t * 0.6) * 0.02 + focus.current * 0.05
  })

  return (
    <group position={[0, -0.25, 0]} rotation={[-0.1, -0.3, 0]}>
      {/* Earlier drafts behind */}
      <group ref={back} position={[0.15, 0, -0.14]}>
        <mesh geometry={geometries.page} material={darkMetal} />
        <mesh geometry={geometries.page} material={glass} position={[0.08, 0.04, -0.1]} rotation-z={0.08} />
      </group>

      {/* The page being written */}
      <group rotation-z={-0.05}>
        <mesh geometry={geometries.page} material={satinMetal} />
        <mesh geometry={geometries.box} material={accentGlow} position={[-0.17, 0.78, FACE_Z]} scale={[0.9, 0.12, 0.01]} />
        <mesh geometry={geometries.box} material={darkMetal} position={[-0.32, 0.6, FACE_Z]} scale={[0.6, 0.05, 0.008]} />
        <mesh geometry={geometries.box} material={glass} position={[0, 0.17, FACE_Z]} scale={[1.2, 0.58, 0.012]} />
        <mesh geometry={geometries.box} material={chrome} position={[0, 0.17, FACE_Z - 0.004]} scale={[1.24, 0.62, 0.01]} />
        {LINES.map(([x, w], i) => (
          <mesh key={i} geometry={geometries.box} material={darkMetal} position={[x, -0.32 - i * 0.14, FACE_Z]} scale={[w, 0.045, 0.008]} />
        ))}
        <mesh ref={draft} geometry={geometries.box} material={darkMetal} position={[DRAFT_LEFT, -0.88, FACE_Z]} scale={[0.001, 0.045, 0.008]} />
        <mesh ref={cursor} geometry={geometries.box} material={accentGlow} position={[DRAFT_LEFT, -0.88, FACE_Z + 0.002]} scale={[0.03, 0.11, 0.012]} />
      </group>
    </group>
  )
}
