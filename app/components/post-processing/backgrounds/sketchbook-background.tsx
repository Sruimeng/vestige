/**
 * Sketchbook Background
 * @description 素描本背景 - 米黄纸张 + 铅笔排线纹理 + 手绘质感
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
  uniform vec3 pencilColor;
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

    // 纸张纤维纹理
    float paperNoise = noise(uv * 400.0) * 0.06;
    color -= paperNoise;

    // 大块斑点（老化效果）
    float stain = noise(uv * 6.0 + 5.0);
    stain = smoothstep(0.55, 0.75, stain) * 0.04;
    color -= stain;

    // ========== 铅笔排线背景纹理 ==========
    vec2 st = gl_FragCoord.xy / 400.0 * 4.0;

    // 斜线排线 (////) - 非常淡
    float hatch1 = clamp(sin((st.x + st.y) * 30.0) * 8.0 - 6.0, 0.0, 1.0);

    // 反向斜线 (\\\\) - 更淡
    float hatch2 = clamp(sin((st.x - st.y) * 25.0) * 8.0 - 6.5, 0.0, 1.0);

    // 随机控制排线出现区域（模拟手绘不均匀）
    float hatchMask = noise(uv * 3.0);
    hatchMask = smoothstep(0.3, 0.7, hatchMask);

    // 边缘区域排线更密集
    float edgeDist = length((uv - 0.5) * 2.0);
    float edgeMask = smoothstep(0.5, 1.2, edgeDist);

    // 组合排线
    float hatchPattern = hatch1 * 0.08 * hatchMask;
    hatchPattern += hatch2 * 0.05 * (1.0 - hatchMask);
    hatchPattern *= (0.3 + edgeMask * 0.7); // 边缘更明显

    // 应用排线
    color = mix(color, pencilColor, hatchPattern);

    // ========== 折痕效果 ==========
    float crease1 = 1.0 - smoothstep(0.0, 0.008, abs(uv.x - 0.5));
    float crease2 = 1.0 - smoothstep(0.0, 0.008, abs(uv.y - 0.5));
    float creases = max(crease1, crease2) * 0.03;
    color -= creases;

    // ========== 边缘渐暗 ==========
    float vignette = 1.0 - length((uv - 0.5) * 1.3);
    vignette = smoothstep(0.0, 0.6, vignette);
    vignette = mix(0.88, 1.0, vignette);
    color *= vignette;

    // ========== 细微颗粒 ==========
    float grain = random(uv * resolution + time * 0.05) * 0.025;
    color -= grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface SketchbookBackgroundProps {
  paperColor?: string;
  pencilColor?: string;
}

export function SketchbookBackground({
  paperColor = '#f5f3eb',
  pencilColor = '#2a2a2a',
}: SketchbookBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      paperColor: { value: new THREE.Color(paperColor) },
      pencilColor: { value: new THREE.Color(pencilColor) },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    [paperColor, pencilColor]
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
