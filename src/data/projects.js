/**
 * Projects (source: CV), in CV order. `highlights` are the CV bullets verbatim.
 *
 * - `links.github` / `links.demo`: `null` until real URLs exist — never invent them.
 * - `emblem`: the 3D visual in src/three/objects/emblems/.
 * - `media`: optional screenshot. `inference` holds overlay annotations and
 *   must come from REAL model output only (see herdVisionInference.js).
 */
import { herdVisionInference } from './herdVisionInference'

export const projects = [
  {
    id: 'qr-attendance',
    title: 'QR Attendance System',
    meta: 'React Native & Laravel',
    category: 'Mobile · Offline-first',
    summary: 'Mobile attendance application designed to support event-based QR scanning and offline operation.',
    highlights: [
      'Built the mobile application with React Native and connected it to a Laravel backend.',
      'Implemented QR scanning and scanner authentication, with event and participant data synchronized from the server.',
      'Stored attendance locally in SQLite while offline and tracked pending records in a synchronization queue.',
      'Worked on synchronization and recovery behavior to support retrying pending attendance records when connectivity returns.',
      'Developed event-management functionality for creating events, selecting departments and employees, and managing participants through the web backend.',
    ],
    stack: ['React Native', 'Laravel', 'SQLite'],
    emblem: 'qr',
    links: { github: null, demo: null },
  },
  {
    id: 'herd-vision',
    title: 'HERD-VISION',
    subtitle: 'AI Lameness Detection',
    meta: 'NAFAMCO 2026',
    category: 'AI · Computer Vision',
    summary:
      'An AI-assisted dairy-cow lameness detection and body-condition scoring system developed using YOLOv8 pose estimation and temporal models.',
    // One-line description exactly as on the PDF CV (used by /resume.html).
    cvSummary: 'AI-assisted dairy-cow lameness detection and body-condition scoring system.',
    highlights: [
      'Developed a computer-vision pipeline using YOLOv8 pose estimation and temporal models.',
      'Built a modular FastAPI backend with REST APIs and WebSocket support for live data streaming.',
      'Created a React, TypeScript, and Vite frontend with real-time processing and inference monitoring.',
      'Used SQLite for lightweight local data storage and packaged the system as a Windows desktop application.',
    ],
    stack: ['Python', 'YOLOv8 Pose Estimation', 'FastAPI', 'React', 'TypeScript', 'Vite', 'SQLite'],
    emblem: 'pose',
    media: {
      src: '/images/herd-vision-cow.png',
      alt: 'Dairy cow image from the HERD-VISION lameness detection project',
      inference: herdVisionInference,
    },
    links: { github: null, demo: null },
  },
  {
    id: 'paws4pals',
    title: 'PAWS4PALS Inventory System',
    meta: '2025',
    category: 'Inventory System',
    summary: 'Inventory management system for a local pet shop.',
    highlights: [
      'Developed inventory-management features for tracking supplies, sales, and stock levels.',
      'Used React, TypeScript, and SQLite for the frontend and data layer.',
    ],
    stack: ['React', 'TypeScript', 'SQLite'],
    emblem: 'inventory',
    links: { github: null, demo: null },
  },
  {
    id: 'student-information-system',
    title: 'Student Information System',
    meta: '2025',
    category: 'Records Management',
    summary: 'A student-record management application with CRUD functionality.',
    highlights: ['Created a student-record management application with CRUD functionality using Python and SQLite.'],
    stack: ['Python', 'SQLite'],
    emblem: 'cards',
    links: { github: null, demo: null },
  },
  {
    id: 'carmalutao',
    title: 'CarMaLuTao Online Store',
    meta: '2024',
    category: 'E-commerce · Web',
    summary: 'A responsive e-commerce website.',
    highlights: [
      'Built a responsive e-commerce website using PHP, CSS, and MySQL, including product listings, cart, authentication, order tracking, and an admin panel.',
    ],
    stack: ['PHP', 'CSS', 'MySQL'],
    emblem: 'cart',
    links: { github: null, demo: null },
  },
].map((p, i, all) => ({
  ...p,
  index: String(i + 1).padStart(2, '0'),
  total: String(all.length).padStart(2, '0'),
}))
