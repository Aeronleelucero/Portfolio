import { gsap } from 'gsap'
import { STATIONS } from './scrollConfig'
import { projects as projectData } from '../data/projects'
import { education as educationData } from '../data/education'
import { WORLD, vec } from '../three/worldLayout'

/**
 * Camera keyframes, one per scroll station.
 *  - position: camera location
 *  - target:   point the camera looks at
 *  - fov:      vertical field of view
 *  - roll:     subtle banking (radians) for a cinematic feel
 *
 * On desktop the HTML panel sits on one side, so the target is offset to
 * push the 3D subject to the opposite side of the frame. On mobile, text and
 * 3D overlap, so subjects are centered and the camera pulls back.
 */
const { core, education: edu, skills, projects, achievements } = WORLD
const eduZ = edu.yearZ

function projectFrames(i) {
  const p = projects[i]
  const side = i % 2 === 0 ? -1 : 1 // even: text left / emblem right
  return {
    desktop: {
      position: vec(p, side * 0.6, 1.4, 10.5),
      target: vec(p, side * 2.4, 0.1, 0),
      fov: 38,
      roll: 0, // no alternating bank between projects
    },
    mobile: {
      position: vec(p, 0, 2.4, 11.5),
      target: vec(p, 0, -2.3, 0),
      fov: 50,
      roll: 0,
    },
  }
}

const KEYFRAMES = {
  hero: {
    desktop: { position: [0.4, 0.5, 10], target: [-2.6, 0, 0], fov: 38, roll: 0 },
    mobile: { position: [0, 1.2, 15], target: [0, -3, 0], fov: 50, roll: 0 },
  },
  about: {
    desktop: { position: vec(core, -5.5, 2.2, 8.5), target: vec(core, 2.4, 0.2, 0.4), fov: 36, roll: -0.04 },
    mobile: { position: vec(core, -3.6, 2.4, 13), target: vec(core, 0, -2.8, 0), fov: 50, roll: 0 },
  },
  [`education-${educationData[0].id}`]: {
    desktop: {
      position: [edu.railX + 5, 1.6, eduZ(2020) + 9],
      target: [edu.railX + 2.4, -0.2, eduZ(2021)],
      fov: 40,
      roll: 0.03,
    },
    mobile: {
      position: [edu.railX + 1.8, 2, eduZ(2020) + 10],
      target: [edu.railX, -2.4, eduZ(2021)],
      fov: 52,
      roll: 0,
    },
  },
  [`education-${educationData[1].id}`]: {
    desktop: {
      position: [edu.railX + 5, 1.8, eduZ(2022) + 9],
      target: [edu.railX + 2.4, -0.1, eduZ(2024)],
      fov: 40,
      roll: 0.03,
    },
    mobile: {
      position: [edu.railX + 1.8, 2.2, eduZ(2022) + 10],
      target: [edu.railX, -2.4, eduZ(2024)],
      fov: 52,
      roll: 0,
    },
  },
  skills: {
    desktop: { position: vec(skills, -0.8, 2, 13), target: vec(skills, -2.8, 0, 0), fov: 40, roll: -0.02 },
    mobile: { position: vec(skills, 0, 3, 15), target: vec(skills, 0, -2.6, 0), fov: 52, roll: 0 },
  },
  ...Object.fromEntries(projectData.map((p, i) => [`project-${p.id}`, projectFrames(i)])),
  achievements: {
    desktop: {
      position: vec(achievements.base, -3, 5.4, 16.5),
      target: vec(achievements.base, -3.8, 4.5, 0),
      fov: 42,
      roll: 0,
    },
    mobile: {
      position: vec(achievements.base, 0, 6.5, 17),
      target: vec(achievements.base, 0, 2.6, 0),
      fov: 54,
      roll: 0,
    },
  },
  // Finale: rewind over the whole lit journey and return to the Digital Core.
  contact: {
    desktop: { position: vec(core, 0.6, 3.4, 13), target: vec(core, 0, -1.9, 0), fov: 40, roll: 0 },
    mobile: { position: vec(core, 0, 3.4, 14), target: vec(core, 0, -2.6, 0), fov: 52, roll: 0 },
  },
}

export function getCameraKeyframes(isMobile) {
  return STATIONS.map((id) => {
    const kf = KEYFRAMES[id]
    return isMobile ? kf.mobile : kf.desktop
  })
}

const toRig = (kf) => ({
  px: kf.position[0],
  py: kf.position[1],
  pz: kf.position[2],
  tx: kf.target[0],
  ty: kf.target[1],
  tz: kf.target[2],
  fov: kf.fov,
  roll: kf.roll,
})

/**
 * Builds a paused GSAP timeline animating a plain "camera rig" object.
 * Timeline time === fractional station index, so the scroll system can call
 * `timeline.time(stationFloat)` directly.
 */
export function createCameraTimeline(isMobile) {
  const frames = getCameraKeyframes(isMobile)
  const rig = toRig(frames[0])
  // sine.inOut keeps peak speed mid-transition ~1.6× the average (power2.inOut
  // peaked at 3×, which made project-to-project moves feel rushed).
  const timeline = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'sine.inOut' } })
  for (let i = 1; i < frames.length; i++) {
    timeline.to(rig, toRig(frames[i]), i - 1)
  }
  return { rig, timeline }
}
