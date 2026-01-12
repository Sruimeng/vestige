/**
 * GLB 模型加载器
 * 深空终端美学 - 加载真实 3D 模型，支持材质替换
 */

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';
import { useStyleFilter } from '@/components/post-processing';
import {
  BlueprintMaterial,
  HalftoneMaterial,
  ASCIIMaterial,
  SketchMaterial,
  SketchOutlineMaterial,
  CrystalMaterial,
  ClaymationMaterial,
  PixelMaterial,
} from '@/components/post-processing/materials';

interface ArtifactModelProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// 需要材质替换的滤镜列表 (glitch 改用后处理，不再需要材质)
const MATERIAL_FILTERS = [
  'blueprint',
  'halftone',
  'ascii',
  'sketch',
  'crystal',
  'claymation',
  'pixel',
] as const;

type MaterialFilter = (typeof MATERIAL_FILTERS)[number];

function isMaterialFilter(filter: string): filter is MaterialFilter {
  return MATERIAL_FILTERS.includes(filter as MaterialFilter);
}

// 根据滤镜类型返回对应材质组件
function FilterMaterial({ filter }: { filter: MaterialFilter }) {
  switch (filter) {
    case 'blueprint':
      return <BlueprintMaterial />;
    case 'halftone':
      return <HalftoneMaterial />;
    case 'ascii':
      return <ASCIIMaterial />;
    case 'sketch':
      return <SketchMaterial />;
    case 'crystal':
      return <CrystalMaterial />;
    case 'claymation':
      return <ClaymationMaterial />;
    case 'pixel':
      return <PixelMaterial />;
    default:
      return null;
  }
}

function ModelContent({ url, onLoad }: { url: string; onLoad?: () => void }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);
  const { filter } = useStyleFilter();

  // 克隆场景以便修改材质
  const clonedScene = useMemo(() => scene.clone(), [scene]);

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

  // 获取模型的几何体用于自定义材质渲染
  const geometries = useMemo(() => {
    const geos: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[] = [];
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        if (mesh.geometry) {
          // 保存几何体和变换矩阵
          geos.push({
            geometry: mesh.geometry,
            matrix: mesh.matrixWorld.clone(),
          });
        }
      }
    });
    return geos;
  }, [scene]);

  const useMaterialFilter = isMaterialFilter(filter);
  const isSketchFilter = filter === 'sketch';

  return (
    <group ref={groupRef}>
      {/* 原始模型（默认模式显示） */}
      {!useMaterialFilter && <primitive object={clonedScene} scale={3} />}

      {/* 材质替换模式 */}
      {useMaterialFilter &&
        geometries.map((item, i) => (
          <group key={i}>
            {/* 主体材质 */}
            <mesh geometry={item.geometry} scale={3}>
              <FilterMaterial filter={filter as MaterialFilter} />
            </mesh>
            {/* Sketch 滤镜额外渲染描边层 */}
            {isSketchFilter && (
              <mesh geometry={item.geometry} scale={3}>
                <SketchOutlineMaterial />
              </mesh>
            )}
          </group>
        ))}
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
