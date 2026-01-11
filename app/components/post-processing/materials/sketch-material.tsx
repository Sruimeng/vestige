/**
 * Sketch Material
 * @description 铅笔素描材质 - 屏幕空间排线 + 手绘描边
 * @features 多层排线 | 动态抖动描边 | 纸张质感 | 屏幕空间渲染
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

// ============================================
// 主体素描材质 (Hatching Shader)
// ============================================
const sketchVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sketchFragmentShader = /* glsl */ `
  uniform vec3 uLightDirection;
  uniform vec3 uPaperColor;
  uniform vec3 uInkColor;
  uniform float uScale;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    // 1. 计算光照强度 (Lambert)
    float light = dot(vNormal, uLightDirection);
    light = light * 0.5 + 0.5; // 归一化到 0-1

    // 2. 生成屏幕空间坐标 (防止模型UV拉伸)
    vec2 st = gl_FragCoord.xy / 400.0 * uScale;

    // 3. 程序化生成排线 (Procedural Hatching)
    // Level 1: 斜线 (////) - 浅阴影
    float hatch1 = clamp(sin((st.x + st.y) * 40.0) * 10.0 - 5.0, 0.0, 1.0);

    // Level 2: 反向斜线 (\\\\) - 中阴影
    float hatch2 = clamp(sin((st.x - st.y) * 40.0) * 10.0 - 5.0, 0.0, 1.0);

    // Level 3: 垂直线 (||||) - 深阴影
    float hatch3 = clamp(sin(st.x * 50.0) * 10.0 - 5.0, 0.0, 1.0);

    // 4. 根据光照混合排线
    // 越黑的地方，叠加的线条越多
    float brightness = 1.0;

    if (light < 0.75) brightness *= hatch1; // 浅阴影
    if (light < 0.45) brightness *= hatch2; // 中阴影
    if (light < 0.2) brightness *= hatch3;  // 深阴影

    // 5. 边缘检测 (Fresnel-like edge)
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float edge = 1.0 - abs(dot(viewDir, vNormal));
    edge = smoothstep(0.4, 0.7, edge);
    brightness *= (1.0 - edge * 0.6);

    // 6. 增加纸张噪点 (Paper Grain)
    float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    brightness *= (0.92 + 0.08 * noise);

    // 7. 混合颜色
    vec3 finalColor = mix(uInkColor, uPaperColor, brightness);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ============================================
// 描边材质 (Outline Shader)
// ============================================
const outlineVertexShader = /* glsl */ `
  uniform float uThickness;
  uniform float uTime;

  void main() {
    // 1. 沿法线方向膨胀顶点
    vec3 newPosition = position + normal * uThickness;

    // 2. 增加手绘抖动效果 (Boiling Line)
    float noise = sin(uTime * 4.0 + position.y * 15.0) * 0.003;
    noise += sin(uTime * 3.0 + position.x * 12.0) * 0.002;
    newPosition += normal * noise;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const outlineFragmentShader = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

// ============================================
// Props Interface
// ============================================
interface SketchMaterialProps {
  /** 纸张颜色 */
  paperColor?: string;
  /** 铅笔/墨水颜色 */
  inkColor?: string;
  /** 排线密度 */
  scale?: number;
  /** 是否为描边层 */
  isOutline?: boolean;
  /** 描边粗细 */
  outlineThickness?: number;
}

// ============================================
// Main Component
// ============================================
export const SketchMaterial = forwardRef<THREE.ShaderMaterial, SketchMaterialProps>(
  function SketchMaterial(
    {
      paperColor = '#f5f3eb',    // 米黄纸张
      inkColor = '#1a1a1a',      // 深灰铅笔
      scale = 6.0,               // 排线密度
      isOutline = false,         // 是否为描边层
      outlineThickness = 0.004,  // 描边粗细 (更细)
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const outlineUniforms = useMemo(
      () => ({
        uColor: { value: new THREE.Color(inkColor) },
        uThickness: { value: outlineThickness },
        uTime: { value: 0 },
      }),
      [inkColor, outlineThickness]
    );

    const sketchUniforms = useMemo(
      () => ({
        uLightDirection: { value: new THREE.Vector3(0.5, 1.0, 1.0).normalize() },
        uPaperColor: { value: new THREE.Color(paperColor) },
        uInkColor: { value: new THREE.Color(inkColor) },
        uScale: { value: scale },
        uTime: { value: 0 },
      }),
      [paperColor, inkColor, scale]
    );

    useFrame((state) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });

    useImperativeHandle(ref, () => materialRef.current!, []);

    if (isOutline) {
      return (
        <shaderMaterial
          ref={materialRef}
          vertexShader={outlineVertexShader}
          fragmentShader={outlineFragmentShader}
          uniforms={outlineUniforms}
          side={THREE.BackSide}
        />
      );
    }

    return (
      <shaderMaterial
        ref={materialRef}
        vertexShader={sketchVertexShader}
        fragmentShader={sketchFragmentShader}
        uniforms={sketchUniforms}
        side={THREE.DoubleSide}
      />
    );
  }
);

// ============================================
// 描边材质组件 (便捷导出)
// ============================================
export const SketchOutlineMaterial = forwardRef<THREE.ShaderMaterial, Omit<SketchMaterialProps, 'isOutline'>>(
  function SketchOutlineMaterial(props, ref) {
    return <SketchMaterial {...props} isOutline={true} ref={ref} />;
  }
);
