/**
 * Post-Processing Effects Composer
 * @description 后处理效果组合器 - 基础效果 + 风格滤镜后处理
 */

import { useMemo, Fragment } from 'react';
import { EffectComposer, Vignette, Bloom, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStyleFilter } from './context';
import { ScanlineEffect } from './effects/scanline-effect';
import { BlueprintEdgeEffect } from './effects/blueprint-edge-effect';
import { CyberGlitchEffect } from './effects/cyber-glitch-effect';

/** 内置颜色常量 */
const FILTER_COLORS = {
  cyan: '#00FFFF',
} as const;

export function PostProcessingComposer() {
  const { config, filter } = useStyleFilter();
  const { vignette, scanline, bloom, noise } = config;

  // 收集所有启用的基础效果
  const effects = useMemo(() => {
    const result: React.ReactNode[] = [];

    if (vignette.enabled) {
      result.push(
        <Vignette
          key="vignette"
          offset={vignette.offset}
          darkness={vignette.darkness}
          blendFunction={BlendFunction.NORMAL}
        />
      );
    }

    if (scanline.enabled) {
      result.push(<ScanlineEffect key="scanline" density={scanline.density} />);
    }

    if (bloom.enabled) {
      result.push(
        <Bloom
          key="bloom"
          intensity={bloom.intensity}
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={0.025}
          mipmapBlur={true}
          blendFunction={BlendFunction.ADD}
        />
      );
    }

    if (noise.enabled) {
      result.push(
        <Noise
          key="noise"
          opacity={noise.opacity}
          blendFunction={BlendFunction.OVERLAY}
        />
      );
    }

    // Blueprint 滤镜专属边缘检测效果
    if (filter === 'blueprint') {
      result.push(
        <BlueprintEdgeEffect
          key="blueprint-edge"
          edgeColor={FILTER_COLORS.cyan}
          threshold={0.08}
          edgeWidth={1.2}
        />
      );
    }

    // Glitch 滤镜专属赛博故障效果
    if (filter === 'glitch') {
      result.push(
        <Bloom
          key="glitch-bloom"
          intensity={1.2}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.025}
          mipmapBlur={true}
          blendFunction={BlendFunction.ADD}
        />
      );
      result.push(<CyberGlitchEffect key="cyber-glitch" strength={0.6} />);
    }

    return result;
  }, [vignette, scanline, bloom, noise, filter]);

  return (
    <EffectComposer>
      <Fragment>{effects}</Fragment>
    </EffectComposer>
  );
}
