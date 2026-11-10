/**
 * Personal profile — single source of truth for identity and contact details.
 * Source: Aeron-Lucero-CV.pdf (public/files). Any field left as `null` is
 * hidden in the UI.
 */
export const profile = {
  firstName: 'Aeron',
  lastName: 'Lucero',
  fullName: 'Aeron Lee Vincent Lucero',
  initials: 'AL',
  // Visual line breaks for the hero name.
  nameLines: ['Aeron Lee', 'Vincent', 'Lucero'],

  // Primary professional title.
  title: 'Software Developer',
  role: 'Computer Science Graduate',
  headline: 'Software Developer — Computer Science Graduate',
  // Secondary professional identity (About section).
  secondaryTitle: 'Cybersecurity Enthusiast',
  location: 'Maco, Davao de Oro, Philippines',

  // Hero description.
  tagline:
    'Computer Science graduate passionate about software engineering, AI-powered applications, backend systems, and building practical technology solutions.',

  focus: ['Software Engineering', 'Backend Development', 'Artificial Intelligence', 'Cybersecurity'],

  about: [
    'I’m Aeron Lee Vincent Lucero, a Computer Science graduate interested in software engineering, backend development, and artificial intelligence.',
    'I enjoy developing practical applications that combine modern web technologies, reliable backend systems, and intelligent solutions.',
  ],

  // Professional profile (About). Interests and activities only — no
  // certifications, pentesting experience or competition results are claimed.
  identity: {
    intro: 'I’m a Software Developer passionate about building practical solutions through code.',
    highlights: [
      { icon: 'degree', text: 'Bachelor of Science in Computer Science' },
      { icon: 'stack', text: 'Interested in full-stack development and system engineering' },
      { icon: 'security', text: 'Exploring cybersecurity, ethical hacking, and CTF competitions' },
      { icon: 'ai', text: 'Working on AI-powered applications and computer vision' },
      { icon: 'linux', text: 'Linux enthusiast and open-source learner' },
      { icon: 'growth', text: 'Always learning, building, and improving' },
    ],
  },

  // Summary used on the printable resume.
  // Matches the PDF CV's Professional Summary verbatim.
  summary:
    'Computer Science graduate and aspiring software developer with hands-on experience building web and mobile applications, REST APIs, database-backed systems, and computer-vision solutions. Developed a QR Attendance application using React Native with offline attendance storage and synchronization with a Laravel backend. Interested in secure, reliable, and user-focused software systems.',

  strengths: ['Problem-solving', 'Analytical thinking', 'Independent and team collaboration', 'Willingness to learn new technologies'],

  facts: [
    { label: 'Degree', value: 'BS Computer Science' },
    { label: 'Based in', value: 'Maco, Davao de Oro' },
    { label: 'Core stack', value: 'React · Laravel · FastAPI' },
  ],

  photo: {
    src: '/images/aeron-lucero.jpg',
    srcSmall: '/images/aeron-lucero-480.jpg',
    width: 960,
    height: 1200,
    alt: 'Portrait of Aeron Lee Vincent Lucero',
  },

  contact: {
    email: 'forstakenajax@gmail.com',
    phone: { display: '(0968) 770-7334', tel: '+639687707334' },
    // Confirmed by the owner.
    github: 'https://github.com/Aeronleelucero',
    // Confirmed by the owner.
    linkedin: 'https://www.linkedin.com/in/aeron-lee-vincent-lucero-884908351/',
  },

  cv: {
    // The real CV. Served as a static file, so it survives production builds.
    pdf: '/files/Aeron-Lucero-CV.pdf',
    filename: 'Aeron-Lucero-CV.pdf',
    // Printable HTML resume generated from these data files.
    web: '/resume.html',
  },
}
