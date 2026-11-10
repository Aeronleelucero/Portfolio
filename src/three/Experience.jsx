import CameraController from './CameraController'
import SceneEnvironment from './Environment'
import DigitalCore from './objects/DigitalCore'
import Conduit from './objects/Conduit'
import ParticleField from './objects/ParticleField'
import GroundGrid from './objects/GroundGrid'
import EducationTimeline from './objects/EducationTimeline'
import SkillsConstellation from './objects/SkillsConstellation'
import ProjectGallery from './objects/ProjectGallery'
import AchievementsTower from './objects/AchievementsTower'

/**
 * The continuous world. Every chapter has a physical "station" placed along
 * the journey (see worldLayout.js); the camera travels between them.
 */
export default function Experience({ profile }) {
  const low = profile.tier === 'low'
  return (
    <>
      <CameraController
        isMobile={profile.isMobile}
        reducedMotion={profile.reducedMotion}
        coarsePointer={profile.coarsePointer}
      />
      <SceneEnvironment />

      <DigitalCore particleCount={low ? 90 : 220} />
      <Conduit segments={low ? 500 : 900} />
      <EducationTimeline />
      <SkillsConstellation />
      <ProjectGallery />
      <AchievementsTower />

      <ParticleField count={profile.particleCount} />
      <GroundGrid />
    </>
  )
}
