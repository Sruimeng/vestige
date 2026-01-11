/**
 * Base Post-Processing Effects
 * @description 基础后处理效果组件 (独立使用，不含风格滤镜)
 */

import { useMemo, Fragment } from 'react';
import { EffectComposer, Vignette, Bloom, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStyleFilter } from '../context';
import { ScanlineEffect } from './scanline-effect';

export function BaseEffects() {
  const { config, isMobile } = useStyleFilter();
  const { vignette, scanline, bloom, noise } = config;

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

    if (scanline.enabled && !isMobile) {
      result.push(<ScanlineEffect key="scanline" density={scanline.density} />);
    }

    if (bloom.enabled && !isMobile) {
      result.push(
        <Bloom
          key="bloom"
          intensity={bloom.intensity}
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={bloom.radius}
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

    return result;
  }, [vignette, scanline, bloom, noise, isMobile]);

  return <EffectComposer><Fragment>{effects}</Fragment></EffectComposer>;
}
