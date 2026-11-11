import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { scrollState } from '../../animations/scrollConfig'
import { interaction } from '../../hooks/interaction'
import { PALETTE } from '../materials'
import { runtime } from '../runtime'

/**
 * Layered plume of iridescent feathers fanning out behind the Digital Core.
 *
 * - Geometry: a subdivided, curved plane per feather; the silhouette comes
 *   from an alpha cut-out, so edges stay crisp at any resolution.
 * - Texture: drawn once on a canvas (shaft, fine barbs, vane splits, a
 *   plum → violet → magenta gradient) and reused as a bump map for relief.
 * - Depth: three layers at different distances, each with its own pointer
 *   parallax; all sit behind the orbital rings so nothing intersects.
 */

const TEX_W = 256
const TEX_H = 1024

function drawFeatherTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const g = canvas.getContext('2d')
  const cx = TEX_W / 2

  // Vane outline: v = 0 at the quill (bottom), 1 at the tip (top). Slightly asymmetric.
  const halfWidth = (v, side) => {
    const s = Math.sin(Math.PI * Math.min(1, v * 1.05)) ** 0.75
    return (side < 0 ? 0.47 : 0.41) * TEX_W * s * (1 - v * 0.25)
  }
  const y = (v) => TEX_H * (1 - v)

  g.beginPath()
  g.moveTo(cx, y(0.02))
  for (let v = 0.02; v <= 1; v += 0.01) g.lineTo(cx - halfWidth(v, -1), y(v))
  for (let v = 1; v >= 0.02; v -= 0.01) g.lineTo(cx + halfWidth(v, 1), y(v))
  g.closePath()
  const grad = g.createLinearGradient(0, TEX_H, 0, 0)
  grad.addColorStop(0, '#24102e') // plum at the quill
  grad.addColorStop(0.35, PALETTE.violet)
  grad.addColorStop(0.78, PALETTE.accent) // magenta
  grad.addColorStop(1, '#e3b6ea')
  g.fillStyle = grad
  g.fill()

  // Fine barbs angled up and out from the shaft.
  g.save()
  g.clip()
  let seed = 11
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let v = 0.03; v < 1; v += 0.0042) {
    for (const side of [-1, 1]) {
      const w = halfWidth(v, side)
      const x1 = cx + side * w * 1.05
      const y1 = y(v) - w * 0.62
      const light = rand() > 0.5
      g.strokeStyle = light ? 'rgba(236, 214, 246, 0.32)' : 'rgba(18, 6, 26, 0.38)'
      g.lineWidth = light ? 1.1 : 1.4
      g.beginPath()
      g.moveTo(cx, y(v))
      g.quadraticCurveTo(cx + side * w * 0.45, y(v) - w * 0.12, x1, y1)
      g.stroke()
    }
  }
  g.restore()

  // Vane splits: a few barbs pulled apart, the hallmark of a real feather.
  g.globalCompositeOperation = 'destination-out'
  for (let k = 0; k < 7; k++) {
    const v = 0.22 + rand() * 0.7
    const side = rand() > 0.5 ? 1 : -1
    const w = halfWidth(v, side)
    g.lineWidth = 2 + rand() * 3
    g.beginPath()
    g.moveTo(cx + side * w * (0.35 + rand() * 0.3), y(v))
    g.lineTo(cx + side * w * 1.2, y(v) - w * 0.7)
    g.stroke()
  }
  g.globalCompositeOperation = 'source-over'

  // Shaft (rachis): a fine teal-to-lavender line, tapering to the tip.
  const shaft = g.createLinearGradient(0, TEX_H, 0, 0)
  shaft.addColorStop(0, PALETTE.teal)
  shaft.addColorStop(1, '#efe4f5')
  g.strokeStyle = shaft
  for (let v = 0; v < 0.98; v += 0.01) {
    g.lineWidth = 3.4 * (1 - v) + 0.8
    g.beginPath()
    g.moveTo(cx, y(v))
    g.lineTo(cx, y(v + 0.011))
    g.stroke()
  }
  return canvas
}

/** Curved feather plane: bends backward and slightly sideways along its length. */
function buildFeatherGeometry() {
  const geo = new PlaneGeometry(0.4, 1, 8, 32)
  geo.translate(0, 0.5, 0)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const v = pos.getY(i)
    pos.setZ(i, -0.22 * v * v - 0.05 * Math.abs(x) * 6 * v) // arc back + cupped vane
    pos.setX(i, x + 0.07 * v * v)
  }
  geo.computeVertexNormals()
  return geo
}

// Layers from back to front: fewer, shorter feathers toward the viewer.
const LAYERS = [
  { z: -3.9, count: 11, length: [3.3, 3.9], tint: '#6d5288', tilt: 0.42, parallax: 0.06 },
  { z: -3.4, count: 10, length: [2.6, 3.2], tint: '#ffffff', tilt: 0.5, parallax: 0.11 },
  { z: -2.95, count: 8, length: [2.0, 2.5], tint: '#f4dcf6', tilt: 0.58, parallax: 0.17 },
]
// The plume fans to the right/up/down, leaving the hero text side (left) clear.
const ARC_START = MathUtils.degToRad(-145)
const ARC_END = MathUtils.degToRad(145)

