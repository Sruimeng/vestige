/**
 * 全息线框立方体
 * 深空终端美学 - CONSTRUCTING 状态动画（增强版）
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

interface HologramWireframeProps {
  isAnimating?: boolean;
}

export function HologramWireframe({ isAnimating = true }: HologramWireframeProps) {
  const groupRef = useRef<Group>(null);
  const innerRef = useRef<Mesh>(null);
  const outerRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (isAnimating) {
      // 外层旋转
      if (groupRef.current) {
        groupRef.current.rotation.x += delta * 0.3;
        groupRef.current.rotation.y += delta * 0.5;
      }
      // 内层反向旋转
      if (innerRef.current) {
        innerRef.current.rotation.x -= delta * 0.5;
        innerRef.current.rotation.z += delta * 0.3;
      }
      // 脉动效果
      if (outerRef.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        outerRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 外层线框立方体 */}
      <mesh ref={outerRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial
          color="#3B82F6"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* 内层线框立方体 */}
      <mesh ref={innerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#60A5FA"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 中心八面体 */}
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial
          color="#3B82F6"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 顶点光点 */}
      {[
        [0.75, 0.75, 0.75],
        [-0.75, 0.75, 0.75],
        [0.75, -0.75, 0.75],
        [-0.75, -0.75, 0.75],
        [0.75, 0.75, -0.75],
        [-0.75, 0.75, -0.75],
        [0.75, -0.75, -0.75],
        [-0.75, -0.75, -0.75],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
      ))}
    </group>
  );
}
