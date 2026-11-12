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
  // Digital Core open state. Scroll opens it automatically at About (coreAuto);
  // a click / tap / HUD press sets a manual override that lasts until the
  // visitor scrolls to another section. coreUnfolded = the effective state.
  coreAuto: false,
  coreOverride: null, // null | true | false
  coreUnfolded: false,
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
const syncCoreUnfolded = () => {
  const value = interaction.coreOverride ?? interaction.coreAuto
  if (interaction.coreUnfolded === value) return
  interaction.coreUnfolded = value
  listeners.forEach((fn) => fn(value))
}
/** Scroll-driven state (set by the 3D scene when crossing the About threshold). */
export const setCoreAuto = (value) => {
  if (interaction.coreAuto === value) return
  interaction.coreAuto = value
  syncCoreUnfolded()
}
/** Manual toggle: flips whatever the visitor currently sees. */
export const toggleCoreUnfolded = () => {
  interaction.coreOverride = !interaction.coreUnfolded
  syncCoreUnfolded()
}
/** Return to scroll-controlled mode (called when the visitor changes section). */
export const clearCoreOverride = () => {
  if (interaction.coreOverride === null) return
  interaction.coreOverride = null
  syncCoreUnfolded()
}

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

/*
 * Pause the portfolio's own WebGL rendering (e.g. while a full-screen live
 * site such as Aqua is open), so two heavy WebGL scenes never run at once.
 */
const sceneListeners = new Set()
let sceneSuspended = false
export const isSceneSuspended = () => sceneSuspended
export const onSceneSuspendChange = (fn) => {
  sceneListeners.add(fn)
  return () => sceneListeners.delete(fn)
}
export const setSceneSuspended = (value) => {
  if (sceneSuspended === value) return
  sceneSuspended = value
  sceneListeners.forEach((fn) => fn(value))
}
