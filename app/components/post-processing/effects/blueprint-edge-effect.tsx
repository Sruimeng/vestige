/**
 * Blueprint Edge Effect
 * @description 工程蓝图边缘检测后处理效果 (Sobel)
 */

import { forwardRef, useMemo } from 'react';
import { Uniform, Color, Vector2 } from 'three';
import { Effect, BlendFunction } from 'postprocessing';

const blueprintEdgeFragmentShader = /* glsl */ `
uniform vec3 edgeColor;
uniform float threshold;
uniform float edgeWidth;
uniform vec2 resolution;

// Sobel 边缘检测
float sobel(sampler2D tex, vec2 uv, vec2 texelSize) {
  // 3x3 采样
  float tl = dot(texture2D(tex, uv + texelSize * vec2(-1.0, -1.0)).rgb, vec3(0.299, 0.587, 0.114));
  float tm = dot(texture2D(tex, uv + texelSize * vec2( 0.0, -1.0)).rgb, vec3(0.299, 0.587, 0.114));
  float tr = dot(texture2D(tex, uv + texelSize * vec2( 1.0, -1.0)).rgb, vec3(0.299, 0.587, 0.114));
  float ml = dot(texture2D(tex, uv + texelSize * vec2(-1.0,  0.0)).rgb, vec3(0.299, 0.587, 0.114));
  float mr = dot(texture2D(tex, uv + texelSize * vec2( 1.0,  0.0)).rgb, vec3(0.299, 0.587, 0.114));
  float bl = dot(texture2D(tex, uv + texelSize * vec2(-1.0,  1.0)).rgb, vec3(0.299, 0.587, 0.114));
  float bm = dot(texture2D(tex, uv + texelSize * vec2( 0.0,  1.0)).rgb, vec3(0.299, 0.587, 0.114));
  float br = dot(texture2D(tex, uv + texelSize * vec2( 1.0,  1.0)).rgb, vec3(0.299, 0.587, 0.114));

  // Sobel 卷积
  float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
  float gy = -tl - 2.0 * tm - tr + bl + 2.0 * bm + br;

  return sqrt(gx * gx + gy * gy);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 texelSize = edgeWidth / resolution;

  // 边缘检测
  float edge = sobel(inputBuffer, uv, texelSize);

  // 阈值处理 - 更锐利的边缘
  edge = smoothstep(threshold, threshold * 1.5, edge);

  // 混合边缘颜色 - 降低混合强度
  vec3 color = inputColor.rgb;
  color = mix(color, edgeColor, edge * 0.4);

  // 添加轻微边缘发光
  color += edgeColor * edge * 0.15;

  outputColor = vec4(color, inputColor.a);
}
`;

interface BlueprintEdgeEffectImplProps {
  edgeColor?: Color;
  threshold?: number;
  edgeWidth?: number;
  resolution?: Vector2;
}

class BlueprintEdgeEffectImpl extends Effect {
  constructor({
    edgeColor = new Color('#00FFFF'),
    threshold = 0.1,
    edgeWidth = 1.0,
    resolution = new Vector2(1920, 1080),
  }: BlueprintEdgeEffectImplProps = {}) {
    super('BlueprintEdgeEffect', blueprintEdgeFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['edgeColor', new Uniform(edgeColor)],
        ['threshold', new Uniform(threshold)],
        ['edgeWidth', new Uniform(edgeWidth)],
        ['resolution', new Uniform(resolution)],
      ]),
    });
  }

  setSize(width: number, height: number) {
    const resolution = this.uniforms.get('resolution');
    if (resolution) {
      resolution.value.set(width, height);
    }
  }
}

interface BlueprintEdgeEffectProps {
  edgeColor?: string;
  threshold?: number;
  edgeWidth?: number;
}

export const BlueprintEdgeEffect = forwardRef<Effect, BlueprintEdgeEffectProps>(
  function BlueprintEdgeEffect(
    { edgeColor = '#00FFFF', threshold = 0.25, edgeWidth = 1.5 },
    ref
  ) {
    const effect = useMemo(
      () =>
        new BlueprintEdgeEffectImpl({
          edgeColor: new Color(edgeColor),
          threshold,
          edgeWidth,
        }),
      [edgeColor, threshold, edgeWidth]
    );

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
