/**
 * Post-Processing Module
 * @description 后处理系统模块入口
 *
 * 使用方式:
 * ```tsx
 * import {
 *   StyleFilterProvider,
 *   useStyleFilter,
 *   PostProcessingComposer,
 *   STYLE_FILTERS,
 * } from '@/components/post-processing';
 *
 * // 在 Canvas 外层包裹 Provider
 * <StyleFilterProvider>
 *   <Canvas>
 *     <PostProcessingComposer />
 *     <YourScene />
 *   </Canvas>
 * </StyleFilterProvider>
 *
 * // 在组件中使用
 * const { filter, setFilter } = useStyleFilter();
 * ```
 */

// Types
export type {
  StyleFilter,
  FilterCategory,
  PerformanceLevel,
  StyleFilterConfig,
  PostProcessingConfig,
  VignetteConfig,
  ScanlineConfig,
  BloomConfig,
  ChromaticAberrationConfig,
  NoiseConfig,
  SystemState,
  StyleFilterContextValue,
} from './types';

// Constants
export {
  DEFAULT_POST_PROCESSING,
  STYLE_FILTERS,
  getFilterConfig,
  COLORS,
} from './constants';

// Context & Hooks
export { StyleFilterProvider, useStyleFilter } from './context';

// Main Composer (基础后处理效果)
export { PostProcessingComposer } from './composer';

// Base Effects
export { BaseEffects, ScanlineEffect } from './effects';

// Materials (材质替换滤镜)
export {
  BlueprintMaterial,
  HalftoneMaterial,
  SketchMaterial,
  GlitchMaterial,
  CrystalMaterial,
  ClaymationMaterial,
  PixelMaterial,
} from './materials';

// Backgrounds (滤镜专属背景)
export {
  BlueprintGridBackground,
  MatrixRainBackground,
  NewspaperBackground,
  SketchbookBackground,
} from './backgrounds';
