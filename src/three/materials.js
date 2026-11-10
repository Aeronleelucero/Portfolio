import {
  AdditiveBlending,
  Color,
  LineBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
} from 'three'

/**
 * Shared materials. Re-using instances keeps the number of shader programs
 * and GPU state switches low across the whole scene.
 */
export const PALETTE = {
  bg: '#08090B',
  surface: '#111318',
  text: '#F5F5F5',
  muted: '#92959E',
  accent: '#C62828',
  border: '#272A30',
}

export const accentColor = new Color(PALETTE.accent)

export const chrome = new MeshStandardMaterial({
  color: '#e2e5ec',
  metalness: 1,
  roughness: 0.22,
  envMapIntensity: 1.2,
})

export const satinMetal = new MeshStandardMaterial({
  color: '#9ea3ad',
  metalness: 1,
  roughness: 0.38,
  envMapIntensity: 1,
})

export const darkMetal = new MeshStandardMaterial({
  color: '#2c2f36',
  metalness: 0.9,
  roughness: 0.42,
  envMapIntensity: 0.8,
})

/** Fake glass: reflective clearcoat without the cost of a transmission pass. */
export const glass = new MeshPhysicalMaterial({
  color: '#aab4c8',
  metalness: 0,
  roughness: 0.04,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  transparent: true,
  opacity: 0.1,
  envMapIntensity: 2.2,
  depthWrite: false,
})

export const accentGlow = new MeshStandardMaterial({
  color: '#160303',
  emissive: PALETTE.accent,
  emissiveIntensity: 2.2,
  roughness: 0.5,
  metalness: 0,
})

export const lineMuted = new LineBasicMaterial({
  color: '#3a3e47',
  transparent: true,
  opacity: 0.85,
})

export const lineAccent = new LineBasicMaterial({
  color: PALETTE.accent,
  transparent: true,
  opacity: 0.9,
})

/** Creates an accent material whose glow can be animated independently. */
export function createSignalMaterial(intensity = 0) {
  return new MeshStandardMaterial({
    color: '#1a1c21',
    emissive: PALETTE.accent,
    emissiveIntensity: intensity,
    metalness: 0.6,
    roughness: 0.35,
  })
}

/**
 * Soft round points that fade with distance from the camera.
 * Used for atmospheric particles and the Digital Core's local dust.
 */
export function createPointsMaterial({ size = 26, pixelRatio = 1, near = 0.6, far = 55 } = {}) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: pixelRatio },
      uNear: { value: near },
      uFar: { value: far },
      uBoxMin: { value: [0, 0, 0] },
      uBoxSize: { value: [0, 0, 0] },
      uWrap: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aSeed;
      attribute float aRed;
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uNear;
      uniform float uFar;
      uniform vec3 uBoxMin;
      uniform vec3 uBoxSize;
      uniform float uWrap;
      varying float vAlpha;
      varying float vRed;
      void main() {
        vec3 p = position;
        float s = aSeed * 6.2831;
        p.x += sin(uTime * 0.35 + s) * 0.35;
        p.z += cos(uTime * 0.28 + s * 1.7) * 0.35;
        if (uWrap > 0.5) {
          p.y = uBoxMin.y + mod(p.y - uBoxMin.y + uTime * (0.25 + aSeed * 0.35), uBoxSize.y);
        } else {
          p.y += sin(uTime * 0.5 + s * 2.3) * 0.2;
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = uSize * aSize * uPixelRatio / max(d, 0.1);
        vAlpha = smoothstep(uNear, uNear + 2.5, d) * (1.0 - smoothstep(uFar * 0.45, uFar, d));
        vRed = aRed;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      varying float vRed;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, r);
        vec3 col = mix(vec3(0.78, 0.8, 0.85), vec3(0.85, 0.16, 0.14), vRed);
        gl_FragColor = vec4(col, a * vAlpha * 0.7);
      }
    `,
  })
}
