/**
 * Cyber Glitch Effect
 * @description 赛博朋克故障后处理效果 - RGB分离 + 水平撕裂 + 扫描线
 */

import { forwardRef, useMemo } from 'react';
import { Uniform, Vector2 } from 'three';
import { Effect, BlendFunction } from 'postprocessing';

const cyberGlitchFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uStrength;
uniform vec2 uResolution;

// 随机函数
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 区块噪声
float blockNoise(vec2 uv, float scale) {
  vec2 i = floor(uv * scale);
  return random(i);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 coord = uv;

  // 1. 故障触发器 (断断续续)
  float trigger = random(vec2(floor(uTime * 8.0), 0.0));
  float activeStrength = uStrength * step(0.6, trigger);

  // 持续的轻微故障
  float baseGlitch = uStrength * 0.15;
  float totalStrength = baseGlitch + activeStrength;

  // 2. 水平撕裂
  float block = blockNoise(vec2(uv.y, floor(uTime * 6.0)), 15.0);
  float displacement = (block - 0.5) * 0.08 * activeStrength;

  // 细碎抖动
  float jitter = (random(vec2(uv.y * 100.0, uTime)) - 0.5) * 0.015 * totalStrength;

  coord.x += displacement + jitter;
  coord = clamp(coord, 0.0, 1.0);

  // 3. RGB 色差分离
  float rgbShift = 0.012 * totalStrength;

  vec2 rCoord = coord + vec2(rgbShift, 0.0);
  vec2 gCoord = coord;
  vec2 bCoord = coord - vec2(rgbShift, 0.0);

  // 采样三个通道
  float r = texture2D(inputBuffer, rCoord).r;
  float g = texture2D(inputBuffer, gCoord).g;
  float b = texture2D(inputBuffer, bCoord).b;

  vec3 color = vec3(r, g, b);

  // 4. 扫描线
  float scanline = sin(uv.y * uResolution.y * 0.8 + uTime * 3.0) * 0.5 + 0.5;
  scanline = smoothstep(0.3, 0.7, scanline);
  color *= (0.92 + scanline * 0.08);

  // 5. 噪点
  float noise = random(uv + uTime) * 0.12 * activeStrength;
  color += noise;

  // 6. 赛博色调 (边缘青/品红)
  float dist = distance(uv, vec2(0.5));
  color.r *= 1.0 + dist * 0.15;
  color.b *= 1.0 + dist * 0.2;

  // 7. 故障时的色块闪烁
  if (activeStrength > 0.3) {
    float blockY = floor(uv.y * 20.0);
    float blockRand = random(vec2(blockY, floor(uTime * 10.0)));
    if (blockRand > 0.92) {
      float colorPick = random(vec2(blockY + 1.0, floor(uTime * 10.0)));
      if (colorPick > 0.5) {
        color = vec3(0.0, 1.0, 1.0) * 0.8; // 青色
      } else {
        color = vec3(1.0, 0.0, 0.5) * 0.8; // 品红
      }
    }
  }

  outputColor = vec4(color, inputColor.a);
}
`;

const DEFAULT_RESOLUTION = new Vector2(1920, 1080);

interface CyberGlitchProps {
  strength?: number;
  resolution?: Vector2;
}

class CyberGlitch extends Effect {
  constructor({
    strength = 0.5,
    resolution = DEFAULT_RESOLUTION,
  }: CyberGlitchProps = {}) {
    super('CyberGlitchEffect', cyberGlitchFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uTime', new Uniform(0)],
        ['uStrength', new Uniform(strength)],
        ['uResolution', new Uniform(resolution)],
      ]),
    });
  }

  update(_renderer: unknown, _inputBuffer: unknown, deltaTime: number) {
    const time = this.uniforms.get('uTime');
    if (time) {
      time.value += deltaTime;
    }
  }

  setSize(width: number, height: number) {
    const resolution = this.uniforms.get('uResolution');
    if (resolution) {
      resolution.value.set(width, height);
    }
  }
}

interface CyberGlitchEffectProps {
  strength?: number;
}

export const CyberGlitchEffect = forwardRef<Effect, CyberGlitchEffectProps>(
  function CyberGlitchEffect({ strength = 0.5 }, ref) {
    const effect = useMemo(
      () =>
        new CyberGlitch({
          strength,
        }),
      [strength]
    );

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
