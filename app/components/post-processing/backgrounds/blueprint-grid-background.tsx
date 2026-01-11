/**
 * Blueprint Grid Background
 * @description 工程蓝图网格背景组件
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // 直接输出屏幕空间坐标，忽略MVP矩阵
    // position.xy 从 -1 到 1 映射到全屏
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform vec3 gridColor;
  uniform vec3 backgroundColor;
  uniform float gridScale;
  uniform float scanSpeed;

  varying vec2 vUv;

  // 抗锯齿网格线
  float gridLine(vec2 coord, float width) {
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
  }

  void main() {
    // 主网格
    vec2 gridCoord = vUv * gridScale;
    float mainGrid = gridLine(gridCoord, 0.02) * 0.4;

    // 细网格
    vec2 fineGridCoord = vUv * gridScale * 5.0;
    float fineGrid = gridLine(fineGridCoord, 0.01) * 0.15;

    // 扫描线动画
    float scanY = fract(time * scanSpeed);
    float scanLine = smoothstep(scanY - 0.02, scanY, vUv.y)
                   * smoothstep(scanY + 0.02, scanY, vUv.y);

    // 水平扫描线纹理
    float horizontalLines = sin(vUv.y * 200.0) * 0.5 + 0.5;
    horizontalLines = smoothstep(0.4, 0.6, horizontalLines) * 0.05;

    // 边缘渐暗
    float vignette = 1.0 - length((vUv - 0.5) * 1.5);
    vignette = smoothstep(0.0, 0.8, vignette);

    // 组合
    float grid = mainGrid + fineGrid;
    vec3 color = backgroundColor;
    color += gridColor * grid * vignette;
    color += gridColor * scanLine * 0.3;
    color += gridColor * horizontalLines * vignette;

    // 透明度
    float alpha = (grid * 0.5 + 0.1) * vignette;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface BlueprintGridBackgroundProps {
  gridColor?: string;
  backgroundColor?: string;
  gridScale?: number;
  scanSpeed?: number;
}

export function BlueprintGridBackground({
  gridColor = '#00FFFF',      // cyan
  backgroundColor = '#050505', // deep space
  gridScale = 20.0,
  scanSpeed = 0.05,
}: BlueprintGridBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      gridColor: { value: new THREE.Color(gridColor) },
      backgroundColor: { value: new THREE.Color(backgroundColor) },
      gridScale: { value: gridScale },
      scanSpeed: { value: scanSpeed },
    }),
    [gridColor, backgroundColor, gridScale, scanSpeed]
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
    }
  });

  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <planeGeometry args={[3, 3]}  />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
