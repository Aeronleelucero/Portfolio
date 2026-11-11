import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CatmullRomCurve3,
  CylinderGeometry,
  MathUtils,
  OctahedronGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { recognition } from '../../data/recognition'
import { interaction } from '../../hooks/interaction'
import { WORLD } from '../worldLayout'
import { chrome, createSignalMaterial, darkMetal, satinMetal } from '../materials'
import { runtime } from '../runtime'

const { base, height, radius } = WORLD.achievements
const TURNS = 1.6

const helixPoint = (u) => {
  const a = u * TURNS * Math.PI * 2 + Math.PI * 0.5
  return new Vector3(Math.cos(a) * radius, 0.5 + u * (height - 1), Math.sin(a) * radius)
}

/**
 * Recognition as an ascending helix around a spine — one node per record in
 * src/data/recognition.js. Nodes light up in sequence as the visitor arrives;
 * the record selected in the exhibition glows brighter. The crown glows once
 * the journey ends.
 */
export default function AchievementsTower() {
  const spineGlow = useRef()
  const crown = useRef()
  const nodeRefs = useRef([])
  const count = recognition.length
  const focusRefs = useRef(recognition.map(() => 0))

  const nodeMaterials = useMemo(() => recognition.map(() => createSignalMaterial(0)), [])
  const spineMaterial = useMemo(() => createSignalMaterial(2), [])
  const crownMaterial = useMemo(() => createSignalMaterial(0), [])

  const geometries = useMemo(() => {
    const pts = Array.from({ length: 80 }, (_, i) => helixPoint(i / 79))
    return {
      helix: new TubeGeometry(new CatmullRomCurve3(pts), 240, 0.012, 6, false),
      spine: new CylinderGeometry(0.06, 0.06, height, 16),
      spineGlow: new CylinderGeometry(0.025, 0.025, 1, 8),
      base: new CylinderGeometry(3, 3.15, 0.1, 64),
      node: new OctahedronGeometry(0.22, 0),
      ring: new TorusGeometry(0.4, 0.012, 6, 64),
      crown: new TorusGeometry(1.1, 0.03, 8, 96),
      crownInner: new TorusGeometry(0.75, 0.01, 6, 96),
    }
  }, [])

  const positions = useMemo(
    () => recognition.map((_, i) => helixPoint((i + 0.5) / count)),
    [count],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime * runtime.motion
    const reveal = sceneState.towerReveal

    if (spineGlow.current) {
      const h = Math.max(0.001, reveal * height)
      spineGlow.current.scale.y = h
      spineGlow.current.position.y = h / 2
    }

    nodeRefs.current.forEach((node, i) => {
      if (!node) return
      const on = MathUtils.clamp(reveal * count - i, 0, 1)
      // The record selected in the exhibition glows brighter and grows.
      const target = interaction.activeRecognition === recognition[i].id ? 1 : 0
      focusRefs.current[i] = MathUtils.damp(focusRefs.current[i], target, 4, dt)
      const f = focusRefs.current[i]
      nodeMaterials[i].emissiveIntensity = on * (2.2 + f * 2.6)
      node.rotation.y += dt * (0.3 + on * 0.6 + f * 0.8) * runtime.motion
      node.children[1].rotation.x = Math.PI / 2 + Math.sin(t * 0.6 + i) * 0.25
      node.scale.setScalar((0.75 + on * 0.25) * (1 + f * 0.45))
    })

    const end = MathUtils.clamp((sceneState.conduitProgress - 0.96) / 0.04, 0, 1)
    crownMaterial.emissiveIntensity = end * 2.6
    if (crown.current) crown.current.rotation.z += dt * 0.2 * runtime.motion
  })

  return (
    <group position={base}>
      <mesh geometry={geometries.base} material={darkMetal} position={[0, -0.05, 0]} />
      <mesh geometry={geometries.spine} material={satinMetal} position={[0, height / 2, 0]} />
      <mesh ref={spineGlow} geometry={geometries.spineGlow} material={spineMaterial} position={[0, 0, 0.07]} />
      <mesh geometry={geometries.helix} material={chrome} />

      {positions.map((p, i) => (
        <group key={recognition[i].id} ref={(el) => (nodeRefs.current[i] = el)} position={p}>
          <mesh geometry={geometries.node} material={nodeMaterials[i]} />
          <mesh geometry={geometries.ring} material={chrome} />
        </group>
      ))}

      <group ref={crown} position={[0, height, 0]} rotation-x={Math.PI / 2}>
        <mesh geometry={geometries.crown} material={chrome} />
        <mesh geometry={geometries.crownInner} material={crownMaterial} />
      </group>
    </group>
  )
}
