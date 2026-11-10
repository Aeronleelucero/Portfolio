/**
 * Technical skills grouped by category (source: CV). Each category becomes
 * one node of the 3D constellation; each item becomes a satellite.
 */
export const skillCategories = [
  {
    id: 'programming',
    label: 'Programming',
    blurb: 'Languages I build applications with.',
    items: ['Java', 'Python', 'C#', 'PHP', 'JavaScript', 'TypeScript'],
  },
  {
    id: 'web-mobile',
    label: 'Web & Mobile',
    blurb: 'Interfaces, mobile apps and web frameworks.',
    items: ['React', 'React Native', 'Vite', 'HTML', 'CSS', 'Bootstrap', 'Laravel'],
  },
  {
    id: 'backend',
    label: 'Backend & APIs',
    blurb: 'Services, APIs and real-time communication.',
    items: ['FastAPI', 'REST APIs', 'WebSockets'],
  },
  {
    id: 'databases',
    label: 'Databases',
    blurb: 'Relational storage, from server to offline device.',
    items: ['MySQL', 'SQLite', 'SQL Server'],
  },
  {
    id: 'tools',
    label: 'Tools & Platforms',
    blurb: 'Day-to-day development environment.',
    items: ['Git', 'Visual Studio Code', 'Figma', 'Android Studio', 'Linux'],
  },
  {
    id: 'engineering',
    label: 'Software Engineering',
    blurb: 'Practices for designing and maintaining systems.',
    items: ['CRUD Applications', 'UML Diagrams', 'Waterfall Methodology', 'Troubleshooting'],
  },
]
