/**
 * Newspaper Background
 * @description 旧报纸风格背景 - 米黄纸张 + 噪点 + 折痕
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform vec3 paperColor;
  uniform vec2 resolution;

  varying vec2 vUv;

  // 噪声函数
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;

    // 基础纸张颜色
    vec3 color = paperColor;

    // 纸张纹理噪点
    float paperNoise = noise(uv * 300.0) * 0.08;
    color -= paperNoise;

    // 大块斑点（咖啡渍/老化）
    float stain = noise(uv * 8.0 + 10.0);
    stain = smoothstep(0.5, 0.7, stain) * 0.06;
    color -= stain;

    // 折痕效果
    float crease1 = smoothstep(0.0, 0.01, abs(uv.x - 0.33)) * smoothstep(0.0, 0.01, abs(uv.x - 0.33));
    float crease2 = smoothstep(0.0, 0.01, abs(uv.x - 0.66)) * smoothstep(0.0, 0.01, abs(uv.x - 0.66));
    float crease3 = smoothstep(0.0, 0.01, abs(uv.y - 0.5)) * smoothstep(0.0, 0.01, abs(uv.y - 0.5));
    float creases = (1.0 - crease1) * (1.0 - crease2) * (1.0 - crease3);
    color *= mix(0.95, 1.0, creases);

    // 边缘渐暗（旧纸边缘泛黄/变暗）
    float vignette = 1.0 - length((uv - 0.5) * 1.2);
    vignette = smoothstep(0.0, 0.7, vignette);
    vignette = mix(0.85, 1.0, vignette);
    color *= vignette;

    // 细微颗粒
    float grain = random(uv * resolution + time * 0.1) * 0.03;
    color -= grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface NewspaperBackgroundProps {
  paperColor?: string;
}

export function NewspaperBackground({
  paperColor = '#f4e4bc',
}: NewspaperBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      paperColor: { value: new THREE.Color(paperColor) },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    [paperColor]
  );

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
      materialRef.current.uniforms.resolution.value.set(
        state.gl.domElement.width,
        state.gl.domElement.height
      );
    }
  });

  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
