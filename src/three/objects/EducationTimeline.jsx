import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  DodecahedronGeometry,
  IcosahedronGeometry,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { WORLD } from '../worldLayout'
import { chrome, darkMetal, glass, createSignalMaterial, PALETTE } from '../materials'
import { runtime } from '../runtime'

const edu = WORLD.education
const GATE_W = 2.8
const GATE_H = 3.4
const BAR = 0.07

/**
 * Small canvas textures for the progress rail:
 *  - along: violet (#8750A5) at the 2020 end → magenta (#B454BC) at the tip.
 *    On a box's top face v runs along z, so it follows the strip as it grows.
 *  - halo: the same gradient, fading out across the width (soft glow edge).
 */
function makeRailTextures() {
  const along = document.createElement('canvas')
  along.width = 4
  along.height = 128
  const a = along.getContext('2d')
  // Canvas y = 0 is the texture's top (v = 1), i.e. the tip of the strip.
  const g = a.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, PALETTE.accent)
  g.addColorStop(1, PALETTE.violet)
  a.fillStyle = g
  a.fillRect(0, 0, 4, 128)

  const halo = document.createElement('canvas')
  halo.width = 64
  halo.height = 128
  const h = halo.getContext('2d')
  h.fillStyle = g
  h.fillRect(0, 0, 64, 128)
  h.globalCompositeOperation = 'destination-in'
  const fade = h.createLinearGradient(0, 0, 64, 0)
  fade.addColorStop(0, 'rgba(0,0,0,0)')
  fade.addColorStop(0.5, 'rgba(0,0,0,1)')
  fade.addColorStop(1, 'rgba(0,0,0,0)')
  h.fillStyle = fade
  h.fillRect(0, 0, 64, 128)

  return [along, halo].map((c) => {
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  })
}

/**
 * Cinematic timeline: a metal rail marked with years, with a gate standing
 * at each milestone (2020 ICT start, 2022 BS CS start, 2026 graduation).
 * The rail and gates light up as the visitor travels through time.
 */
export default function EducationTimeline() {
  const litRail = useRef()
  const railHalo = useRef()
  const gateRefs = useRef([])

  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => 2020 + i), [])
  const tickMaterials = useMemo(() => years.map(() => createSignalMaterial(0)), [years])
  const gateMaterials = useMemo(() => edu.gateYears.map(() => createSignalMaterial(0)), [])
  // Progress rail — the journey line through Education.
  const rail = useMemo(() => {
    const [along, halo] = makeRailTextures()
    return {
      // Active (traveled) strip: violet → magenta emissive gradient.
      active: new MeshStandardMaterial({
        color: '#1b1624',
        emissive: '#ffffff',
        emissiveMap: along,
        emissiveIntensity: 3.1,
        metalness: 0.4,
        roughness: 0.35,
      }),
      // Inactive strip along the whole rail: a quiet violet line, so the
      // route stays readable ahead of the progress.
      inactive: new MeshStandardMaterial({
        color: '#17121f',
        emissive: PALETTE.violet,
        emissiveIntensity: 0.7,
        metalness: 0.4,
        roughness: 0.45,
      }),
      // Soft glow under the active portion — additive, low opacity, no depth write.
      halo: new MeshBasicMaterial({
        map: halo,
        transparent: true,
        opacity: 0.6,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      haloGeometry: new PlaneGeometry(1, 1),
    }
  }, [])
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

    // The lit segment (and its glow) grows from 2020 to the current year.
    const len = Math.max(0.0001, startZ - edu.yearZ(Math.max(2020, year)))
    const lit = year > 2020.01
    if (litRail.current) {
      litRail.current.scale.z = len
      litRail.current.position.z = startZ - len / 2
      litRail.current.visible = lit
    }
    if (railHalo.current) {
      railHalo.current.scale.y = len
      railHalo.current.position.z = startZ - len / 2
      railHalo.current.visible = lit
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
      {/* Inactive strip: full rail length, enclosed by the wider active strip where lit (no z-fighting) */}
      <mesh geometry={geometries.bar} material={rail.inactive} position={[0, 0.03, railCenterZ]} scale={[0.02, 0.012, railLength]} />
      {/* Active progress strip */}
      <mesh ref={litRail} geometry={geometries.bar} material={rail.active} position={[0, 0.035, startZ]} scale={[0.032, 0.016, 0.0001]} />
      {/* Glow beneath the active strip */}
      <mesh
        ref={railHalo}
        geometry={rail.haloGeometry}
        material={rail.halo}
        position={[0, 0.027, startZ]}
        rotation-x={-Math.PI / 2}
        scale={[0.34, 0.0001, 1]}
        renderOrder={1}
      />

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
