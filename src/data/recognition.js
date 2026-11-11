/**
 * Certifications, competitions and workshops — the single source for the
 * recognition gallery. Only records backed by the supplied images belong
 * here; never add sample or placeholder entries.
 *
 * Fields:
 *  - image:        original full-resolution file (shown in the preview modal)
 *  - thumb:        lightweight copy for the gallery card (same proportions)
 *  - width/height: original pixel size, used to reserve the correct aspect ratio
 *  - layout:       'feature' (large landscape photo), 'document' (certificate,
 *                  never cropped) or 'photo' (event documentation)
 *  - focus:        object-position for photo cards whose card frame crops
 *                  (the original is always shown uncropped in the modal)
 *  - date:         null when the source doesn't state one — never guess
 */

export const RECOGNITION_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'competitions', label: 'Competitions' },
  { id: 'workshops', label: 'Workshops & Seminars' },
]

export const CATEGORY_LABELS = {
  certifications: 'Certification',
  competitions: 'Competition',
  workshops: 'Workshop & Seminar',
}

export const recognition = [
  {
    id: 'hack4gov-syscall',
    category: 'competitions',
    layout: 'feature',
    title: 'Hack4Gov — Team SysCall',
    organization: 'Hack4Gov / DICT Region XI',
    date: null,
    description: 'Team participation in the Hack4Gov event with Team SysCall.',
    image: '/images/recognition/competitions/hack4gov-syscall.jpg',
    thumb: '/images/recognition/competitions/thumbs/hack4gov-syscall.webp',
    width: 1280,
    height: 960,
    alt: 'Team SysCall group photo on the Hack4Gov stage, with the SysCall team name on the screen behind them.',
  },
  {
    id: 'uplb-coss-game-jam-2026',
    category: 'certifications',
    layout: 'document',
    title: 'Certificate of Appreciation',
    event: 'UPLB COSS Game Jam 2026',
    organization: 'UPLB COSS',
    date: 'July 27, 2026',
    description:
      'Recognized for actively participating in the UPLB COSS Game Jam online workshop and competition.',
    image: '/images/recognition/certifications/uplb-coss-game-jam-2026.png',
    thumb: '/images/recognition/certifications/thumbs/uplb-coss-game-jam-2026.webp',
    width: 2000,
    height: 1414,
    alt: 'Certificate of Appreciation from UPLB COSS Game Jam Los Baños 2026 awarded to Aeron Lee Vincent Lucero, given July 27, 2026.',
  },
  {
    id: 'lgu-maco-digital-transformation',
    category: 'workshops',
    layout: 'photo',
    title: 'Knowledge Sharing on Digital Transformation',
    organization: 'Municipal Government of Maco',
    date: null,
    description:
      'Photo documentation of a knowledge-sharing activity covering data center management, operational protocols, and IT infrastructure.',
    image: '/images/recognition/workshops/lgu-maco-digital-transformation.jpg',
    thumb: '/images/recognition/workshops/thumbs/lgu-maco-digital-transformation.webp',
    width: 1080,
    height: 1350,
    // The source is a portrait news graphic; the card frames its photo area.
    focus: '50% 32%',
    credit: 'Image: Juander Radyo Nabunturan 88.5FM',
    alt: 'News graphic from Juander Radyo Nabunturan 88.5FM showing participants of a knowledge-sharing session on data center management and web hosting with the Municipal Government of Maco.',
  },
  {
    id: 'datheon-python-internship',
    category: 'certifications',
    layout: 'document',
    title: 'Python Programming Internship',
    certificateType: 'Certificate of Completion',
    organization: 'Datheon — AI Systems & Automation Studio',
    recipient: 'Aeron Lee Vincent Lucero',
    duration: '4 weeks',
    date: 'October 18, 2025',
    certificateId: 'CERT-DT-2025-00040 (LUCERO)',
    description:
      'Successfully completed a four-week Python Programming Internship with Datheon — AI Systems & Automation Studio.',
    image: '/images/recognition/certifications/datheon-python-programming-internship.png',
    thumb: '/images/recognition/certifications/thumbs/datheon-python-programming-internship.webp',
    width: 1536,
    height: 1024,
    // Printed on the certificate; the portfolio does not claim independent verification.
    verificationUrl: 'https://datheon.com/verify',
    alt: 'Datheon Certificate of Completion for the Python Programming Internship: duration 4 weeks, completed October 18, 2025, certificate ID CERT-DT-2025-00040 (LUCERO).',
  },
]
