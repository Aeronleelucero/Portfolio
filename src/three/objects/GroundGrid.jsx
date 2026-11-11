import { useMemo } from 'react'
import { ShaderMaterial } from 'three'

/**
 * Infinite-feeling floor grid that fades out around the camera, giving the
 * void a sense of scale without adding visual noise.
 */
export default function GroundGrid({ y = -4.4 }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vWorld;
          float grid(vec2 p, float size, float width) {
            vec2 c = p / size;
            vec2 g = abs(fract(c - 0.5) - 0.5) / (fwidth(c) * width);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }
          void main() {
            float minor = grid(vWorld.xz, 2.0, 1.0) * 0.35;
            float major = grid(vWorld.xz, 10.0, 1.4) * 0.7;
            float d = length(vWorld.xz - cameraPosition.xz);
            float fade = 1.0 - smoothstep(6.0, 42.0, d);
            float a = max(minor, major) * fade * 0.5;
            gl_FragColor = vec4(vec3(0.22, 0.19, 0.31), a);
          }
        `,
      }),
    [],
  )

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, y, -55]} material={material} frustumCulled={false}>
      <planeGeometry args={[260, 260]} />
    </mesh>
  )
}
