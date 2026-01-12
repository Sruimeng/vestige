/**
 * ASCII Material - Matrix Hacker Style
 * @description 黑客帝国数字雨材质 - 真正的数字字形渲染
 * @features 程序化数字0-9 | 世界坐标数字雨 | 边缘发光 | 拖尾渐变
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform vec3 codeColor;
  uniform float speed;
  uniform float density;
  uniform float rimIntensity;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // 伪随机函数
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // === 程序化数字 SDF ===
  // 7段显示器风格的数字渲染
  // 每个数字由7个线段组成：
  //   _0_
  //  |1 |2
  //   _3_
  //  |4 |5
  //   _6_

  float segment(vec2 uv, vec2 p1, vec2 p2, float w) {
    vec2 d = p2 - p1;
    float l = length(d);
    d /= l;
    vec2 q = uv - p1;
    float t = clamp(dot(q, d), 0.0, l);
    vec2 closest = p1 + d * t;
    return smoothstep(w, w * 0.5, length(uv - closest));
  }

  float digit(int n, vec2 uv) {
    float w = 0.08; // 线段宽度
    float result = 0.0;

    // 归一化到 0-1 范围，留边距
    uv = uv * 1.4 - 0.2;

    // 7段定义
    vec2 p0a = vec2(0.2, 0.9), p0b = vec2(0.8, 0.9); // 顶部横线
    vec2 p1a = vec2(0.15, 0.55), p1b = vec2(0.15, 0.85); // 左上竖线
    vec2 p2a = vec2(0.85, 0.55), p2b = vec2(0.85, 0.85); // 右上竖线
    vec2 p3a = vec2(0.2, 0.5), p3b = vec2(0.8, 0.5); // 中间横线
    vec2 p4a = vec2(0.15, 0.15), p4b = vec2(0.15, 0.45); // 左下竖线
    vec2 p5a = vec2(0.85, 0.15), p5b = vec2(0.85, 0.45); // 右下竖线
    vec2 p6a = vec2(0.2, 0.1), p6b = vec2(0.8, 0.1); // 底部横线

    // 根据数字选择显示哪些段
    // 0: 0,1,2,4,5,6
    if (n == 0) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }
    // 1: 2,5
    else if (n == 1) {
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p5a, p5b, w);
    }
    // 2: 0,2,3,4,6
    else if (n == 2) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p6a, p6b, w);
    }
    // 3: 0,2,3,5,6
    else if (n == 3) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }
    // 4: 1,2,3,5
    else if (n == 4) {
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
    }
    // 5: 0,1,3,5,6
    else if (n == 5) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }
    // 6: 0,1,3,4,5,6
    else if (n == 6) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }
    // 7: 0,2,5
    else if (n == 7) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p5a, p5b, w);
    }
    // 8: 全部
    else if (n == 8) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }
    // 9: 0,1,2,3,5,6
    else if (n == 9) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }

    return clamp(result, 0.0, 1.0);
  }

  void main() {
    // === 1. 坐标网格化 (世界空间) ===
    float cellSize = 1.0 / density;
    vec2 grid = vec2(
      floor(vWorldPosition.x * density),
      floor(vWorldPosition.y * density * 0.6) // 字符高度比宽度大
    );

    // 考虑 Z 轴
    float zGrid = floor(vWorldPosition.z * density);

    // === 2. 数字雨流动 ===
    float columnOffset = random(vec2(grid.x + zGrid, 0.0));
    float rainPos = vWorldPosition.y * 0.3 + time * speed * (0.3 + columnOffset * 0.4);

    // === 3. 字符选择 ===
    float cell = floor(rainPos * density * 0.6);
    float charSeed = random(vec2(grid.x + zGrid, cell));

    // 选择数字 0-9
    int digitValue = int(mod(charSeed * 10.0 + floor(time * 2.0), 10.0));

    // 是否显示此字符
    float charVisible = step(0.35, random(vec2(grid.x + zGrid, cell + 0.5)));

    // === 4. 拖尾渐变 ===
    float trail = fract(rainPos * density * 0.6);
    trail = pow(trail, 2.0);

    // === 5. 渲染数字 ===
    vec2 cellUV = fract(vec2(
      vWorldPosition.x * density,
      vWorldPosition.y * density * 0.6
    ));

    float charShape = digit(digitValue, cellUV);

    // === 6. 边缘发光 ===
    vec3 viewDir = normalize(vViewPosition);
    float rim = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
    rim *= rimIntensity;

    // === 7. 扫描线 ===
    float scanline = sin(vWorldPosition.y * 60.0) * 0.1 + 0.9;

    // === 8. 头部高亮 ===
    float headGlow = smoothstep(0.75, 1.0, trail) * charVisible * 2.5;

    // === 最终合成 ===
    float codeIntensity = charVisible * trail * charShape;

    vec3 finalColor = codeColor * (codeIntensity + rim * 0.5 + headGlow * charShape);
    finalColor *= scanline;

    // 环境光
    finalColor += codeColor * 0.015;

    float alpha = codeIntensity * 0.95 + rim * 0.4 + 0.08;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface ASCIIMaterialProps {
  codeColor?: string;
  speed?: number;
  density?: number;
  rimIntensity?: number;
}

export const ASCIIMaterial = forwardRef<THREE.ShaderMaterial, ASCIIMaterialProps>(
  function ASCIIMaterial(
    {
      codeColor = '#00FF00',  // matrix green
      speed = 0.5, // 降低默认速度
      density = 10.0,
      rimIntensity = 1.2,
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
      () => ({
        time: { value: 0 },
        codeColor: { value: new THREE.Color(codeColor) },
        speed: { value: speed },
        density: { value: density },
        rimIntensity: { value: rimIntensity },
      }),
      [codeColor, speed, density, rimIntensity]
    );

    useFrame((_, delta) => {
      if (materialRef.current) {
        materialRef.current.uniforms.time.value += delta;
      }
    });

    useImperativeHandle(ref, () => materialRef.current!, []);

    return (
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    );
  }
);
