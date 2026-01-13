/**
 * GLB 模型加载器
 */

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';
import { useStyleFilter } from '@/components/post-processing';
import { fetchModelAsBlob } from '@/constants/api';
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
  const hasCalledOnLoad = useRef(false);
  const { filter } = useStyleFilter();

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (hasCalledOnLoad.current) return;
    if (!onLoad) return;

    hasCalledOnLoad.current = true;
    onLoad();
  }, [onLoad]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const geometries = useMemo(() => {
    const geos: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[] = [];
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        if (mesh.geometry) {
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
      {!useMaterialFilter && <primitive object={clonedScene} scale={3} />}

      {useMaterialFilter &&
        geometries.map((item, i) => (
          <group key={i}>
            <mesh geometry={item.geometry} scale={3}>
              <FilterMaterial filter={filter as MaterialFilter} />
            </mesh>
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

function ModelLoader({ url, onLoad, onError }: ArtifactModelProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let revoke: string | null = null;

    fetchModelAsBlob(url)
      .then((result) => {
        setBlobUrl(result);
        if (result !== url) revoke = result;
      })
      .catch((err) => {
        setError(err);
        onError?.(err);
      });

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [url, onError]);

  if (error) return null;
  if (!blobUrl) return null;

  return (
    <Suspense fallback={null}>
      <ModelContent url={blobUrl} onLoad={onLoad} />
    </Suspense>
  );
}

export function ArtifactModel({ url, onLoad, onError }: ArtifactModelProps) {
  if (!url) return null;

  return <ModelLoader url={url} onLoad={onLoad} onError={onError} />;
}

export function preloadModel(url: string) {
  if (url) {
    fetchModelAsBlob(url).then((blobUrl) => {
      useGLTF.preload(blobUrl);
    });
  }
}
