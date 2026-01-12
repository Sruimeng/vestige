/**
 * Halftone Material
 * @description 复古报纸半色调材质 - 屏幕空间网点渲染
 * @features 屏幕空间半色调 | 45度旋转网格 | 旧纸张质感 | 光照驱动网点大小
 */

import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec4 vScreenPos;

  void main() {
    // 转换法线到世界空间
    vNormal = normalize(normalMatrix * normal);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 传递屏幕空间位置
    vScreenPos = gl_Position;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2 uResolution;
  uniform float uScale;
  uniform float uAngle;
  uniform vec3 uPaperColor;
  uniform vec3 uInkColor;
  uniform vec3 uLightDirection;

  varying vec3 vNormal;
  varying vec4 vScreenPos;

  // 2D 旋转矩阵
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));
  }

  void main() {
    // 1. 计算基础光照 (Lambert)
    float lightness = dot(vNormal, uLightDirection);
    lightness = clamp(lightness * 0.5 + 0.5, 0.0, 1.0);

    // 2. 生成半色调网格 (Halftone Pattern) - 屏幕空间
    // 使用 gl_FragCoord 获取屏幕像素坐标
    vec2 uv = gl_FragCoord.xy / uResolution.y;

    // 旋转网格 (45度左右模仿印刷工艺)
    uv = rotate2d(uAngle) * uv;

    // 生成正弦波网格
    vec2 grid = sin(uv * uScale);

    // 将 x 和 y 的波形结合，形成圆点图案
    float pattern = grid.x * grid.y;

    // 3. 核心逻辑：用光照强度决定点的大小
    float dotSize = lightness * 1.8 - 0.9;
    float ink = smoothstep(dotSize, dotSize + 0.1, pattern);

    // 4. 混合纸张和油墨
    vec3 finalColor = mix(uInkColor, uPaperColor, ink);

    // 5. 增加纸张噪点 (陈旧感)
    float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor *= (0.95 + 0.05 * noise);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface HalftoneMaterialProps {
  paperColor?: string;
  inkColor?: string;
  scale?: number;
  angle?: number;
}

export const HalftoneMaterial = forwardRef<THREE.ShaderMaterial, HalftoneMaterialProps>(
  function HalftoneMaterial(
    {
      paperColor = '#f4e4bc', // 旧纸张米黄色
      inkColor = '#1a1a1a',   // 深灰油墨
      scale = 800.0,          // 网点密度（越大点越小）
      angle = 0.785,          // 45度 (π/4)
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { size } = useThree();

    const uniforms = useMemo(
      () => ({
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uScale: { value: scale },
        uAngle: { value: angle },
        uPaperColor: { value: new THREE.Color(paperColor) },
        uInkColor: { value: new THREE.Color(inkColor) },
        uLightDirection: { value: new THREE.Vector3(1.0, 1.0, 1.0).normalize() },
      }),
      [paperColor, inkColor, scale, angle, size.width, size.height]
    );

    useFrame((state) => {
      if (materialRef.current) {
        // 更新分辨率以处理窗口大小变化
        materialRef.current.uniforms.uResolution.value.set(
          state.gl.domElement.width,
          state.gl.domElement.height
        );
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
      />
    );
  }
);
