import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { COW_KEYPOINT_NAMES, COW_SKELETON } from '../../../data/herdVisionInference'
import { accentGlow, lineAccent, lineMuted, satinMetal } from '../../materials'
import { runtime } from '../../runtime'

/*
 * Stylized illustration of the HERD-VISION pose schema (13 keypoints, same
 * order and bones as the herd-vision backend's pose_schema.py). It is NOT
 * model output — it is a hand-proportioned cow in side profile, facing -x,
 * standing on the ground at y = GROUND, used as decorative 3D art.
 */
const GROUND = -1.15
const NEAR = 0.22 // cow's left side faces the camera (+z)
const FAR = -0.22
const FAR_DX = 0.07 // nudge far legs back so they read separately

// Rest pose [x, y] for each keypoint, in schema order.
const REST = {
  head: [-1.62, 0.36],
  neck: [-1.12, 0.6],
  withers: [-0.62, 0.84],
  mid_back: [0.12, 0.76],
  tail_base: [0.95, 0.86],
  front_knee: [-0.6, -0.42], // carpus, roughly mid-height of the foreleg
  front_hoof: [-0.62, GROUND],
  hind_hock: [0.98, -0.3], // hock sits higher than the knee and behind the hoof
  hind_hoof: [0.84, GROUND],
}

// Four-beat walk (lateral sequence): LH → LF → RH → RF.
const LEGS = [
  { joint: 5, hoof: 6, front: true, z: NEAR, dx: 0, phase: Math.PI / 2 }, // front left
  { joint: 7, hoof: 8, front: true, z: FAR, dx: FAR_DX, phase: (3 * Math.PI) / 2 }, // front right
  { joint: 9, hoof: 10, front: false, z: NEAR, dx: 0, phase: 0 }, // hind left
  { joint: 11, hoof: 12, front: false, z: FAR, dx: FAR_DX, phase: Math.PI }, // hind right
]

// Faint body contour (torso, neck, head) so the skeleton reads as a cow.
const CONTOUR = [
  [-1.9, 0.27], [-1.62, 0.62], [-1.42, 0.72], [-1.05, 0.86], [-0.62, 1.0], [0.1, 0.92],
  [0.7, 0.99], [1.03, 0.97], [1.16, 0.7], [1.13, 0.14], [0.96, -0.04], [0.4, -0.12],
  [-0.2, -0.14], [-0.6, -0.06], [-0.9, 0.12], [-1.25, 0.24], [-1.6, 0.14], [-1.87, 0.15],
]

const KP_COUNT = COW_KEYPOINT_NAMES.length
const UP = new Vector3(0, 1, 0)

const BOX = { x0: -2.05, y0: GROUND - 0.12, x1: 1.32, y1: 1.14 }

function segmentsFromLoop(points) {
  const out = []
  points.forEach(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length]
    out.push(x, y, NEAR + 0.01, nx, ny, NEAR + 0.01)
  })
  return out
}

function rectSegments({ x0, y0, x1, y1 }) {
  return [x0, y0, 0, x1, y0, 0, x1, y0, 0, x1, y1, 0, x1, y1, 0, x0, y1, 0, x0, y1, 0, x0, y0, 0]
}

function bracketSegments({ x0, y0, x1, y1 }, s) {
  return [
    x0, y0, 0, x0 + s, y0, 0, x0, y0, 0, x0, y0 + s, 0,
    x1, y0, 0, x1 - s, y0, 0, x1, y0, 0, x1, y0 + s, 0,
    x1, y1, 0, x1 - s, y1, 0, x1, y1, 0, x1, y1 - s, 0,
    x0, y1, 0, x0 + s, y1, 0, x0, y1, 0, x0, y1 - s, 0,
  ]
}

const lineGeometry = (positions) => {
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return g
}

/** HERD-VISION — a walking cow skeleton following the project's keypoint schema. */
export default function PoseEmblem({ focus }) {
  const points = useRef()
  const bones = useRef()
  const kp = useMemo(() => Array.from({ length: KP_COUNT }, () => new Vector3()), [])
  const dummy = useMemo(() => new Object3D(), [])
  const dir = useMemo(() => new Vector3(), [])
  const quat = useMemo(() => new Quaternion(), [])

  const geometries = useMemo(
    () => ({
      point: new SphereGeometry(0.05, 12, 12),
      bone: new CylinderGeometry(0.018, 0.018, 1, 6, 1),
      contour: lineGeometry(segmentsFromLoop(CONTOUR)),
      box: lineGeometry(rectSegments(BOX)),
      brackets: lineGeometry(bracketSegments(BOX, 0.28)),
    }),
    [],
  )

  useFrame((state) => {
    const speed = 1.3 + focus.current * 0.6
    const t = state.clock.elapsedTime * speed * runtime.motion
    const bob = Math.sin(t * 2) * 0.012

    // Spine and head (near-side plane, z = 0 centre line).
    kp[0].set(REST.head[0], REST.head[1] + bob + Math.sin(t * 2 + 0.6) * 0.02, 0)
    kp[1].set(REST.neck[0], REST.neck[1] + bob, 0)
    kp[2].set(REST.withers[0], REST.withers[1] + bob, 0)
    kp[3].set(REST.mid_back[0], REST.mid_back[1] + bob * 0.6, 0)
    kp[4].set(REST.tail_base[0], REST.tail_base[1] + bob, 0)

    LEGS.forEach((leg) => {
      const swing = Math.sin(t + leg.phase) // + forward/back
      const lift = Math.max(0, Math.cos(t + leg.phase)) // > 0 while the hoof is in the air
      const joint = leg.front ? REST.front_knee : REST.hind_hock
      const hoof = leg.front ? REST.front_hoof : REST.hind_hoof
      // Joints move a little; hooves travel further and lift during the swing.
      kp[leg.joint].set(joint[0] + leg.dx - swing * 0.09, joint[1] + lift * 0.06, leg.z)
      kp[leg.hoof].set(
        hoof[0] + leg.dx - swing * 0.22 + (leg.front ? lift * 0.1 : -lift * 0.04),
        hoof[1] + lift * 0.16,
        leg.z,
      )
    })

    kp.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.quaternion.identity()
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      points.current.setMatrixAt(i, dummy.matrix)
    })
    points.current.instanceMatrix.needsUpdate = true

    COW_SKELETON.forEach(([a, b], i) => {
      dir.subVectors(kp[b], kp[a])
      const len = dir.length()
      dummy.position.addVectors(kp[a], kp[b]).multiplyScalar(0.5)
      quat.setFromUnitVectors(UP, dir.normalize())
      dummy.quaternion.copy(quat)
      dummy.scale.set(1, len, 1)
      dummy.updateMatrix()
      bones.current.setMatrixAt(i, dummy.matrix)
    })
    bones.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[0.25, 0.1, 0]}>
      <lineSegments geometry={geometries.contour} material={lineMuted} />
      <instancedMesh ref={bones} args={[geometries.bone, satinMetal, COW_SKELETON.length]} frustumCulled={false} />
      <instancedMesh ref={points} args={[geometries.point, accentGlow, KP_COUNT]} frustumCulled={false} />
      <lineSegments geometry={geometries.box} material={lineMuted} />
      <lineSegments geometry={geometries.brackets} material={lineAccent} />
    </group>
  )
}
