import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { accentGlow, chrome, darkMetal, glass, satinMetal } from '../../materials'
import { runtime } from '../../runtime'

const CARD_W = 1.9
const CARD_H = 1.2
const LAYERS = [darkMetal, satinMetal, glass, darkMetal, chrome]

/**
 * UnityCard — a fanned stack of ID cards that breathes open and closed;
 * the top card carries an accent identity stripe, a chip and data lines.
 */
export default function CardsEmblem({ focus }) {
  const cards = useRef([])
  const geometries = useMemo(
    () => ({
      card: new RoundedBoxGeometry(CARD_W, CARD_H, 0.035, 4, 0.08),
      box: new BoxGeometry(1, 1, 1),
    }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime * runtime.motion
    const spread = 0.1 + (Math.sin(t * 0.7) * 0.5 + 0.5) * 0.06 + focus.current * 0.05
    cards.current.forEach((card, i) => {
      if (!card) return
      card.rotation.z = (i - (LAYERS.length - 1)) * spread
    })
  })

  return (
    <group position={[0.7, -0.45, 0]} rotation={[-0.12, -0.25, 0]}>
      {LAYERS.map((material, i) => (
        // Pivot at the card's lower-left corner so the stack fans like a hand.
        <group key={i} ref={(el) => (cards.current[i] = el)} position={[-CARD_W / 2, -CARD_H / 2, i * 0.07]}>
          <group position={[CARD_W / 2 - 0.3, CARD_H / 2, 0]}>
            <mesh geometry={geometries.card} material={material} />
            {i === LAYERS.length - 1 && (
              <>
                <mesh geometry={geometries.box} material={accentGlow} position={[0, 0.34, 0.022]} scale={[CARD_W - 0.02, 0.14, 0.008]} />
                <mesh geometry={geometries.box} material={satinMetal} position={[-0.58, -0.04, 0.024]} scale={[0.3, 0.24, 0.01]} />
                <mesh geometry={geometries.box} material={darkMetal} position={[0.25, -0.02, 0.024]} scale={[0.9, 0.05, 0.008]} />
                <mesh geometry={geometries.box} material={darkMetal} position={[0.12, -0.16, 0.024]} scale={[0.64, 0.05, 0.008]} />
                <mesh geometry={geometries.box} material={darkMetal} position={[0.18, -0.3, 0.024]} scale={[0.76, 0.05, 0.008]} />
              </>
            )}
          </group>
        </group>
      ))}
    </group>
  )
}
