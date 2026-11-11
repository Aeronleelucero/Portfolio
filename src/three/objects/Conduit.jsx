import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, CylinderGeometry, ShaderMaterial, TorusGeometry, TubeGeometry, UniformsLib, UniformsUtils } from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { conduitCurve, curveParamNear, WORLD } from '../worldLayout'
import { chrome, createSignalMaterial, darkMetal, PALETTE } from '../materials'
import { runtime } from '../runtime'

/**
 * Where the conduit begins: a small socket beneath the Digital Core, so the
 * glowing line visibly emerges from the sculpture's base instead of floating.
 */
function ConduitPort() {
  const parts = useMemo(
    () => ({
      socket: new CylinderGeometry(0.34, 0.4, 0.1, 40),
      rim: new TorusGeometry(0.36, 0.014, 8, 64),
      signal: new TorusGeometry(0.22, 0.012, 8, 48),
      glow: createSignalMaterial(1.8),
    }),
    [],
  )
  return (
    <group position={WORLD.corePort}>
      <mesh geometry={parts.socket} material={darkMetal} position={[0, -0.05, 0]} />
      <mesh geometry={parts.rim} material={chrome} rotation-x={Math.PI / 2} />
      <mesh geometry={parts.signal} material={parts.glow} position={[0, 0.012, 0]} rotation-x={Math.PI / 2} />
    </group>
  )
}

// Arc-length range of the curve that lies on the Education rail. The rail's own
// progress strip is the journey line there, so the conduit is masked out
// instead of doubling up and running through the gates.
const edu = WORLD.education
const RAIL_GAP = [
  curveParamNear([edu.railX, edu.railY, edu.yearZ(2019)]),
  curveParamNear([edu.railX, edu.railY, edu.yearZ(2026)]),
]

/**
 * The "data conduit" — a fine line connecting every station of the journey.
 * The traveled part glows a muted violet → magenta with soft pulses; the road
 * ahead is a faint plum thread. It respects scene fog, fades out near the
 * camera (so it never becomes a foreground stroke), and its overall opacity is
 * set per section by the scene timeline.
 */
export default function Conduit({ segments = 900 }) {
  const geometry = useMemo(() => new TubeGeometry(conduitCurve, segments, 0.012, 6, false), [segments])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        fog: true,
        uniforms: UniformsUtils.merge([
          UniformsLib.fog,
          {
            uProgress: { value: 0 },
            uOpacity: { value: 1 },
            uTime: { value: 0 },
            uGap: { value: RAIL_GAP },
            uBase: { value: new Color('#3a2f4f') },
            uLitA: { value: new Color(PALETTE.violet) },
            uLitB: { value: new Color(PALETTE.accent) },
            uHead: { value: new Color('#d9a6e2') },
          },
        ]),
        vertexShader: /* glsl */ `
          #include <fog_pars_vertex>
          varying float vU;
          varying float vCamDist;
          void main() {
            vU = uv.x;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vCamDist = length(wp.xyz - cameraPosition);
            vec4 mvPosition = viewMatrix * wp;
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }
        `,
        fragmentShader: /* glsl */ `
          #include <fog_pars_fragment>
          uniform float uProgress;
          uniform float uOpacity;
          uniform float uTime;
          uniform float uGap[2];
          uniform vec3 uBase;
          uniform vec3 uLitA;
          uniform vec3 uLitB;
          uniform vec3 uHead;
          varying float vU;
          varying float vCamDist;
          void main() {
            float lit = 1.0 - smoothstep(uProgress - 0.002, uProgress + 0.002, vU);
            float head = 1.0 - smoothstep(0.0, 0.006, abs(vU - uProgress));
            float pulse = smoothstep(0.93, 1.0, fract(vU * 120.0 - uTime * 0.4)) * lit;
            vec3 litCol = mix(uLitA, uLitB, smoothstep(0.0, 1.0, vU)) * 0.62;
            vec3 col = mix(uBase, litCol, lit) + uLitB * pulse * 0.35 + uHead * head * 0.6;

            float alpha = mix(0.32, 0.85, lit) * uOpacity;
            // Never a thick foreground stroke: fade out close to the camera.
            alpha *= smoothstep(3.0, 7.0, vCamDist);
            // Hidden along the Education rail (the rail's strip is the line there).
            alpha *= 1.0 - smoothstep(uGap[0] - 0.004, uGap[0], vU) * (1.0 - smoothstep(uGap[1], uGap[1] + 0.004, vU));
            if (alpha < 0.003) discard;

            gl_FragColor = vec4(col, alpha);
            #include <fog_fragment>
            #ifdef USE_FOG
              gl_FragColor.a *= 1.0 - fogFactor; // fade with distance, not just darken
            #endif
          }
        `,
      }),
    [],
  )

  useFrame((_, delta) => {
    material.uniforms.uProgress.value = sceneState.conduitProgress
    material.uniforms.uOpacity.value = sceneState.conduitOpacity
    material.uniforms.uTime.value += Math.min(delta, 0.1) * runtime.motion
  })

  return (
    <>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      <ConduitPort />
    </>
  )
}
