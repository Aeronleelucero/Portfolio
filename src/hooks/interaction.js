/**
 * Shared interaction state between HTML and the 3D scene.
 *
 * HTML components write to it (hovering a skill category, pointer position);
 * 3D components read it inside `useFrame`. It is a plain mutable object so
 * that pointer movement never causes React re-renders.
 */
export const interaction = {
  pointer: { x: 0, y: 0 }, // normalized -1..1
  activeSkill: null, // skill category id or null
  activeProject: null, // project id or null
  activeRecognition: null, // recognition record id or null (exhibition focus)
  pointerOverUI: false, // true while the pointer is over readable/interactive HTML
  pointerType: 'mouse', // last pointer type: 'mouse' | 'touch' | 'pen'
  coreUnfolded: false, // Digital Core unfold state (click / tap / HUD button)
}

/**
 * HTML the 3D scene must never react "through": panels, controls, navigation
 * and dialogs. The canvas sits behind the page, so 3D hit-testing uses the
 * window pointer and skips these targets.
 */
export const UI_SELECTOR =
  '.panel, a, button, input, textarea, select, label, dialog, [role="dialog"], .nav, .rail, .hero__content, .footer'

export const isOverUI = (target) => Boolean(target?.closest?.(UI_SELECTOR))

const listeners = new Set()
/** Subscribe to Digital Core unfold changes (for HTML that mirrors the state). */
export const onCoreUnfoldChange = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const setCoreUnfolded = (value) => {
  if (interaction.coreUnfolded === value) return
  interaction.coreUnfolded = value
  listeners.forEach((fn) => fn(value))
}
export const toggleCoreUnfolded = () => setCoreUnfolded(!interaction.coreUnfolded)

let listening = false

export function trackPointer() {
  if (listening) return () => {}
  listening = true
  const onMove = (e) => {
    interaction.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    interaction.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    interaction.pointerOverUI = isOverUI(e.target)
    interaction.pointerType = e.pointerType || 'mouse'
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => {
    listening = false
    window.removeEventListener('pointermove', onMove)
  }
}

export const setActiveSkill = (id) => {
  interaction.activeSkill = id
}

export const setActiveProject = (id) => {
  interaction.activeProject = id
}

export const setActiveRecognition = (id) => {
  interaction.activeRecognition = id
}
