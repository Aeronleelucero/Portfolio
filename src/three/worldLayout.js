import { CatmullRomCurve3, Vector3 } from 'three'
import { projects as projectData } from '../data/projects'

const PROJECT_START_Z = -54
const PROJECT_SPACING = 10
const projectZ = (i) => PROJECT_START_Z - i * PROJECT_SPACING
const lastProjectZ = projectZ(projectData.length - 1)

/**
 * World layout — where every 3D "station" lives in the continuous environment.
 * The journey travels down -Z, weaving left and right. Camera keyframes,
 * scene keyframes and 3D objects all read from here so they stay in sync.
 */
export const WORLD = {
  core: [0, 0, 0],
  // The conduit's source: a small port beneath the Digital Core, clear of
  // the shell and rings, so the glowing line emerges from the sculpture's base.
  corePort: [0, -3.2, 0],

  education: {
    railX: -6,
    railY: -1.6,
    railStartZ: -9,
    railEndZ: -30,
    // Year → z position along the rail.
    yearZ: (year) => -12 - (year - 2020) * 2.5,
    gateYears: [2020, 2022, 2026],
  },

  skills: [6.5, 0.4, -40],

  // Alternating left / right down the corridor, one per project.
  projects: projectData.map((_, i) => [i % 2 === 0 ? -3.8 : 3.8, 0, projectZ(i)]),

  // Far enough past the last project that it falls behind the camera.
  achievements: { base: [0, -2.2, lastProjectZ - 26], height: 9, radius: 2.1 },
}

const edu = WORLD.education
const eduPoint = (year) => [edu.railX, edu.railY, edu.yearZ(year)]

// The conduit runs *beneath* each exhibit rather than through it: low along
// the floor between stations (well below every camera path), along the top of
// each project plinth, under the skills constellation, and just above — never
// flush with — the recognition tower's base. Along the Education rail it is
// masked out (see Conduit.jsx): the rail's own progress strip is the line there.
const PLINTH_TOP_Y = -1.64
const underSkills = [WORLD.skills[0], -2.3, WORLD.skills[2]]
const towerBase = WORLD.achievements.base
const aboveTowerBase = towerBase[1] + 0.06

/** Points the "data conduit" passes through, in journey order. */
export const CONDUIT_POINTS = [
  WORLD.corePort,
  [-2.6, -3.3, -4.2],
  [-5.2, -2.5, -7.6],
  eduPoint(2019),
  eduPoint(2020),
  eduPoint(2022),
  eduPoint(2026),
  [-3.2, -2.9, -32],
  underSkills,
  [1.5, -2.0, -48],
  ...WORLD.projects.map(([x, , z]) => [x, PLINTH_TOP_Y, z]),
  [2.4, -2, lastProjectZ - 12],
  [1.2, aboveTowerBase, lastProjectZ - 20],
  [0, aboveTowerBase, towerBase[2]],
  [0, WORLD.achievements.base[1] + WORLD.achievements.height, WORLD.achievements.base[2]],
].map((p) => new Vector3(...p))

export const conduitCurve = new CatmullRomCurve3(CONDUIT_POINTS, false, 'centripetal', 0.5)

/** Arc-length parameter (0..1) of the curve point nearest to `p`. */
export function curveParamNear(p) {
  const target = new Vector3(...p)
  const samples = 600
  let best = 0
  let bestDist = Infinity
  const tmp = new Vector3()
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    conduitCurve.getPointAt(u, tmp)
    const d = tmp.distanceToSquared(target)
    if (d < bestDist) {
      bestDist = d
      best = u
    }
  }
  return best
}

export const vec = (arr, dx = 0, dy = 0, dz = 0) => [arr[0] + dx, arr[1] + dy, arr[2] + dz]
