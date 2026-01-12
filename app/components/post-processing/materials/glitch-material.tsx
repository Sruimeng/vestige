/**
 * Glitch Material
 * @description RGB故障材质 - 赛博朋克霓虹 + 色彩分离 + 故障抖动
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorR;
  uniform vec3 uColorG;
  uniform vec3 uColorB;
  uniform float uRgbShift;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // 1. 光照
    vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
    float light = dot(vNormal, lightDir) * 0.5 + 0.5;

    // 2. 屏幕坐标
    vec2 screen = gl_FragCoord.xy;
    float screenY = screen.y / 400.0;

    // 3. 故障触发
    float glitchTime = floor(uTime * 6.0);
    float glitch = step(0.8, rand(vec2(glitchTime, 0.0)));

    // 4. RGB 分离 (核心效果)
    float baseShift = uRgbShift * 0.15;
    float glitchShift = glitch * uRgbShift * 0.4;
    float totalShift = baseShift + glitchShift;

    // 各通道偏移
    float rVal = light + totalShift;
    float gVal = light;
    float bVal = light - totalShift;

    // 5. 霓虹三色混合
    vec3 color = uColorR * rVal * 0.5
               + uColorG * gVal * 0.4
               + uColorB * bVal * 0.5;

    // 6. 基础亮度保底
    color += vec3(light * 0.15);

    // 7. 扫描线
    float scan = sin(screen.y * 3.0) * 0.5 + 0.5;
    color *= (0.92 + scan * 0.08);

    // 8. 故障时的随机色块 (屏幕空间模拟位移)
    if (glitch > 0.5) {
      float blockY = floor(screenY * 25.0);
      float blockRand = rand(vec2(blockY, floor(uTime * 8.0)));
      if (blockRand > 0.88) {
        float colorPick = rand(vec2(blockY + 1.0, floor(uTime * 8.0)));
        if (colorPick > 0.66) {
          color = uColorR * 0.9;
        } else if (colorPick > 0.33) {
          color = uColorB * 0.9;
        } else {
          color = uColorG * 0.9;
        }
      }
    }

    // 9. 边缘霓虹发光
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, 2.5);

    vec3 rimColor = mix(uColorR, uColorB, sin(uTime * 1.5) * 0.5 + 0.5);
    color += rimColor * fresnel * 0.5;

    // 10. 噪点
    float noise = rand(screen * 0.01 + uTime) * 0.04 * (0.3 + glitch * 0.7);
    color += noise;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface GlitchMaterialProps {
  colorR?: string;
  colorG?: string;
  colorB?: string;
  rgbShift?: number;
}

export const GlitchMaterial = forwardRef<THREE.ShaderMaterial, GlitchMaterialProps>(
  function GlitchMaterial(
    {
      colorR = '#ff0050',
      colorG = '#00ff88',
      colorB = '#00d0ff',
      rgbShift = 0.3,
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
      () => ({
        uTime: { value: 0 },
        uColorR: { value: new THREE.Color(colorR) },
        uColorG: { value: new THREE.Color(colorG) },
        uColorB: { value: new THREE.Color(colorB) },
        uRgbShift: { value: rgbShift },
      }),
      [colorR, colorG, colorB, rgbShift]
    );

    useFrame((_, delta) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta;
      }
    });

    useImperativeHandle(ref, () => materialRef.current!, []);

    return (
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
      />
    );
  }
);
