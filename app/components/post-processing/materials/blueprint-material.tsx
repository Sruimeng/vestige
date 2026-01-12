/**
 * Blueprint Material
 * @description 工程蓝图材质 - 轮廓线方案
 * @features 菲涅尔轮廓 | 扫描线动画 | 透视效果
 *
 * 设计理念：
 * - 移除世界坐标网格，避免远距离时线条密集
 * - 使用菲涅尔效应绘制模型边缘轮廓
 * - 保留扫描线作为工程模式特色
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec3 vViewNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vViewNormal = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform vec3 primaryColor;
  uniform vec3 secondaryColor;
  uniform float scanSpeed;
  uniform float edgeIntensity;
  uniform float fillOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec3 vViewNormal;

  void main() {
    // === 1. 菲涅尔轮廓线 (基于视角) ===
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vViewNormal));

    // 增强边缘，创建清晰轮廓
    float edge = pow(fresnel, 2.0);
    float sharpEdge = smoothstep(0.3, 0.7, edge);

    // === 2. 扫描线动画 ===
    float scanY = fract(time * scanSpeed);
    float worldY = vWorldPosition.y * 0.1 + 0.5;
    float scanLine = smoothstep(scanY - 0.05, scanY, worldY)
                   * smoothstep(scanY + 0.05, scanY, worldY);

    // === 3. 简化的水平线纹理 (稀疏) ===
    float horizontalLines = sin(vWorldPosition.y * 15.0) * 0.5 + 0.5;
    horizontalLines = smoothstep(0.45, 0.55, horizontalLines) * 0.1;

    // === 4. 基础光照 ===
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float light = dot(vNormal, lightDir) * 0.5 + 0.5;

    // === 组合效果 ===

    // 基础填充色（半透明）
    vec3 baseColor = primaryColor * (0.1 + light * 0.2);

    // 轮廓线颜色
    vec3 edgeColor = secondaryColor * sharpEdge * edgeIntensity;

    // 扫描光带
    vec3 scanGlow = primaryColor * scanLine * 0.8;

    // 水平扫描线
    vec3 hLineGlow = primaryColor * horizontalLines;

    // 最终颜色
    vec3 finalColor = baseColor + edgeColor + scanGlow + hLineGlow;

    // 高光点缀
    float highlight = pow(fresnel, 4.0) * 0.3;
    finalColor += vec3(1.0) * highlight;

    // 透明度：边缘更实，中间更透
    float alpha = fillOpacity + sharpEdge * 0.7 + scanLine * 0.3;
    alpha = clamp(alpha, 0.0, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface BlueprintMaterialProps {
  primaryColor?: string;
  secondaryColor?: string;
  scanSpeed?: number;
  edgeIntensity?: number;
  fillOpacity?: number;
}

export const BlueprintMaterial = forwardRef<THREE.ShaderMaterial, BlueprintMaterialProps>(
  function BlueprintMaterial(
    {
      primaryColor = '#00FFFF',      // cyan
      secondaryColor = '#3B82F6',    // electric blue
      scanSpeed = 0.08,
      edgeIntensity = 1.5,
      fillOpacity = 0.15,
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
      () => ({
        time: { value: 0 },
        primaryColor: { value: new THREE.Color(primaryColor) },
        secondaryColor: { value: new THREE.Color(secondaryColor) },
        scanSpeed: { value: scanSpeed },
        edgeIntensity: { value: edgeIntensity },
        fillOpacity: { value: fillOpacity },
      }),
      [primaryColor, secondaryColor, scanSpeed, edgeIntensity, fillOpacity]
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
      />
    );
  }
);
