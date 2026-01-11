/**
 * Matrix Rain Background
 * @description 黑客帝国数字雨背景组件 - 真正的数字字形渲染
 * @features 全屏数字雨 | 多层深度 | 7段数字显示 | 扫描线
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // 直接输出屏幕空间坐标，确保全屏覆盖
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform vec3 rainColor;
  uniform float speed;
  uniform float density;
  uniform vec2 resolution;

  varying vec2 vUv;

  // 伪随机函数
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // === 7段显示器数字渲染 ===
  float segment(vec2 uv, vec2 p1, vec2 p2, float w) {
    vec2 d = p2 - p1;
    float l = length(d);
    d /= l;
    vec2 q = uv - p1;
    float t = clamp(dot(q, d), 0.0, l);
    vec2 closest = p1 + d * t;
    return smoothstep(w, w * 0.3, length(uv - closest));
  }

  float digit(int n, vec2 uv) {
    float w = 0.1;
    float result = 0.0;

    uv = uv * 1.4 - 0.2;

    vec2 p0a = vec2(0.2, 0.9), p0b = vec2(0.8, 0.9);
    vec2 p1a = vec2(0.15, 0.55), p1b = vec2(0.15, 0.85);
    vec2 p2a = vec2(0.85, 0.55), p2b = vec2(0.85, 0.85);
    vec2 p3a = vec2(0.2, 0.5), p3b = vec2(0.8, 0.5);
    vec2 p4a = vec2(0.15, 0.15), p4b = vec2(0.15, 0.45);
    vec2 p5a = vec2(0.85, 0.15), p5b = vec2(0.85, 0.45);
    vec2 p6a = vec2(0.2, 0.1), p6b = vec2(0.8, 0.1);

    if (n == 0) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    } else if (n == 1) {
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p5a, p5b, w);
    } else if (n == 2) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p6a, p6b, w);
    } else if (n == 3) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    } else if (n == 4) {
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
    } else if (n == 5) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    } else if (n == 6) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    } else if (n == 7) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p5a, p5b, w);
    } else if (n == 8) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p4a, p4b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    } else if (n == 9) {
      result += segment(uv, p0a, p0b, w);
      result += segment(uv, p1a, p1b, w);
      result += segment(uv, p2a, p2b, w);
      result += segment(uv, p3a, p3b, w);
      result += segment(uv, p5a, p5b, w);
      result += segment(uv, p6a, p6b, w);
    }

    return clamp(result, 0.0, 1.0);
  }

  // 单列数字雨
  float digitalRain(vec2 uv, float columnDensity, float fallSpeed, float layerOffset) {
    // 修正宽高比
    float aspect = resolution.x / resolution.y;
    vec2 aspectUV = vec2(uv.x * aspect, uv.y);

    // 列索引
    float column = floor(aspectUV.x * columnDensity);

    // 每列随机偏移
    float columnRandom = random(vec2(column + layerOffset, 0.0));

    // 下落位置 - 降低速度
    float fallPos = uv.y + time * fallSpeed * (0.2 + columnRandom * 0.3) + columnRandom * 10.0;

    // 字符格子 (高度比宽度大)
    float cellHeight = columnDensity * 0.6;
    float cell = floor(fallPos * cellHeight);

    // 字符是否显示
    float charVisible = step(0.3, random(vec2(column + layerOffset, cell)));

    // 拖尾渐变
    float trail = fract(fallPos * cellHeight);
    trail = pow(trail, 2.5);

    // 头部高亮
    float head = smoothstep(0.8, 1.0, trail) * 3.0;

    // 字符 UV
    vec2 cellUV = fract(vec2(
      aspectUV.x * columnDensity,
      fallPos * cellHeight
    ));

    // 选择数字 0-9
    float charSeed = random(vec2(column + layerOffset, cell));
    int digitValue = int(mod(charSeed * 10.0 + floor(time * 1.5), 10.0));

    // 渲染数字
    float charShape = digit(digitValue, cellUV);

    return charVisible * (trail + head) * charShape;
  }

  void main() {
    // === 多层数字雨 ===

    // 远景层（大、慢、暗）
    float farLayer = digitalRain(vUv, density * 0.4, speed * 0.15, 0.0) * 0.15;

    // 中景层
    float midLayer = digitalRain(vUv, density * 0.7, speed * 0.25, 100.0) * 0.35;

    // 近景层（密、快、亮）
    float nearLayer = digitalRain(vUv, density, speed * 0.4, 200.0) * 0.65;

    // 合并所有层
    float rain = farLayer + midLayer + nearLayer;

    // === 扫描线 ===
    float scanline = sin(vUv.y * 400.0) * 0.08 + 0.92;

    // === 轻微边缘渐暗（保持大部分区域可见）===
    float vignette = 1.0 - length((vUv - 0.5) * 0.8);
    vignette = smoothstep(0.0, 0.8, vignette);
    vignette = mix(0.6, 1.0, vignette); // 最暗处也保持60%亮度

    // === CRT 效果 ===
    float crt = sin(vUv.y * 600.0) * 0.015 + 0.985;

    // === 最终合成 ===
    vec3 color = rainColor * rain * vignette * scanline * crt;

    // 背景微光
    color += rainColor * 0.008;

    // 透明度
    float alpha = rain * 0.85 + 0.03;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface MatrixRainBackgroundProps {
  rainColor?: string;
  speed?: number;
  density?: number;
}

export function MatrixRainBackground({
  rainColor = '#00FF00',  // matrix green
  speed = 1.0, // 降低默认速度
  density = 25.0,
}: MatrixRainBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      rainColor: { value: new THREE.Color(rainColor) },
      speed: { value: speed },
      density: { value: density },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    [rainColor, speed, density]
  );

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
      // 更新分辨率以处理窗口大小变化
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
        transparent={true}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
