/**
 * Crystal Material
 * @description 透明水晶材质 - 基于 Shadertoy 光线追踪技术的近似实现
 * @reference https://www.shadertoy.com/view/tl3XRN
 */

import { useThree, useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useImperativeHandle, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPosition;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vLocalPosition = position;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vViewDir = normalize(worldPosition.xyz - cameraPosition);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform samplerCube uEnvMap;
  uniform float uEnvMapIntensity;
  uniform float uFresnelPower;
  uniform float uExtinction;
  uniform float uRefractIndex;
  uniform float uReflectCoeff;

  // Cracks & texture
  uniform float uNoiseScale;
  uniform float uCrackIntensity;
  uniform float uCrackSharpness;

  // Specular
  uniform float uSpecularPower;
  uniform float uSpecularIntensity;

  // Normal perturbation
  uniform float uNormalPerturbation;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPosition;
  varying vec3 vViewDir;

  // === High Quality 3D Noise ===
  float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float noise3D(vec3 x) {
    const vec3 step = vec3(110.0, 241.0, 171.0);
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    float n = dot(i, step);
    return mix(
      mix(
        mix(hash1(n + dot(step, vec3(0,0,0))), hash1(n + dot(step, vec3(1,0,0))), f.x),
        mix(hash1(n + dot(step, vec3(0,1,0))), hash1(n + dot(step, vec3(1,1,0))), f.x),
        f.y
      ),
      mix(
        mix(hash1(n + dot(step, vec3(0,0,1))), hash1(n + dot(step, vec3(1,0,1))), f.x),
        mix(hash1(n + dot(step, vec3(0,1,1))), hash1(n + dot(step, vec3(1,1,1))), f.x),
        f.y
      ),
      f.z
    );
  }

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    vec3 worldNormal = normalize(vWorldNormal);

    // === 背面检测与法线翻转 ===
    // gl_FrontFacing 为 false 时是背面，需要翻转法线
    // 这样背面也能正确计算光照
    if (!gl_FrontFacing) {
      normal = -normal;
      worldNormal = -worldNormal;
    }

    // === 0. 法线扰动 (微表面坑洼) ===
    vec3 perturbSample = vLocalPosition * 15.0;
    vec3 normalOffset = vec3(
      noise3D(perturbSample) - 0.5,
      noise3D(perturbSample + vec3(31.7, 0.0, 0.0)) - 0.5,
      noise3D(perturbSample + vec3(0.0, 47.3, 0.0)) - 0.5
    ) * uNormalPerturbation;
    normal = normalize(normal + normalOffset);
    worldNormal = normalize(worldNormal + normalOffset);

    // === 1. 厚度估算 (Thickness Approximation) ===
    // 模拟光线在水晶内部的路径长度
    // 边缘薄 (dot≈0)，中心厚 (dot≈1)
    float NdotV = max(dot(viewDir, normal), 0.0);
    float thickness = (1.0 - NdotV) * 2.0 + 0.5;

    // === 2. 菲涅尔 (Fresnel) ===
    // 参考 Shadertoy: fresnel = 1 + dot(R.Dir, I.N) / length(R.Dir)
    float fresnel = 1.0 - NdotV;
    fresnel = clamp(fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, uFresnelPower) * uReflectCoeff;

    // === 3. 反射 (Reflection) ===
    vec3 reflectDir = reflect(vViewDir, worldNormal);
    vec3 reflectColor = textureCube(uEnvMap, reflectDir).rgb;
    reflectColor = pow(reflectColor, vec3(1.5)) * uEnvMapIntensity;

    // === 4. 折射 (Refraction) ===
    // 模拟光线穿过水晶的弯曲
    vec3 refractDir = refract(vViewDir, worldNormal, 1.0 / uRefractIndex);
    // 如果全反射，使用反射方向
    if (length(refractDir) < 0.001) {
      refractDir = reflectDir;
    }
    vec3 refractColor = textureCube(uEnvMap, refractDir).rgb;

    // === 5. Beer's Law 吸收 ===
    // 参考 Shadertoy: d = exp(-l * extinction)
    // 光线穿过越厚的水晶，颜色越深
    float absorption = exp(-thickness * uExtinction);
    // 混合折射光和核心颜色
    vec3 transmittedColor = mix(uCoreColor, refractColor, absorption);

    // === 6. 内部裂纹 ===
    vec3 crackPos = vLocalPosition * uNoiseScale;
    float crackNoise = noise3D(crackPos);
    float sharpCrack = abs(sin(crackNoise * 3.14159265));
    float cracks = pow(1.0 - sharpCrack, uCrackSharpness);

    float crackNoise2 = noise3D(crackPos * 0.5 + vec3(50.0));
    float sharpCrack2 = abs(sin(crackNoise2 * 3.14159265));
    float cracks2 = pow(1.0 - sharpCrack2, uCrackSharpness * 0.8) * 0.5;

    float totalCracks = (cracks + cracks2) * uCrackIntensity;
    vec3 crackLight = vec3(1.0, 0.95, 0.9) * totalCracks;

    // === 7. 高光 (Specular) ===
    vec3 lightDir1 = normalize(vec3(1.0, 1.0, 0.5));
    vec3 lightDir2 = normalize(vec3(-0.5, 0.8, -0.3));
    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 halfDir2 = normalize(lightDir2 + viewDir);

    float spec1 = pow(max(dot(normal, halfDir1), 0.0), uSpecularPower);
    float spec2 = pow(max(dot(normal, halfDir2), 0.0), uSpecularPower * 0.8) * 0.6;
    float specular = (spec1 + spec2) * uSpecularIntensity;

    // === 8. 最终合成 ===
    // 参考 Shadertoy 的合成方式:
    // finalColor = reflect_coeff * fresnel * sky(reflect) + mix(core_color, sky(refract), d)
    vec3 finalColor = vec3(0.0);

    // 反射部分 (菲涅尔控制)
    finalColor += fresnel * reflectColor;

    // 透射部分 (1 - 菲涅尔)
    finalColor += (1.0 - fresnel) * transmittedColor;

    // 添加裂纹和高光
    finalColor += crackLight;
    finalColor += vec3(1.0) * specular;

    // 边缘光
    finalColor += vec3(0.8, 0.9, 1.0) * pow(1.0 - NdotV, 4.0) * 0.15;

    // === 9. Alpha 计算 ===
    // 边缘更透明，中心更实
    // 高光和裂纹处不透明
    float baseAlpha = 0.3 + fresnel * 0.4 + NdotV * 0.2;
    float crackAlpha = totalCracks * 0.5;
    float specAlpha = specular * 0.3;
    float alpha = clamp(baseAlpha + crackAlpha + specAlpha, 0.2, 0.95);

    gl_FragColor = vec4(finalColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface CrystalMaterialProps {
  coreColor?: string;
  fresnelPower?: number;
  envMapIntensity?: number;
  extinction?: number;
  refractIndex?: number;
  reflectCoeff?: number;
  // Cracks
  noiseScale?: number;
  crackIntensity?: number;
  crackSharpness?: number;
  // Specular
  specularPower?: number;
  specularIntensity?: number;
  // Normal perturbation
  normalPerturbation?: number;
}

export const CrystalMaterial = forwardRef<THREE.ShaderMaterial, CrystalMaterialProps>(
  function CrystalMaterial(
    {
      coreColor = '#004040',           // 核心颜色
      fresnelPower = 3.0,              // 菲涅尔指数
      envMapIntensity = 1.5,           // 环境贴图强度
      extinction = 0.25,               // 吸收系数 (参考 Shadertoy)
      refractIndex = 1.3,              // 折射率 (参考 Shadertoy: 1.3 = 水)
      reflectCoeff = 0.75,             // 反射系数 (参考 Shadertoy)
      // Cracks
      noiseScale = 6.0,
      crackIntensity = 0.08,
      crackSharpness = 1.0,
      // Specular
      specularPower = 256.0,
      specularIntensity = 1.5,
      // Normal perturbation
      normalPerturbation = 0.05,
    },
    ref
  ) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { scene } = useThree();

    const uniforms = useMemo(
      () => ({
        uTime: { value: 0 },
        uCoreColor: { value: new THREE.Color(coreColor) },
        uEnvMap: { value: null as THREE.CubeTexture | null },
        uEnvMapIntensity: { value: envMapIntensity },
        uFresnelPower: { value: fresnelPower },
        uExtinction: { value: extinction },
        uRefractIndex: { value: refractIndex },
        uReflectCoeff: { value: reflectCoeff },
        uNoiseScale: { value: noiseScale },
        uCrackIntensity: { value: crackIntensity },
        uCrackSharpness: { value: crackSharpness },
        uSpecularPower: { value: specularPower },
        uSpecularIntensity: { value: specularIntensity },
        uNormalPerturbation: { value: normalPerturbation },
      }),
      []
    );

    // Sync environment map from scene
    useEffect(() => {
      if (materialRef.current && scene.environment) {
        materialRef.current.uniforms.uEnvMap.value = scene.environment;
      }
    }, [scene.environment]);

    // Update uniforms when props change
    useEffect(() => {
      if (materialRef.current) {
        materialRef.current.uniforms.uCoreColor.value.set(coreColor);
        materialRef.current.uniforms.uEnvMapIntensity.value = envMapIntensity;
        materialRef.current.uniforms.uFresnelPower.value = fresnelPower;
        materialRef.current.uniforms.uExtinction.value = extinction;
        materialRef.current.uniforms.uRefractIndex.value = refractIndex;
        materialRef.current.uniforms.uReflectCoeff.value = reflectCoeff;
        materialRef.current.uniforms.uNoiseScale.value = noiseScale;
        materialRef.current.uniforms.uCrackIntensity.value = crackIntensity;
        materialRef.current.uniforms.uCrackSharpness.value = crackSharpness;
        materialRef.current.uniforms.uSpecularPower.value = specularPower;
        materialRef.current.uniforms.uSpecularIntensity.value = specularIntensity;
        materialRef.current.uniforms.uNormalPerturbation.value = normalPerturbation;
      }
    }, [coreColor, envMapIntensity, fresnelPower, extinction, refractIndex, reflectCoeff, noiseScale, crackIntensity, crackSharpness, specularPower, specularIntensity, normalPerturbation]);

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
        side={THREE.DoubleSide}
        transparent={false}
      />
    );
  }
);
