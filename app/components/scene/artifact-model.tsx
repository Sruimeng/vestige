/**
 * GLB 模型加载器
 * 深空终端美学 - 加载真实 3D 模型
 */

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import type { Group } from 'three';

interface ArtifactModelProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

function ModelContent({ url, onLoad }: { url: string; onLoad?: () => void }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  // 轻微浮动动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={3} />
    </group>
  );
}

export function ArtifactModel({ url, onLoad }: ArtifactModelProps) {
  if (!url) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ModelContent url={url} onLoad={onLoad} />
    </Suspense>
  );
}

// 预加载模型
export function preloadModel(url: string) {
  if (url) {
    useGLTF.preload(url);
  }
}
