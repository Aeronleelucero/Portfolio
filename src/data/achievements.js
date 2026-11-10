/**
 * Milestones, taken directly from the CV (education and dated projects).
 *
 * Only VERIFIED entries belong here. Add awards, competitions or work
 * experience with the same shape and the matching `type`:
 *   'milestone' | 'project' | 'award' | 'competition' | 'experience'
 */
export const achievements = [
  {
    id: 'ict-start',
    type: 'milestone',
    marker: '2020',
    title: 'Began ICT studies',
    organization: 'STI College of Tagum',
    description: 'Started formal training in information and communications technology.',
  },
  {
    id: 'cs-start',
    type: 'milestone',
    marker: '2022',
    title: 'Completed ICT · Entered Computer Science',
    organization: 'University of Mindanao Tagum College',
    description: 'Moved from ICT into the Bachelor of Science in Computer Science program.',
  },
  {
    id: 'carmalutao',
    type: 'project',
    marker: '2024',
    title: 'CarMaLuTao Online Store',
    organization: 'PHP · CSS · MySQL',
    description: 'Built a responsive e-commerce website with cart, authentication, order tracking and an admin panel.',
  },
  {
    id: 'paws4pals-sis',
    type: 'project',
    marker: '2025',
    title: 'PAWS4PALS & Student Information System',
    organization: 'React · TypeScript · Python · SQLite',
    description: 'Delivered an inventory system for a local pet shop and a CRUD student-record application.',
  },
  {
    id: 'herd-vision',
    type: 'project',
    marker: '2026',
    title: 'HERD-VISION — NAFAMCO 2026',
    organization: 'YOLOv8 · FastAPI · React',
    description: 'Developed an AI-assisted dairy-cow lameness detection and body-condition scoring system.',
  },
  {
    id: 'cs-graduate',
    type: 'milestone',
    marker: '2026',
    title: 'Computer Science Graduate',
    organization: 'University of Mindanao Tagum College',
    description: 'Completed the Bachelor of Science in Computer Science.',
  },
]

export const ACHIEVEMENT_TYPE_LABELS = {
  milestone: 'Milestone',
  project: 'Project',
  award: 'Award',
  competition: 'Competition',
  experience: 'Experience',
}