const smoothstep = (a, b, x) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

export default function CoreFeathers({ anim, quality = 'high' }) {
  const gl = useThree((s) => s.gl)
  const plume = useRef()
  const layerRefs = useRef([])
  const instanceRefs = useRef([])
  const dummy = useMemo(() => new Object3D(), [])

  const texture = useMemo(() => {
    const t = new CanvasTexture(drawFeatherTexture())
    t.colorSpace = SRGBColorSpace
    return t
  }, [])
  useEffect(() => {
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.needsUpdate = true
  }, [gl, texture])

  const geometry = useMemo(() => buildFeatherGeometry(), [])
  const materials = useMemo(
    () =>
      LAYERS.map((layer) =>
        quality === 'high'
          ? new MeshPhysicalMaterial({
              color: layer.tint,
              map: texture,
              bumpMap: texture,
              bumpScale: 1.4,
              alphaTest: 0.45,
              side: DoubleSide,
              roughness: 0.42,
              metalness: 0.12,
              sheen: 1,
              sheenColor: PALETTE.accent,
              sheenRoughness: 0.35,
              iridescence: 0.55,
              iridescenceIOR: 1.35,
              iridescenceThicknessMinimum: 180,
              iridescenceThicknessMaximum: 520,
              clearcoat: 0.25,
              clearcoatRoughness: 0.3,
              envMapIntensity: 1.1,
            })
          : new MeshStandardMaterial({
              color: layer.tint,
              map: texture,
              alphaTest: 0.45,
              side: DoubleSide,
              roughness: 0.5,
              metalness: 0.1,
            }),
      ),
    [quality, texture],
  )
  useEffect(
    () => () => {
      texture.dispose()
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    },
    [texture, geometry, materials],
  )

  // Deterministic placement for every feather in every layer.
  const feathers = useMemo(() => {
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    return LAYERS.map((layer, li) => {
      const count = quality === 'high' ? layer.count : Math.ceil(layer.count * 0.6)
      return Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5 + (li % 2) * 0.5) / count
        const theta = ARC_START + (ARC_END - ARC_START) * Math.min(1, t) + (rand() - 0.5) * 0.12
        const length = MathUtils.lerp(layer.length[0], layer.length[1], rand())
        return {
          theta,
          radius: 0.85 + rand() * 0.35,
          length,
          width: length * (0.5 + rand() * 0.12),
          tilt: layer.tilt + (rand() - 0.5) * 0.12,
          phase: rand() * Math.PI * 2,
        }
      })
    })
  }, [quality])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime
    const motion = runtime.motion
    const a = anim.current
    const opened = Math.min(1.4, sceneState.coreExpand + a.unfold)
    const usePointer = motion && interaction.pointerType === 'mouse'
    const px = usePointer ? interaction.pointer.x : 0
    const py = usePointer ? interaction.pointer.y : 0

    // The plume belongs to the hero/About views and the finale. Mid-journey the
    // camera passes behind the core (Education starts ~3 units behind it), so
    // the feathers fold into the core and return only once the camera is back
    // in front of it at the very end of the finale.
    const s = scrollState.current
    const presence = MathUtils.clamp(
      1 - smoothstep(1.1, 1.75, s) + smoothstep(scrollState.max - 0.18, scrollState.max - 0.02, s),
      0,
      1,
    )
    if (plume.current) {
      plume.current.visible = presence > 0.02
      plume.current.scale.setScalar(0.2 + presence * 0.8)
    }
    if (presence <= 0.02) return

    layerRefs.current.forEach((layer, li) => {
      if (!layer) return
      const L = LAYERS[li]
      // Parallax: nearer layers drift further with the pointer. Opening pushes the plume back.
      layer.position.x = MathUtils.damp(layer.position.x, px * L.parallax, 2.5, dt)
      layer.position.y = MathUtils.damp(layer.position.y, py * L.parallax * 0.7, 2.5, dt)
      layer.position.z = L.z - opened * 1.3
      layer.rotation.z += dt * 0.015 * (li % 2 ? -1 : 1) * motion
    })

    // One instanced mesh per layer (3 draw calls for the whole plume).
    // Each feather: base on a ring → point outward (Z) → lean back (X) → sway (Y).
    instanceRefs.current.forEach((mesh, li) => {
      if (!mesh) return
      const grow = 1 + opened * 0.08
      feathers[li].forEach((d, i) => {
        const sway = Math.sin(t * 0.5 + d.phase) * 0.035 * motion
        dummy.position.set(Math.cos(d.theta) * d.radius, Math.sin(d.theta) * d.radius, 0)
        dummy.rotation.set(-(d.tilt + opened * 0.25 - a.hover * 0.06), sway, d.theta - Math.PI / 2, 'ZXY')
        dummy.scale.set(d.width * grow, d.length * grow, d.length * grow)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group ref={plume}>
      {LAYERS.map((layer, li) => (
        <group key={li} ref={(el) => (layerRefs.current[li] = el)} position={[0, 0, layer.z]}>
          <instancedMesh
            ref={(el) => (instanceRefs.current[li] = el)}
            args={[geometry, materials[li], feathers[li].length]}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  )
}
