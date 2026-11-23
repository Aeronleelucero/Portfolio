/**
 * Projects (source: CV), in CV order. `highlights` are the CV bullets verbatim.
 *
 * - `links.github` / `links.demo`: `null` until real URLs exist — never invent them.
 * - `emblem`: the 3D visual in src/three/objects/emblems/.
 * - `media`: optional screenshot. `inference` holds overlay annotations and
 *   must come from REAL model output only (see herdVisionInference.js).
 * - `screenshot`: a real capture of a website (no live deployment), shown as a
 *   framed browser screenshot. `description`: optional extra paragraphs.
 * - `cvHighlights`: resume bullets when they differ from the card's `highlights`.
 * - `live`: a deployed site shown as a live iframe preview (hover) and in a
 *   near full-screen modal (click), shared by the featured live projects.
 * - `inResume: false`: shown in the portfolio but not on /resume.html (which
 *   mirrors the PDF CV).
 */
import { herdVisionInference } from './herdVisionInference'

export const projects = [
  {
    id: 'aqua',
    featured: true,
    inResume: false,
    title: 'Aqua',
    meta: 'Live WebGL experience',
    category: 'Interactive 3D Web Experience',
    summary:
      'An immersive underwater world featuring realistic animated fish, natural swimming behavior, and interactive exploration.',
    highlights: [],
    stack: ['React', 'Three.js', 'React Three Fiber', 'WebGL', 'GSAP'],
    emblem: 'portal',
    live: {
      url: 'https://aqua-theta-umber.vercel.app/',
      poster: '/images/projects/aqua-poster.webp', // a real frame of the live site
      title: 'Aqua — a living underwater world',
    },
    links: { github: null, demo: 'https://aqua-theta-umber.vercel.app/' },
  },
  {
    id: 'operation-blackout',
    featured: true,
    inResume: false,
    title: 'Operation Blackout',
    meta: 'Live multiplayer browser game',
    category: 'Interactive 3D Web Experience / Browser Game',
    summary:
      'An immersive, futuristic browser-based experience featuring an interactive command dashboard, real-time gameplay elements, and a visually engaging interface.',
    highlights: [],
    // Verified in the separate Operation-Blackout checkout and its deployed bundle.
    stack: ['JavaScript', 'Three.js', 'WebGL', 'WebRTC', 'PeerJS', 'Vite'],
    emblem: 'blackout',
    live: {
      url: 'https://operation-blackout-lake.vercel.app/',
      poster: '/images/projects/operation-blackout-poster.webp',
      title: 'Operation Blackout — enter the Foundry',
      kind: 'game',
      openHint: 'click to enter',
      pointerLock: true,
      allow: 'fullscreen; clipboard-write',
    },
    links: { github: null, demo: 'https://operation-blackout-lake.vercel.app/' },
  },
  {
    id: 'artikly',
    title: 'Artikly',
    subtitle: 'Full-Stack Blogging Platform',
    meta: 'React, Express.js & PostgreSQL',
    category: 'Full-Stack Development',
    summary:
      'A modern, responsive blogging platform built with React, Express.js, PostgreSQL, and Supabase.',
    // One-line description for /resume.html and the PDF CV.
    cvSummary: 'Modern, responsive full-stack blogging platform with a personalized writer dashboard.',
    description: [
      'Features a personalized dashboard where writers can create, edit, publish, and manage articles, monitor blog statistics, and customize their profiles.',
      'Developed secure authentication and authorization using bcrypt password hashing, HttpOnly session cookies, CSRF protection, and server-side ownership validation. Implemented PostgreSQL-backed rate limiting, HTTPS-aware security middleware, and production deployment configurations.',
      'Validated application functionality and security through 29 automated backend tests and 11 browser regression checks.',
    ],
    // Key features (portfolio card).
    highlights: [
      'Article creation, editing, publishing, and management',
      'Secure authentication and protected dashboard routes',
      'Personalized profiles and blog statistics',
      'Server-side authorization and article ownership protection',
      'Production-focused security and rate limiting',
      '29 backend tests and 11 browser checks',
    ],
    // Resume bullets (/resume.html and the PDF CV), condensed from the description.
    cvHighlights: [
      'Built a writer dashboard for creating, editing, publishing, and managing articles, with blog statistics and customizable profiles.',
      'Developed secure authentication and authorization using bcrypt password hashing, HttpOnly session cookies, CSRF protection, and server-side ownership validation.',
      'Implemented PostgreSQL-backed rate limiting, HTTPS-aware security middleware, and production deployment configurations with Nginx.',
      'Validated functionality and security through 29 automated backend tests and 11 browser regression checks.',
    ],
    stack: ['React', 'Vite', 'Express.js', 'PostgreSQL', 'Supabase', 'Nginx'],
    emblem: 'article',
    // A real capture of the running Artikly homepage (1440 × 900).
    screenshot: {
      src: '/images/projects/artikly.webp',
      width: 1440,
      height: 900,
      alt: 'Artikly homepage: the "Give Your Ideas a Voice" hero with article search, site stats, and article categories',
      label: 'Artikly · Homepage',
    },
    links: { github: null, demo: null },
  },
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
