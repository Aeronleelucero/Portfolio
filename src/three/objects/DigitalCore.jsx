import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  Sphere,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { scrollState } from '../../animations/scrollConfig'
import { interaction, isOverUI, setCoreUnfolded, toggleCoreUnfolded } from '../../hooks/interaction'
import { WORLD } from '../worldLayout'
import { chrome, darkMetal, satinMetal, accentGlow, PALETTE } from '../materials'
import { runtime } from '../runtime'
import CoreDust from './CoreDust'
import CoreFeathers from './CoreFeathers'

/**
 * Builds the core shell: 20 icosahedron faces as separate bevelled plates.
 * Each vertex stores its plate's outward direction so the vertex shader can
 * split the shell open (uExpand) in a single draw call.
 */
function buildFacetGeometry() {
  const ico = new IcosahedronGeometry(1, 0)
  const src = ico.attributes.position
  const positions = []
  const dirs = []
  const rands = []

  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const centroid = new Vector3()
  const n = new Vector3()
  const e1 = new Vector3()
  const e2 = new Vector3()
  const triCenter = new Vector3()

  // Pushes a triangle, fixing its winding so its normal points along `facing`.
  const pushTri = (p0, p1, p2, facing, dir, rand) => {
    e1.subVectors(p1, p0)
    e2.subVectors(p2, p0)
    const normal = new Vector3().crossVectors(e1, e2)
    const verts = normal.dot(facing) < 0 ? [p0, p2, p1] : [p0, p1, p2]
    for (const v of verts) {
      positions.push(v.x, v.y, v.z)
      dirs.push(dir.x, dir.y, dir.z)
      rands.push(rand)
    }
  }

  for (let f = 0; f < src.count / 3; f++) {
    a.fromBufferAttribute(src, f * 3)
    b.fromBufferAttribute(src, f * 3 + 1)
    c.fromBufferAttribute(src, f * 3 + 2)
    centroid.copy(a).add(b).add(c).divideScalar(3)
    n.copy(centroid).normalize()
    const rand = Math.random()

    // Tight hairline seams when sealed: a wider inset let the glowing heart show
    // through only the camera-facing seams, reading as a stray diagonal strip.
    const shrink = 0.97
    const top = [a, b, c].map((v) => v.clone().sub(centroid).multiplyScalar(shrink).add(centroid))
    const inner = top.map((v) => v.clone().multiplyScalar(0.8))
    const plateCenter = centroid.clone().multiplyScalar(0.9)

    const inward = n.clone().negate()
    pushTri(top[0], top[1], top[2], n, n, rand)
    pushTri(inner[0], inner[1], inner[2], inward, n, rand)
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3
      // Side quads face away from the plate's center.
      triCenter.copy(top[i]).add(top[j]).add(inner[i]).add(inner[j]).multiplyScalar(0.25)
      const side = triCenter.clone().sub(plateCenter)
      pushTri(top[i], inner[i], inner[j], side, n, rand)
      pushTri(top[i], inner[j], top[j], side, n, rand)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aDir', new Float32BufferAttribute(dirs, 3))
  geometry.setAttribute('aRand', new Float32BufferAttribute(rands, 1))
  geometry.computeVertexNormals()
  ico.dispose()
  return geometry
}

function createFacetMaterial(uniforms) {
  // Lavender steel with a thin-film iridescent clearcoat: plates shift
  // between violet and teal as the core turns.
  const material = new MeshPhysicalMaterial({
    color: '#e4dfec',
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.4,
    iridescence: 0.45,
    iridescenceIOR: 1.3,
    iridescenceThicknessMinimum: 220,
    iridescenceThicknessMaximum: 600,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
  })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uExpand = uniforms.uExpand
    shader.uniforms.uTime = uniforms.uTime
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uExpand;
        uniform float uTime;
        attribute vec3 aDir;
        attribute float aRand;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        // Orderly "exploded view": every plate moves out by nearly the same
        // distance, so the shell reads as one sculpture, not scattered shards.
        float spread = uExpand * (0.58 + aRand * 0.08);
        float hover = sin(uTime * 0.9 + aRand * 6.2831) * 0.012 * uExpand;
        transformed += aDir * (spread + hover);`,
      )
  }
  return material
}

const RING_SPECS = [
  { radius: 1.75, tilt: [1.15, 0.2, 0], axis: 'z', speed: 0.22, expandTilt: [0.5, 0, 0.3] },
  { radius: 2.2, tilt: [0.35, 0.9, 0.2], axis: 'z', speed: -0.16, expandTilt: [-0.4, 0.3, 0] },
  { radius: 2.65, tilt: [-0.55, -0.4, 0.5], axis: 'z', speed: 0.1, expandTilt: [0.2, -0.5, 0.2] },
]

function TickRing({ radius }) {
  const ref = useRef()
  const count = 72
  const geometry = useMemo(() => new BoxGeometry(0.01, 0.01, 1), [])
  useLayoutEffect(() => {
    const dummy = new Object3D()
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const long = i % 6 === 0
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      dummy.rotation.set(0, 0, angle)
      dummy.scale.set(1, 1, long ? 0.16 : 0.07)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [radius])
  return <instancedMesh ref={ref} args={[geometry, satinMetal, count]} />
}

function DashedRing({ radius }) {
  const ref = useRef()
  const count = 28
  const geometry = useMemo(() => new TorusGeometry(radius, 0.011, 6, 10, 0.15), [radius])
  useLayoutEffect(() => {
    const dummy = new Object3D()
    for (let i = 0; i < count; i++) {
      dummy.rotation.set(0, 0, (i / count) * Math.PI * 2)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [radius])
  return <instancedMesh ref={ref} args={[geometry, chrome, count]} />
}

function Beads({ radius }) {
  const group = useRef()
  const geometry = useMemo(() => new SphereGeometry(0.055, 16, 16), [])
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.35 * runtime.motion
  })
  return (
    <group ref={group}>
      {[0, 2.1, 4.2].map((angle) => (
        <mesh
          key={angle}
          geometry={geometry}
          material={accentGlow}
          position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
        />
      ))}
    </group>
  )
}

// Hit area around the core (world units) and how far away it stays interactive.
const HIT_RADIUS = 1.6
const MAX_INTERACT_DISTANCE = 26
const DRAG_TOLERANCE = 8 // px between pointerdown and click

export default function DigitalCore({ particleCount = 200, quality = 'high' }) {
  const root = useRef()
  const shell = useRef()
  const heart = useRef()
  const light = useRef()
  const ringRefs = useRef([])
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)

  // Animated interaction amounts (0..1), damped every frame.
  const anim = useRef({ hover: 0, unfold: 0, scrollSpin: 0 })
  const hovered = useRef(false)
  const pick = useMemo(
    () => ({ ray: new Raycaster(), ndc: new Vector2(), sphere: new Sphere(new Vector3(), HIT_RADIUS), center: new Vector3() }),
    [],
  )

  const uniforms = useMemo(() => ({ uExpand: { value: 0 }, uTime: { value: 0 } }), [])
  const facetGeometry = useMemo(() => buildFacetGeometry(), [])
  const facetMaterial = useMemo(() => createFacetMaterial(uniforms), [uniforms])
  const heartGeometry = useMemo(() => new IcosahedronGeometry(0.56, 1), [])
  const heartMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#12041a',
        emissive: PALETTE.accent,
        emissiveIntensity: 1.5,
        roughness: 0.35,
        metalness: 0.4,
        flatShading: true,
      }),
    [],
  )
  const ringGeometries = useMemo(
    () => [
      new TorusGeometry(RING_SPECS[0].radius, 0.014, 8, 160),
      new TorusGeometry(RING_SPECS[1].radius, 0.024, 10, 180),
      new TorusGeometry(RING_SPECS[2].radius, 0.008, 6, 200),
    ],
    [],
  )

  /** Does a ray through screen point (ndcX, ndcY) hit the core? */
  const hitsCore = (ndcX, ndcY) => {
    if (!root.current) return false
    root.current.getWorldPosition(pick.center)
    if (pick.center.distanceTo(camera.position) > MAX_INTERACT_DISTANCE) return false
    pick.sphere.center.copy(pick.center)
    pick.sphere.radius = HIT_RADIUS * (1 + anim.current.unfold * 0.35)
    pick.ndc.set(ndcX, ndcY)
    pick.ray.setFromCamera(pick.ndc, camera)
    return pick.ray.ray.intersectsSphere(pick.sphere)
  }

  // Click / tap toggles the unfold. The canvas sits behind the page, so we
  // listen on the window and ignore clicks on readable or interactive HTML.
  useEffect(() => {
    let down = null
    const onDown = (e) => {
      down = { x: e.clientX, y: e.clientY }
    }
    const onClick = (e) => {
      const dragged = down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_TOLERANCE
      down = null
      if (dragged || isOverUI(e.target) || window.getSelection()?.toString()) return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      if (hitsCore(x, y)) {
        toggleCoreUnfolded()
        invalidate()
      }
    }
    const onMove = () => invalidate() // keeps hover responsive in on-demand (reduced-motion) mode
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('click', onClick)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('click', onClick)
      window.removeEventListener('pointermove', onMove)
      document.body.classList.remove('core-hover')
    }
    // hitsCore reads refs only; the handler never needs re-binding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, invalidate])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const motion = runtime.motion
    const t = state.clock.elapsedTime
    const a = anim.current

    // Hover: mouse only, never through HTML.
    const isHover =
      interaction.pointerType === 'mouse' &&
      !interaction.pointerOverUI &&
      hitsCore(interaction.pointer.x, interaction.pointer.y)
    if (isHover !== hovered.current) {
      hovered.current = isHover
      document.body.classList.toggle('core-hover', isHover)
    }

    // Leaving the core's area returns the sculpture to its original form.
    const s = scrollState.current
    if (interaction.coreUnfolded && s > 1.6 && s < scrollState.max - 0.6) setCoreUnfolded(false)

    const unfoldTarget = interaction.coreUnfolded ? 1 : 0
    a.hover = MathUtils.damp(a.hover, isHover ? 1 : 0, 6, dt)
    a.unfold = MathUtils.damp(a.unfold, unfoldTarget, motion ? 2.8 : 14, dt)

    // Plates move only on interaction (hover parts the seams, click unfolds);
    // scrolling never displaces the geometry — it only opens the rings.
    const plates = a.unfold * 0.85 + a.hover * 0.1
    const expand = Math.min(1.1, sceneState.coreExpand + plates)
    uniforms.uExpand.value = plates
    uniforms.uTime.value = t * motion

    // Pointer response — the whole core leans gently toward the cursor.
    if (root.current) {
      const usePointer = motion && interaction.pointerType === 'mouse'
      const px = usePointer ? interaction.pointer.x : 0
      const py = usePointer ? interaction.pointer.y : 0
      root.current.rotation.y = MathUtils.damp(root.current.rotation.y, px * (0.35 + a.hover * 0.15), 3, dt)
      root.current.rotation.x = MathUtils.damp(root.current.rotation.x, -py * (0.22 + a.hover * 0.1), 3, dt)
      root.current.position.y = WORLD.core[1] + Math.sin(t * 0.6) * 0.06 * motion
    }

    if (shell.current) {
      // Idle spin, a touch livelier on hover, plus a gentle scroll-linked turn
      // (scrollState.current is already damped, so it never jumps).
      const spin = s * 0.6 * motion
      shell.current.rotation.y += dt * (0.12 + a.hover * 0.18) * motion + (spin - a.scrollSpin)
      shell.current.rotation.x += dt * 0.05 * motion
      a.scrollSpin = spin
    }

    if (heart.current) {
      const pulse = Math.sin(t * 1.6) * motion
      heart.current.scale.setScalar((1 + pulse * 0.04) * (1 + plates * 0.1))
      heartMaterial.emissiveIntensity = 1.4 + plates * 0.5 + a.hover * 0.7 + pulse * 0.2
    }
    if (light.current) light.current.intensity = 3.5 + plates * 3 + a.hover * 1.8

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      const spec = RING_SPECS[i]
      const spin = ring.children[0]
      spin.rotation.z += dt * spec.speed * (1 + a.hover * 0.8 + a.unfold * 0.6) * motion
      ring.scale.setScalar(1 + expand * (0.22 + i * 0.1))
      ring.rotation.set(
        spec.tilt[0] + spec.expandTilt[0] * expand + Math.sin(t * 0.21 + i) * 0.04 * motion,
        spec.tilt[1] + spec.expandTilt[1] * expand,
        spec.tilt[2] + spec.expandTilt[2] * expand,
      )
    })

    // On-demand rendering (reduced motion): keep drawing until settled.
    if (Math.abs(a.unfold - unfoldTarget) > 0.001 || Math.abs(a.hover - (isHover ? 1 : 0)) > 0.001) invalidate()
  })

  return (
    <group ref={root} position={WORLD.core}>
      <group ref={shell}>
        <mesh geometry={facetGeometry} material={facetMaterial} />
        <mesh ref={heart} geometry={heartGeometry} material={heartMaterial} />
      </group>
      <pointLight ref={light} color={PALETTE.accent} intensity={3.5} distance={7} decay={2} />

      {RING_SPECS.map((spec, i) => (
        <group key={i} ref={(el) => (ringRefs.current[i] = el)}>
          <group>
            <mesh geometry={ringGeometries[i]} material={i === 1 ? darkMetal : chrome} />
            {i === 0 && <TickRing radius={spec.radius} />}
            {i === 1 && <Beads radius={spec.radius} />}
            {i === 2 && <DashedRing radius={spec.radius + 0.07} />}
          </group>
        </group>
      ))}

      <CoreFeathers anim={anim} quality={quality} />
      <CoreDust count={particleCount} />
    </group>
  )
}
