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
}

let listening = false

export function trackPointer() {
  if (listening) return () => {}
  listening = true
  const onMove = (e) => {
    interaction.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    interaction.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
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
