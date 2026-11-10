# Portfolio — Aeron Lee Vincent Lucero

Professional portfolio of **Aeron Lee Vincent Lucero**, software developer and
Computer Science graduate. Built with React, Vite, Three.js, React Three Fiber,
Drei and GSAP ScrollTrigger.

The page is normal, semantic HTML. Behind it, one persistent WebGL canvas
holds a continuous world; scrolling flies the camera from station to station:

| Chapter | 3D station |
| --- | --- |
| 01 Introduction | **Digital Core**: faceted chrome shell, red heart, three orbital rings; leans toward the pointer |
| 02 About | Portrait and introduction; the core splits open, rings spread |
| 03 Education | A rail of years with gates at 2020 / 2022 / 2026 that light up as you travel through time |
| 04 Expertise | A constellation: one node per category, one satellite per technology. Hover or select a category to bring it forward |
| 05 Projects | One plinth per project with a bespoke emblem: scanning voxel QR (QR Attendance), pose skeleton (HERD-VISION), inventory rack (PAWS4PALS), record cards (Student Information System), shopping cart (CarMaLuTao) |
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

## Editing the content

All content lives in `src/data/` and mirrors the CV
(`public/files/Aeron-Lucero-CV.pdf`). The portfolio, the 3D scene (number of
project stations, skill nodes, milestone nodes) and the printable resume all
read from there.

| File | Contents |
| --- | --- |
| `profile.js` | Name, headline, location, about, summary, photo, **contact links**, CV paths |
| `education.js` | Education records (chronological) |
| `skills.js` | Skill categories and technologies |
| `projects.js` | Projects, stacks and **GitHub / demo links** |
| `achievements.js` | Milestones, awards, competitions, experience |
| `herdVisionInference.js` | HERD-VISION overlay — **real model output only** (currently `null`) |

Fields set to `null` (GitHub, LinkedIn, project links) are **hidden** in the
UI. Fill them in with real, confirmed values only.

### Images

- `public/images/aeron-lucero.jpg` (+ `-480.jpg`): web portrait cropped from
  the camera original, which is kept out of the site in `source-assets/`.
- `public/images/herd-vision-cow.png`: HERD-VISION project image. Optional;
  the inference panel appears only once the file exists. Its bounding box /
  keypoint overlay is drawn only from `src/data/herdVisionInference.js`.
- The 3D HERD-VISION emblem is a stylized illustration of the project's
  13-keypoint pose schema, not model output.

## CV download and printable resume

- **Download CV**: `public/files/Aeron-Lucero-CV.pdf` is the real CV, linked from
  the hero, navigation, contact section, footer and resume page with
  `download="Aeron-Lucero-CV.pdf"`. Files in `public/` are copied to `dist/`
  as-is, so the link keeps working after deployment. Replace the file at the
  same path to update it. Its text must stay consistent with `src/data/`
  (the project bullets and summary are copied from it verbatim). The
  pre-edit original is kept in `source-assets/` (not deployed).
- **Printable resume**: `/resume.html` is generated from `src/data`, with a
  *Print Resume* button (print / save as PDF).

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
  data/         portfolio content (mirrors the CV)
  resume/       printable resume page
```

**How scroll drives the scene.** Elements marked `data-station` are scroll
stations. A single ScrollTrigger converts the scroll position into a
fractional station index (e.g. `4.3`). Each frame, `CameraController` damps
toward that value and scrubs two paused GSAP timelines (camera rig and scene
state) whose time equals the station index. 3D components read the animated
values in `useFrame`, so scrolling never triggers React re-renders.

Project and education stations are generated from the data files, so adding a
project in `projects.js` adds its 3D station automatically. For a new kind of
station, add a `data-station` element, then its id to `STATIONS` and a keyframe
in both `cameraTimeline.js` and `sceneTimeline.js`.

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
  toggles, `aria-current` chapter state, and a downloadable PDF CV plus print resume.

## Deployment

`npm run build` outputs a static site in `dist/` (two pages: `index.html` and
`resume.html`). Deploy it to any static host (Vercel, Netlify, GitHub Pages,
Cloudflare Pages).
