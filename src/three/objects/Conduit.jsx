import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, CylinderGeometry, ShaderMaterial, TorusGeometry, TubeGeometry } from 'three'
import { sceneState } from '../../animations/sceneTimeline'
import { conduitCurve, WORLD } from '../worldLayout'
import { chrome, createSignalMaterial, darkMetal, PALETTE } from '../materials'
import { runtime } from '../runtime'

/**
 * Where the conduit begins: a small socket beneath the Digital Core, so the
 * red line visibly emerges from the sculpture's base instead of floating.
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

/**
 * The "data conduit" — a thin line threading every station of the journey.
 * The traveled part glows red with pulses flowing forward; the road ahead
 * stays a quiet graphite line. Progress is scroll-driven.
 */
export default function Conduit({ segments = 900 }) {
  const geometry = useMemo(() => new TubeGeometry(conduitCurve, segments, 0.02, 6, false), [segments])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uBase: { value: new Color('#32363f') },
          uLit: { value: new Color(PALETTE.accent) },
          uHead: { value: new Color('#ff6b5e') },
        },
        vertexShader: /* glsl */ `
          varying float vU;
          varying vec3 vWorld;
          void main() {
            vU = uv.x;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uProgress;
          uniform float uTime;
          uniform vec3 uBase;
          uniform vec3 uLit;
          uniform vec3 uHead;
          varying float vU;
          varying vec3 vWorld;
          void main() {
            float lit = 1.0 - smoothstep(uProgress - 0.002, uProgress + 0.002, vU);
            float head = 1.0 - smoothstep(0.0, 0.01, abs(vU - uProgress));
            float pulse = smoothstep(0.9, 1.0, fract(vU * 140.0 - uTime * 0.5)) * lit;
            vec3 col = mix(uBase, uLit * 0.75, lit) + uLit * pulse * 0.9 + uHead * head * 1.4;
            float d = length(vWorld - cameraPosition);
            float alpha = mix(0.55, 1.0, lit) * (1.0 - smoothstep(40.0, 140.0, d) * 0.8);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [],
  )

  useFrame((_, delta) => {
    material.uniforms.uProgress.value = sceneState.conduitProgress
    material.uniforms.uTime.value += Math.min(delta, 0.1) * runtime.motion
  })

  return (
    <>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      <ConduitPort />
    </>
  )
}
