import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { createPointsMaterial } from '../materials'
import { WORLD } from '../worldLayout'
import { runtime } from '../runtime'

const FAR_Z = WORLD.achievements.base[2] - 18
const BOX_MIN = [-24, -7, FAR_Z]
const BOX_SIZE = [48, 22, 18 - FAR_Z]

/**
 * Atmospheric particles filling the whole journey volume. Drift speed is
 * scroll-driven (sceneState.particleSpeed); count adapts to device tier.
 */
export default function ParticleField({ count = 2000 }) {
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const reds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = BOX_MIN[0] + Math.random() * BOX_SIZE[0]
      positions[i * 3 + 1] = BOX_MIN[1] + Math.random() * BOX_SIZE[1]
      positions[i * 3 + 2] = BOX_MIN[2] + Math.random() * BOX_SIZE[2]
      sizes[i] = 0.3 + Math.pow(Math.random(), 3) * 1.6
      seeds[i] = Math.random()
      reds[i] = Math.random() < 0.07 ? 1 : 0
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(positions, 3))
    g.setAttribute('aSize', new Float32BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1))
    g.setAttribute('aRed', new Float32BufferAttribute(reds, 1))
    return g
  }, [count])

  const material = useMemo(() => {
    const m = createPointsMaterial({ size: 38, near: 0.8, far: 48 })
    m.uniforms.uBoxMin.value = BOX_MIN
    m.uniforms.uBoxSize.value = BOX_SIZE
    m.uniforms.uWrap.value = 1
    return m
  }, [])

  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr
  }, [dpr, material])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    material.uniforms.uTime.value += Math.min(delta, 0.1) * sceneState.particleSpeed * 4 * runtime.motion
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
