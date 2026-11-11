import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DodecahedronGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  Vector3,
} from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { interaction } from '../../hooks/interaction'
import { skillCategories } from '../../data/skills'
import { WORLD } from '../worldLayout'
import { chrome, glass, lineMuted, PALETTE } from '../materials'
import { runtime } from '../runtime'

const RADIUS = 2.7
const NODE_GEOMETRIES = [
  () => new TetrahedronGeometry(0.38, 0),
  () => new OctahedronGeometry(0.36, 0),
  () => new BoxGeometry(0.46, 0.46, 0.46),
  () => new DodecahedronGeometry(0.34, 0),
  () => new IcosahedronGeometry(0.36, 0),
  () => new CylinderGeometry(0.25, 0.25, 0.42, 6),
]

const grey = new Color('#bdb4cc')
const red = new Color(PALETTE.accent).multiplyScalar(1.6)

/**
 * Technical expertise as a constellation: one metallic node per category,
 * each orbited by satellites — one per technology. Hovering or focusing a
 * category in the HTML list highlights its node here.
 */
export default function SkillsConstellation() {
  const group = useRef()
  const nodeRefs = useRef([])
  const satellites = useRef()
  const lines = useRef()
  const state = useRef(skillCategories.map(() => ({ scale: 1, orbit: 0.7, glow: 0 })))

  const nodeGeometries = useMemo(
    () => skillCategories.map((_, i) => NODE_GEOMETRIES[i % NODE_GEOMETRIES.length]()),
    [],
  )
  const satGeometry = useMemo(() => new SphereGeometry(0.06, 12, 12), [])
  const satMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#ffffff', metalness: 0.7, roughness: 0.3, emissive: '#000000' }),
    [],
  )
  const nodeMaterials = useMemo(
    () =>
      skillCategories.map(
        () =>
          new MeshStandardMaterial({
            color: '#e4dfec',
            metalness: 1,
            roughness: 0.18,
            emissive: PALETTE.accent,
            emissiveIntensity: 0,
          }),
      ),
    [],
  )

  const satCount = skillCategories.reduce((n, c) => n + c.items.length, 0)
  const lineGeometry = useMemo(() => {
    const g = new BufferGeometry()
    // hub→node spokes + pentagon ring
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(skillCategories.length * 4 * 3), 3))
    return g
  }, [])

  const anchors = useMemo(
    () =>
      skillCategories.map((_, i) => {
        const angle = (i / skillCategories.length) * Math.PI * 2 - Math.PI / 2
        return new Vector3(Math.cos(angle) * RADIUS, Math.sin(i * 2.3) * 0.5, Math.sin(angle) * RADIUS)
      }),
    [],
  )

  useLayoutEffect(() => {
    for (let i = 0; i < satCount; i++) satellites.current.setColorAt(i, grey)
    satellites.current.instanceColor.needsUpdate = true
  }, [satCount])

  const dummy = useMemo(() => new Object3D(), [])
  const nodePos = useMemo(() => skillCategories.map(() => new Vector3()), [])

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = frame.clock.elapsedTime * runtime.motion
    const reveal = sceneState.skillsReveal
    const eased = 1 - Math.pow(1 - reveal, 3)
    const active = interaction.activeSkill

    if (group.current) {
      group.current.rotation.y += dt * (active ? 0.03 : 0.08) * runtime.motion
      group.current.visible = reveal > 0.001
    }

    let satIndex = 0
    skillCategories.forEach((cat, i) => {
      const s = state.current[i]
      const isActive = active === cat.id
      const dimmed = active && !isActive
      s.scale = MathUtils.damp(s.scale, isActive ? 1.55 : dimmed ? 0.78 : 1, 5, dt)
      s.orbit = MathUtils.damp(s.orbit, isActive ? 1.05 : 0.7, 5, dt)
      s.glow = MathUtils.damp(s.glow, isActive ? 1 : 0, 5, dt)

      const p = nodePos[i].copy(anchors[i]).multiplyScalar(eased)
      p.y += Math.sin(t * 0.6 + i) * 0.12
      const node = nodeRefs.current[i]
      if (node) {
        node.position.copy(p)
        node.scale.setScalar(s.scale * Math.max(eased, 0.001))
        node.rotation.x += dt * 0.3 * runtime.motion
        node.rotation.y += dt * (0.4 + s.glow) * runtime.motion
      }
      nodeMaterials[i].emissiveIntensity = s.glow * 0.9

      // Satellites on inclined orbits around their category node.
      const n = cat.items.length
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + t * (0.5 + i * 0.07)
        const r = s.orbit * eased
        const tilt = 0.6 + i * 0.25
        dummy.position.set(
          p.x + Math.cos(a) * r,
          p.y + Math.sin(a) * r * Math.sin(tilt),
          p.z + Math.sin(a) * r * Math.cos(tilt),
        )
        dummy.scale.setScalar(eased * (isActive ? 1.3 : 1))
        dummy.updateMatrix()
        satellites.current.setMatrixAt(satIndex, dummy.matrix)
        satellites.current.setColorAt(satIndex, s.glow > 0.5 ? red : grey)
        satIndex++
      }
    })
    satellites.current.instanceMatrix.needsUpdate = true
    satellites.current.instanceColor.needsUpdate = true

    // Update spokes and ring.
    const pos = lineGeometry.attributes.position
    const count = skillCategories.length
    for (let i = 0; i < count; i++) {
      const a = nodePos[i]
      const b = nodePos[(i + 1) % count]
      pos.setXYZ(i * 4, 0, 0, 0)
      pos.setXYZ(i * 4 + 1, a.x, a.y, a.z)
      pos.setXYZ(i * 4 + 2, a.x, a.y, a.z)
      pos.setXYZ(i * 4 + 3, b.x, b.y, b.z)
    }
    pos.needsUpdate = true
    lineGeometry.computeBoundingSphere()
  })

  return (
    <group position={WORLD.skills} rotation={[0.32, 0, 0.08]}>
      <group ref={group}>
        <mesh material={chrome}>
          <icosahedronGeometry args={[0.28, 1]} />
        </mesh>
        <mesh material={glass}>
          <sphereGeometry args={[0.62, 32, 32]} />
        </mesh>
        {skillCategories.map((cat, i) => (
          <mesh
            key={cat.id}
            ref={(el) => (nodeRefs.current[i] = el)}
            geometry={nodeGeometries[i]}
            material={nodeMaterials[i]}
          />
        ))}
        <instancedMesh ref={satellites} args={[satGeometry, satMaterial, satCount]} />
        <lineSegments ref={lines} geometry={lineGeometry} material={lineMuted} />
      </group>
    </group>
  )
}
