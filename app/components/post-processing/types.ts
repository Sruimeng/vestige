/**
 * Post-Processing System Types
 * @description 后处理系统类型定义
 */

/** 风格滤镜枚举 */
export type StyleFilter =
  | 'default'
  | 'blueprint'
  | 'halftone'
  | 'ascii'
  | 'sketch'
  | 'glitch'
  | 'crystal'
  | 'claymation'
  | 'pixel';

/** 滤镜实现类型 */
export type FilterCategory = 'post' | 'material' | 'hybrid';

/** 性能等级 */
export type PerformanceLevel = 1 | 2 | 3;

/** 风格滤镜配置 */
export interface StyleFilterConfig {
  id: StyleFilter;
  label: string;
  category: FilterCategory;
  performance: PerformanceLevel;
}

/** Vignette 配置 */
export interface VignetteConfig {
  enabled: boolean;
  offset: number;
  darkness: number;
}

/** Scanline 配置 */
export interface ScanlineConfig {
  enabled: boolean;
  density: number;
}

/** Bloom 配置 */
export interface BloomConfig {
  enabled: boolean;
  intensity: number;
  threshold: number;
  radius: number;
}

/** Chromatic Aberration 配置 */
export interface ChromaticAberrationConfig {
  enabled: boolean;
  offset: [number, number];
}

/** Noise 配置 */
export interface NoiseConfig {
  enabled: boolean;
  opacity: number;
}

/** 后处理效果配置 */
export interface PostProcessingConfig {
  vignette: VignetteConfig;
  scanline: ScanlineConfig;
  bloom: BloomConfig;
  chromaticAberration: ChromaticAberrationConfig;
  noise: NoiseConfig;
}

/** 系统状态 */
export type SystemState =
  | 'IDLE'
  | 'SCROLLING'
  | 'CHECKING'
  | 'CONSTRUCTING'
  | 'MATERIALIZED'
  | 'ERROR';

/** 滤镜上下文值 */
export interface StyleFilterContextValue {
  filter: StyleFilter;
  setFilter: (filter: StyleFilter) => void;
  config: PostProcessingConfig;
  setConfig: (config: Partial<PostProcessingConfig>) => void;
  systemState: SystemState;
  setSystemState: (state: SystemState) => void;
  isMobile: boolean;
  gpuTier: number;
}
