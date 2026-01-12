/**
 * Post-Processing Constants
 * @description 后处理系统常量配置
 */

import type {
  PostProcessingConfig,
  StyleFilterConfig,
  StyleFilter,
} from './types';

/** 默认后处理配置 - 增强版 */
export const DEFAULT_POST_PROCESSING: PostProcessingConfig = {
  vignette: {
    enabled: true,
    offset: 0.3,      // 更靠近中心
    darkness: 0.6,    // 更暗的边缘
  },
  scanline: {
    enabled: true,
    density: 2.0,     // 更密集的扫描线
  },
  bloom: {
    enabled: false,
    intensity: 0.8,
    threshold: 0.6,  // 降低阈值，让更多高光触发 Bloom
    radius: 0.5,
  },
  chromaticAberration: {
    enabled: false,
    offset: [0.003, 0.003],
  },
  noise: {
    enabled: true,    // 默认开启噪点
    opacity: 0.05,    // 轻微噪点
  },
};

/** 风格滤镜配置列表 */
export const STYLE_FILTERS: StyleFilterConfig[] = [
  { id: 'default', label: '默认', category: 'post', performance: 1 },
  { id: 'blueprint', label: '工程模式', category: 'hybrid', performance: 2 },
  { id: 'halftone', label: '旧时光', category: 'post', performance: 1 },
  { id: 'ascii', label: '黑客', category: 'post', performance: 2 },
  { id: 'pixel', label: '复古像素', category: 'material', performance: 2 },
  { id: 'sketch', label: '艺术馆', category: 'hybrid', performance: 2 },
  { id: 'glitch', label: '赛博故障', category: 'post', performance: 2 },
  { id: 'crystal', label: '水晶展台', category: 'material', performance: 3 },
  { id: 'claymation', label: '粘土动画', category: 'material', performance: 2 },
];

/** 根据 ID 获取滤镜配置 */
export const getFilterConfig = (id: StyleFilter): StyleFilterConfig => {
  return STYLE_FILTERS.find((f) => f.id === id) ?? STYLE_FILTERS[0];
};

/** 颜色常量 */
export const COLORS = {
  // 主色调
  primary: '#3B82F6',
  // 全息蓝图
  cyan: '#00FFFF',
  electricBlue: '#3B82F6',
  neonGreen: '#39FF14',
  // 黑客矩阵
  matrixGreen: '#00FF00',
  // 背景
  deepSpace: '#050505',
} as const;
