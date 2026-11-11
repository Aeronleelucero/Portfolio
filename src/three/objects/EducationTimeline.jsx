import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  MathUtils,
  OctahedronGeometry,
} from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { WORLD } from '../worldLayout'
import { chrome, darkMetal, glass, createSignalMaterial } from '../materials'
import { runtime } from '../runtime'

const edu = WORLD.education
const GATE_W = 2.8
const GATE_H = 3.4
const BAR = 0.07

/**
 * Cinematic timeline: a metal rail marked with years, with a gate standing
 * at each milestone (2020 ICT start, 2022 BS CS start, 2026 graduation).
 * The rail and gates light up as the visitor travels through time.
 */
export default function EducationTimeline() {
  const litRail = useRef()
  const gateRefs = useRef([])

  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => 2020 + i), [])
  const tickMaterials = useMemo(() => years.map(() => createSignalMaterial(0)), [years])
  const gateMaterials = useMemo(() => edu.gateYears.map(() => createSignalMaterial(0)), [])
  // The rail's progress strip is the journey line through Education — kept subtle.
  const railMaterial = useMemo(() => createSignalMaterial(0), [])
  const geometries = useMemo(
    () => ({
      bar: new BoxGeometry(1, 1, 1),
      emblems: [
        new OctahedronGeometry(0.42, 0),
        new IcosahedronGeometry(0.42, 0),
        new DodecahedronGeometry(0.42, 0),
      ],
    }),
    [],
  )

  const railLength = edu.railStartZ - edu.railEndZ
  const railCenterZ = (edu.railStartZ + edu.railEndZ) / 2
  const startZ = edu.yearZ(2020)

  useFrame((state, delta) => {
    const year = sceneState.eduYear
    const t = state.clock.elapsedTime

    // Red segment grows from 2020 to the current year.
    if (litRail.current) {
      const len = Math.max(0.0001, startZ - edu.yearZ(Math.max(2020, year)))
      litRail.current.scale.z = len
      litRail.current.position.z = startZ - len / 2
      litRail.current.visible = year > 2020.01
      railMaterial.emissiveIntensity = 1.1
    }

    years.forEach((y, i) => {
      const on = MathUtils.clamp((year - y) * 2 + 1, 0, 1)
      tickMaterials[i].emissiveIntensity = on * 1.2
    })

    edu.gateYears.forEach((y, i) => {
      const on = MathUtils.clamp((year - y) * 1.5 + 1, 0, 1)
      gateMaterials[i].emissiveIntensity = on * 1.6
      const gate = gateRefs.current[i]
      if (gate) {
        const emblem = gate.children[gate.children.length - 1]
        emblem.rotation.y += delta * (0.25 + on * 0.35) * runtime.motion
        emblem.rotation.x = Math.sin(t * 0.4 + i) * 0.3 * runtime.motion
        emblem.position.y = Math.sin(t * 0.7 + i * 2) * 0.08 * runtime.motion
      }
    })
  })

  return (
    <group position={[edu.railX, edu.railY, 0]}>
      {/* Rail */}
      <mesh geometry={geometries.bar} material={darkMetal} position={[0, 0, railCenterZ]} scale={[0.09, 0.05, railLength]} />
      <mesh ref={litRail} geometry={geometries.bar} material={railMaterial} position={[0, 0.035, startZ]} scale={[0.028, 0.016, 0.0001]} />

      {/* Year ticks */}
      {years.map((y, i) => {
        const major = edu.gateYears.includes(y)
        return (
          <mesh
            key={y}
            geometry={geometries.bar}
            material={tickMaterials[i]}
            position={[0, 0.01, edu.yearZ(y)]}
            scale={[major ? 1.2 : 0.55, 0.025, 0.04]}
          />
        )
      })}

      {/* Gates */}
      {edu.gateYears.map((y, i) => (
        <group key={y} ref={(el) => (gateRefs.current[i] = el)} position={[0, GATE_H / 2 + 0.02, edu.yearZ(y)]}>
          {/* Frame */}
          <mesh geometry={geometries.bar} material={chrome} position={[-GATE_W / 2, 0, 0]} scale={[BAR, GATE_H, BAR]} />
          <mesh geometry={geometries.bar} material={chrome} position={[GATE_W / 2, 0, 0]} scale={[BAR, GATE_H, BAR]} />
          <mesh geometry={geometries.bar} material={chrome} position={[0, GATE_H / 2, 0]} scale={[GATE_W + BAR, BAR, BAR]} />
          {/* Inner signal line */}
          <mesh geometry={geometries.bar} material={gateMaterials[i]} position={[0, GATE_H / 2 - 0.16, 0]} scale={[GATE_W - 0.4, 0.02, 0.02]} />
          <mesh geometry={geometries.bar} material={gateMaterials[i]} position={[-GATE_W / 2 + 0.16, -0.1, 0]} scale={[0.02, GATE_H - 0.5, 0.02]} />
          {/* Glass pane */}
          <mesh geometry={geometries.bar} material={glass} position={[0, 0, -0.05]} scale={[GATE_W - 0.1, GATE_H - 0.1, 0.02]} />
          {/* Floating emblem (last child — animated) */}
          <mesh geometry={geometries.emblems[i]} material={chrome} />
        </group>
      ))}
    </group>
  )
}
