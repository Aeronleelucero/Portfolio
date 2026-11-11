import { gsap } from 'gsap'
import { STATIONS } from './scrollConfig'
import { projects as projectData } from '../data/projects'
import { education as educationData } from '../data/education'
import { WORLD, curveParamNear } from '../three/worldLayout'

/**
 * Scene state — every non-camera value that scroll animates. 3D components
 * read these values inside `useFrame`, so updates never trigger React renders.
 */
export const sceneState = {
  coreExpand: 0, // scroll-driven ring opening around the Digital Core (plates move only on click/hover)
  keyLight: 1.6, // white key light intensity
  rimLight: 2.6, // red rim light intensity
  fogNear: 7,
  fogFar: 40,
  particleSpeed: 0.25,
  conduitProgress: 0, // how far the red "journey" line is lit (0..1 along the curve)
  eduYear: 2019, // education rail is lit up to this year
  skillsReveal: 0, // constellation assembly (0..1)
  projectFocus: -1, // fractional index of the project in focus
  towerReveal: 0, // achievements helix nodes lit (0..1)
  exposure: 1,
}

const { education: edu, skills, projects, achievements } = WORLD

// Conduit progress values computed from the world layout at module load.
const u = {
  core: curveParamNear(WORLD.core),
  eduSti: curveParamNear([edu.railX, edu.railY, edu.yearZ(2022)]),
  eduUmtc: curveParamNear([edu.railX, edu.railY, edu.yearZ(2026)]),
  skills: curveParamNear(skills),
  projects: projects.map((p) => curveParamNear(p)),
  tower: curveParamNear(achievements.base),
}

const base = {
  coreExpand: 0.25,
  keyLight: 1.6,
  rimLight: 2.6,
  fogNear: 6,
  fogFar: 36,
  particleSpeed: 0.25,
  skillsReveal: 0,
  projectFocus: -1,
  towerReveal: 0,
  exposure: 1,
}

/** One scene keyframe per station (missing values inherit from `base`). */
const KEYFRAMES = {
  hero: { coreExpand: 0, conduitProgress: u.core * 0.6, eduYear: 2019, fogNear: 10, fogFar: 24, rimLight: 2.4 },
  about: { coreExpand: 0.32, conduitProgress: u.core, eduYear: 2019, fogNear: 6, fogFar: 36, rimLight: 3.6, particleSpeed: 0.18 },
  [`education-${educationData[0].id}`]: { conduitProgress: u.eduSti, eduYear: 2022, fogNear: 4, fogFar: 30, rimLight: 2.2 },
  [`education-${educationData[1].id}`]: { conduitProgress: u.eduUmtc, eduYear: 2026, fogNear: 4, fogFar: 30, rimLight: 2.4 },
  skills: { conduitProgress: u.skills, eduYear: 2026, skillsReveal: 1, rimLight: 2.8, particleSpeed: 0.2 },
  ...Object.fromEntries(
    projectData.map((p, i) => [
      `project-${p.id}`,
      { conduitProgress: u.projects[i], eduYear: 2026, skillsReveal: 1, projectFocus: i, fogFar: 32, rimLight: 3.2 },
    ]),
  ),
  achievements: { conduitProgress: u.tower, eduYear: 2026, skillsReveal: 1, projectFocus: projectData.length, towerReveal: 1, fogFar: 40, rimLight: 2.8 },
  contact: {
    coreExpand: 0.28,
    conduitProgress: 1,
    eduYear: 2026,
    skillsReveal: 1,
    projectFocus: projectData.length,
    towerReveal: 1,
    fogNear: 9,
    fogFar: 34,
    rimLight: 3.4,
    keyLight: 1.8,
    particleSpeed: 0.16,
    exposure: 1.05,
  },
}

export function getSceneKeyframes() {
  return STATIONS.map((id) => ({ ...base, ...KEYFRAMES[id] }))
}

/**
 * Paused GSAP timeline animating `sceneState`; time === station index.
 * Uses a gentler ease than the camera so lighting "breathes" between stations.
 */
export function createSceneTimeline() {
  const frames = getSceneKeyframes()
  Object.assign(sceneState, frames[0])
  const timeline = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'sine.inOut' } })
  for (let i = 1; i < frames.length; i++) {
    timeline.to(sceneState, { ...frames[i] }, i - 1)
  }
  return timeline
}
