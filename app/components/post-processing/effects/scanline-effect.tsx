/**
 * Scanline Effect
 * @description 扫描线后处理效果
 */

import { forwardRef, useMemo } from 'react';
import { Uniform } from 'three';
import { Effect, BlendFunction } from 'postprocessing';

// 内联 Shader
const scanlineFragmentShader = /* glsl */ `
uniform float density;
uniform float opacity;
uniform float time;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float scanline = sin(uv.y * density * 800.0 + time * 2.0) * 0.5 + 0.5;
  scanline = pow(scanline, 2.0);

  vec3 color = inputColor.rgb;
  color = mix(color, color * (1.0 - opacity), scanline * opacity);

  outputColor = vec4(color, inputColor.a);
}
`;

interface ScanlineEffectImplProps {
  density?: number;
  opacity?: number;
}

class ScanlineEffectImpl extends Effect {
  constructor({ density = 1.5, opacity = 0.02 }: ScanlineEffectImplProps = {}) {
    super('ScanlineEffect', scanlineFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['density', new Uniform(density)],
        ['opacity', new Uniform(opacity)],
        ['time', new Uniform(0)],
      ]),
    });
  }

  update(_renderer: unknown, _inputBuffer: unknown, deltaTime: number) {
    const time = this.uniforms.get('time');
    if (time) {
      time.value += deltaTime;
    }
  }
}

interface ScanlineEffectProps {
  density?: number;
  opacity?: number;
}

export const ScanlineEffect = forwardRef<Effect, ScanlineEffectProps>(
  function ScanlineEffect({ density = 1.5, opacity = 0.02 }, ref) {
    const effect = useMemo(
      () => new ScanlineEffectImpl({ density, opacity }),
      [density, opacity]
    );

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
