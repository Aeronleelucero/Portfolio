# AERON — Immersive 3D Interactive CV

A cinematic, scroll-driven 3D resume for **Aeron Lee Vincent Lucero**, built with
React, Vite, Three.js, React Three Fiber, Drei and GSAP ScrollTrigger.

The page is a normal, semantic HTML CV. Behind it, one persistent WebGL canvas
holds a continuous world; scrolling flies the camera from station to station:

| Chapter | 3D station |
| --- | --- |
| 01 Introduction | **Digital Core**: faceted chrome shell, red heart, three orbital rings; leans toward the pointer |
| 02 About | The core splits open, rings spread |
| 03 Education | A rail of years with gates at 2020 / 2022 / 2026 that light up as you travel through time |
| 04 Expertise | A constellation: one node per category, one satellite per technology. Hover or select a category to bring it forward |
| 05 Projects | Four plinths with bespoke emblems: pose skeleton (HERD-VISION), fanned ID cards (UnityCard), scanning voxel QR (QR Attendance), inventory rack (PAWS4PALS) |
| 06 Milestones | An ascending helix whose nodes light up in sequence |
| 07 Contact | The camera rewinds over the whole lit path back to the Digital Core |

A red "data conduit" threads every station and lights up behind you as you go.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve dist/
npm run lint
```

## Editing the CV content

All content lives in `src/data/`. Both the 3D CV and the printable resume read
from there.

| File | Contents |
| --- | --- |
| `profile.js` | Name, titles, tagline, about, summary, **contact links**, resume paths |
| `education.js` | Education records (chronological) |
| `skills.js` | Skill categories and technologies |
| `projects.js` | Projects, stacks and **GitHub / demo links** |
| `achievements.js` | Milestones, awards, competitions, experience |

Fields set to `null` (email, GitHub, LinkedIn, project links) are **hidden**
in the UI. Fill them in with real values only.

## Resume PDF

- `/resume.html` is a conventional, print-optimized resume generated from `src/data`.
- `public/resume/Aeron-Lucero-Resume.pdf` is the downloadable PDF behind the
  "Download Resume" buttons. Regenerate it after editing the data:

  ```bash
  npm run dev
  npx -y -p playwright@1 node scripts/generate-resume-pdf.mjs http://localhost:5173/resume.html
  ```

  Or open `/resume.html` and use **Print → Save as PDF**. To use your own
  official PDF instead, replace the file at the same path.

## Architecture

```
src/
  animations/   scrollConfig.js (stations + ScrollTrigger → station index),
                cameraTimeline.js (camera keyframes), sceneTimeline.js (lights, fog, reveals)
  three/        Scene.jsx (the single Canvas), Experience.jsx, CameraController.jsx,
                Environment.jsx (procedural env map, lights, fog), worldLayout.js,
                materials.js, objects/ (Digital Core, conduit, timeline, constellation,
                project emblems, tower, particles, grid)
  sections/     Hero, About, Education, Skills, Projects, Achievements, Contact
  components/   layout/ (nav, chapter rail, footer, fallbacks), ui/ (buttons, tags…)
  hooks/        device profile, reveal-on-scroll, active chapter, HTML↔3D interaction
  data/         CV content
  resume/       printable resume page
```

**How scroll drives the scene.** Elements marked `data-station` are scroll
stations. A single ScrollTrigger converts the scroll position into a
fractional station index (e.g. `4.3`). Each frame, `CameraController` damps
toward that value and scrubs two paused GSAP timelines (camera rig and scene
state) whose time equals the station index. 3D components read the animated
values in `useFrame`, so scrolling never triggers React re-renders.

To add a station: add a `data-station` element, then add its id to `STATIONS`
and a keyframe in both `cameraTimeline.js` and `sceneTimeline.js`.

## Performance and accessibility

- One WebGL renderer for the whole page; the 3D bundle is code-split and loads
  after the content.
- Adaptive quality: particle counts, DPR and antialiasing scale with device
  tier, and `PerformanceMonitor` drops DPR if the frame rate falls.
- No HDR downloads: reflections come from a procedural Lightformer environment.
- `prefers-reduced-motion`: idle motion, parallax and reveals are disabled,
  and the canvas renders on demand only.
- No WebGL2, or a GPU error: a static CSS backdrop is shown instead, and all
  content stays fully usable.
- Semantic landmarks, skip link, keyboard-accessible navigation and skill
  toggles, `aria-current` chapter state, and a PDF / print resume.

## Deployment

`npm run build` outputs a static site in `dist/` (two pages: `index.html` and
`resume.html`). Deploy it to any static host (Vercel, Netlify, GitHub Pages,
Cloudflare Pages).
# Portfolio
