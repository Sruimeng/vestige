/**
 * Pixel Material
 * @description 复古像素艺术材质 - 纯材质方案，无后处理
 * @features 色彩量化 | Bayer 抖动 | 4色调色板 | 屏幕空间抖动
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // 将法线转换到世界空间，以配合世界光照方向
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLightDirection;
  uniform float uDitherScale;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  varying vec3 vNormal;
  varying vec2 vUv;

  // --- 核心：有序抖动矩阵 (Bayer Matrix 4x4) ---
  // 经典抖动图案，用于模拟复古游戏的阴影过渡
  float dither4x4(vec2 position, float brightness) {
    int x = int(mod(position.x, 4.0));
    int y = int(mod(position.y, 4.0));
    int index = x + y * 4;
    float limit = 0.0;

    // Bayer 4x4 矩阵阈值
    if (index == 0) limit = 0.0625;
    else if (index == 1) limit = 0.5625;
    else if (index == 2) limit = 0.1875;
    else if (index == 3) limit = 0.6875;
    else if (index == 4) limit = 0.8125;
    else if (index == 5) limit = 0.3125;
    else if (index == 6) limit = 0.9375;
    else if (index == 7) limit = 0.4375;
    else if (index == 8) limit = 0.25;
    else if (index == 9) limit = 0.75;
    else if (index == 10) limit = 0.125;
    else if (index == 11) limit = 0.625;
    else if (index == 12) limit = 1.0;
    else if (index == 13) limit = 0.5;
    else if (index == 14) limit = 0.875;
    else if (index == 15) limit = 0.375;

    // 如果亮度低于阈值，则返回0（产生黑点），否则返回1
    return brightness < limit ? 0.0 : 1.0;
  }

  void main() {
    vec3 normal = normalize(vNormal);

    // 1. 计算基础光照 (Lambert)
    // 范围从 -1 到 1，映射到 0.0 到 1.0
    float lightIntensity = dot(normal, uLightDirection) * 0.5 + 0.5;

    // 2. 屏幕空间抖动
    // 使用 gl_FragCoord (屏幕像素坐标) 来确保抖动图案贴在屏幕上
    // 这能制造出"像素点是静止的"复古感
    vec2 screenPos = gl_FragCoord.xy * uDitherScale;

    // 将抖动应用到光照强度上
    // 技巧：在量化前，把光照强度根据抖动图案进行微调
    float ditheredLight = lightIntensity + (dither4x4(screenPos, lightIntensity) - 0.5) * 0.2;

    // 3. 色彩量化 (强制分成 4 个等级)
    float steps = 4.0;
    float quantizedLight = floor(ditheredLight * steps) / (steps - 1.0);
    // 确保范围在 0-1
    quantizedLight = clamp(quantizedLight, 0.0, 1.0);

    // 4. 映射到调色板
    vec3 finalColor;
    if (quantizedLight < 0.25) {
      finalColor = uColor0;
    } else if (quantizedLight < 0.5) {
      finalColor = uColor1;
    } else if (quantizedLight < 0.75) {
      finalColor = uColor2;
    } else {
      finalColor = uColor3;
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface PixelMaterialProps {
  /** 最暗阴影色 */
  color0?: string;
  /** 中间调阴影色 */
  color1?: string;
  /** 主体亮色 */
  color2?: string;
  /** 高光色 */
  color3?: string;
  /** 抖动缩放 (1.0=细腻, 0.5=粗糙) */
  ditherScale?: number;
}

export const PixelMaterial = forwardRef<THREE.ShaderMaterial, PixelMaterialProps>(
  function PixelMaterial(
    {
      // 参考图 Game Boy 风格调色板 - 高对比度灰绿色系
      color0 = '#1a1a1a', // 最暗阴影 (接近纯黑)
      color1 = '#4a5a4a', // 中间调阴影 (橄榄绿)
      color2 = '#8a9a88', // 主体亮色 (灰绿)
      color3 = '#c8d8c0', // 高光 (浅米绿)
      ditherScale = 1.0,
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
      () => ({
        uLightDirection: { value: new THREE.Vector3(0.5, 1.0, 1.0).normalize() },
        uDitherScale: { value: ditherScale },
        uColor0: { value: new THREE.Color(color0) },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
      }),
      [color0, color1, color2, color3, ditherScale]
    );

    useFrame(() => {
      // 可在此处添加动态效果（如光照方向变化）
    });

    useImperativeHandle(ref, () => materialRef.current!, []);

    return (
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    );
  }
);
