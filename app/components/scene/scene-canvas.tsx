/**
 * 3D 场景 Canvas
 * 深空终端美学 - React Three Fiber 场景（增强版）
 */

import { Environment, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

interface SceneCanvasProps {
  children?: React.ReactNode;
  className?: string;
}

// 深空背景粒子
function DeepSpaceBackground() {
  return (
    <Stars
      radius={100}
      depth={50}
      count={2000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}

// 光照系统
function LightingRig() {
  return (
    <>
      {/* 环境光 - 低强度基础照明 */}
      <ambientLight intensity={0.15} color="#E0E7FF" />

      {/* 主光源 - 从右上方照射，冷白色 */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        color="#E0E7FF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 补光 - 从左下方照射，蓝色 */}
      <directionalLight
        position={[-5, -3, -5]}
        intensity={0.4}
        color="#3B82F6"
      />

      {/* 顶部点光源 - 强调高光 */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.3}
        color="#FFFFFF"
        distance={15}
        decay={2}
      />

      {/* 前方点光源 - 蓝色强调 */}
      <pointLight
        position={[0, 0, 5]}
        intensity={0.5}
        color="#3B82F6"
        distance={10}
        decay={2}
      />

      {/* 背光 - 轮廓光 */}
      <pointLight
        position={[0, 0, -5]}
        intensity={0.2}
        color="#1E40AF"
        distance={10}
        decay={2}
      />
    </>
  );
}

export function SceneCanvas({ children, className = '' }: SceneCanvasProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: 1, // ACESFilmicToneMapping
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        shadows
      >
        <Suspense fallback={null}>
          {/* 相机 */}
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 5]}
            fov={50}
            near={0.1}
            far={1000}
          />

          {/* 深空背景 */}
          <DeepSpaceBackground />

          {/* 光照系统 */}
          <LightingRig />

          {/* 环境贴图 - Studio Light 风格 */}
          <Environment preset="studio" environmentIntensity={0.3} />

          {/* 雾效 - 增加深度感 */}
          <fog attach="fog" args={['#050505', 8, 30]} />

          {/* 轨道控制器 */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={false}
            enableDamping
            dampingFactor={0.05}
          />

          {/* 子内容 */}
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
