import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, SphereGeometry, TorusGeometry } from 'three'
import { accentGlow, chrome, darkMetal } from '../../materials'
import { runtime } from '../../runtime'

/** A targeting reticle for the Foundry, using the portfolio's existing metals. */
export default function BlackoutEmblem({ focus }) {
  const reticle = useRef(null)
  const geometries = useMemo(() => ({
    ring: new TorusGeometry(0.85, 0.035, 8, 48),
    outer: new TorusGeometry(1.15, 0.055, 8, 48),
    bar: new BoxGeometry(1, 1, 1),
    center: new SphereGeometry(0.09, 12, 8),
  }), [])

  useFrame(({ clock }) => {
    if (reticle.current) {
      reticle.current.rotation.z = Math.sin(clock.elapsedTime * runtime.motion * 0.3) * 0.12
      reticle.current.scale.setScalar(1 + focus.current * 0.08)
    }
  })

  return (
    <group ref={reticle} rotation={[0, -0.2, 0]}>
      <mesh geometry={geometries.outer} material={darkMetal} />
      <mesh geometry={geometries.ring} material={chrome} />
      <mesh geometry={geometries.center} material={accentGlow} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation-z={i * Math.PI / 2}>
          <mesh geometry={geometries.bar} material={accentGlow} position={[0, 0.86, 0.04]} scale={[0.06, 0.58, 0.06]} />
        </group>
      ))}
    </group>
  )
}
