import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, MathUtils, TorusGeometry } from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { interaction } from '../../hooks/interaction'
import { projects } from '../../data/projects'
import { WORLD } from '../worldLayout'
import { chrome, createSignalMaterial, darkMetal } from '../materials'
import { runtime } from '../runtime'
import PoseEmblem from './emblems/PoseEmblem'
import CardsEmblem from './emblems/CardsEmblem'
import QREmblem from './emblems/QREmblem'
import InventoryEmblem from './emblems/InventoryEmblem'
import CartEmblem from './emblems/CartEmblem'
import PortalEmblem from './emblems/PortalEmblem'

const EMBLEMS = {
  pose: PoseEmblem,
  cards: CardsEmblem,
  qr: QREmblem,
  inventory: InventoryEmblem,
  cart: CartEmblem,
  portal: PortalEmblem,
}

function ProjectStation({ project, index, geometries }) {
  const group = useRef()
  const emblem = useRef()
  const focus = useRef(0)
  const signal = useMemo(() => createSignalMaterial(0), [])
  const Emblem = EMBLEMS[project.emblem]

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const proximity = 1 - MathUtils.clamp(Math.abs(sceneState.projectFocus - index), 0, 1)
    const hovered = interaction.activeProject === project.id ? 1 : 0
    focus.current = MathUtils.damp(focus.current, Math.max(proximity, hovered), 4, dt)

    const f = focus.current
    if (group.current) group.current.scale.setScalar(0.84 + f * 0.16)
    if (emblem.current) {
      const t = state.clock.elapsedTime * runtime.motion
      emblem.current.position.y = 0.15 + Math.sin(t * 0.8 + index) * 0.07
      emblem.current.rotation.y = Math.sin(t * 0.25 + index) * 0.12
    }
    signal.emissiveIntensity = 0.3 + f * 2.2
  })

  return (
    <group ref={group} position={WORLD.projects[index]}>
      {/* Plinth */}
      <mesh geometry={geometries.plinth} material={darkMetal} position={[0, -1.75, 0]} />
      <mesh geometry={geometries.rim} material={chrome} position={[0, -1.71, 0]} rotation-x={Math.PI / 2} />
      <mesh geometry={geometries.signal} material={signal} position={[0, -1.74, 0]} rotation-x={Math.PI / 2} />
      <group ref={emblem}>
        <Emblem focus={focus} />
      </group>
    </group>
  )
}

/** Gallery of four project stations, each with a bespoke 3D emblem. */
export default function ProjectGallery() {
  const geometries = useMemo(
    () => ({
      plinth: new CylinderGeometry(2.1, 2.2, 0.08, 64),
      rim: new TorusGeometry(2.12, 0.012, 6, 128),
      signal: new TorusGeometry(2.45, 0.008, 6, 128),
    }),
    [],
  )
  return projects.map((project, i) => (
    <ProjectStation key={project.id} project={project} index={i} geometries={geometries} />
  ))
}
