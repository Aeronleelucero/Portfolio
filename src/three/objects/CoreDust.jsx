import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { createPointsMaterial } from '../materials'
import { runtime } from '../runtime'

/** Fine dust orbiting the Digital Core in a loose spherical shell. */
export default function CoreDust({ count = 200 }) {
  const ref = useRef()
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const reds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i] = 0.4 + Math.random() * 0.9
      seeds[i] = Math.random()
      reds[i] = Math.random() < 0.18 ? 1 : 0
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(positions, 3))
    g.setAttribute('aSize', new Float32BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1))
    g.setAttribute('aRed', new Float32BufferAttribute(reds, 1))
    return g
  }, [count])

  const material = useMemo(() => createPointsMaterial({ size: 34, near: 0.5, far: 30 }), [])

  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr
  }, [dpr, material])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    material.uniforms.uTime.value += Math.min(delta, 0.1) * runtime.motion
    if (ref.current) ref.current.rotation.y += delta * 0.04 * runtime.motion
  })

  return <points ref={ref} geometry={geometry} material={material} />
}
