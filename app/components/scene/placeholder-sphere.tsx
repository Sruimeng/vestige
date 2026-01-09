/**
 * 占位球体
 * 深空终端美学 - 模型加载前的占位（增强版）
 */

import { MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

export function PlaceholderSphere() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // 轻微浮动动画
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      // 缓慢旋转
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group>
      {/* 主球体 */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[0.8, 4]} />
        <MeshDistortMaterial
          color="#1E40AF"
          metalness={0.9}
          roughness={0.1}
          emissive="#3B82F6"
          emissiveIntensity={0.15}
          distort={0.2}
          speed={2}
        />
      </mesh>

      {/* 外层光晕 */}
      <mesh scale={1.1}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* 轨道环 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.01, 16, 100]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.4, 0.008, 16, 100]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
