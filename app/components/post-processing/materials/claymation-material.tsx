/**
 * Claymation Material
 * @description 粘土定格动画材质
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  uniform float time;
  uniform float frameRate;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  // 噪声函数
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // 量化时间实现定格效果
    float quantizedTime = floor(time * frameRate) / frameRate;

    // 轻微顶点抖动（定格动画特征）
    vec3 pos = position;
    float jitter = hash(vec2(quantizedTime, position.y)) * 0.01;
    pos += normal * jitter;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform float frameRate;
  uniform float saturation;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // 量化时间
    float quantizedTime = floor(time * frameRate) / frameRate;

    // 光照
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float light = dot(vNormal, lightDir) * 0.5 + 0.5;

    // 基础粘土色（暖色调）
    vec3 clayColor = vec3(0.85, 0.75, 0.65);

    // 根据法线方向给不同色调
    if (vNormal.y > 0.5) {
      clayColor = vec3(0.9, 0.8, 0.7); // 顶部更亮
    } else if (vNormal.y < -0.5) {
      clayColor = vec3(0.7, 0.6, 0.5); // 底部更暗
    }

    // 应用光照
    vec3 color = clayColor * (0.6 + light * 0.4);

    // 量化颜色（减少色阶）
    color = floor(color * 8.0) / 8.0;

    // 指纹/粘土纹理
    float fingerprint = hash(vUv * 50.0 + quantizedTime);
    fingerprint = fingerprint * 0.1 - 0.05;
    color += fingerprint;

    // 增加饱和度
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, saturation);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface ClaymationMaterialProps {
  frameRate?: number;
  saturation?: number;
}

export const ClaymationMaterial = forwardRef<THREE.ShaderMaterial, ClaymationMaterialProps>(
  function ClaymationMaterial(
    {
      frameRate = 8.0,
      saturation = 1.3,
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
      () => ({
        time: { value: 0 },
        frameRate: { value: frameRate },
        saturation: { value: saturation },
      }),
      [frameRate, saturation]
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
      />
    );
  }
);
