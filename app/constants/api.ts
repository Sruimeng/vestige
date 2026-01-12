/**
 * Time Capsule API 配置
 */

// API 基础 URL
export const API_BASE_URL = 'https://api.sruim.xin';

// 是否使用 Mock 数据（当 API 不可用时）
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// API 超时时间（毫秒）
export const API_TIMEOUT = 10000; // 10秒

// 生成等待超时时间（毫秒）- 已弃用，改用轮询机制
export const GENERATION_TIMEOUT = 90000; // 90秒（实际生成约60秒）

// 轮询间隔（毫秒）
export const POLL_INTERVAL = 3000; // 3秒

// 轮询最大总时长（毫秒）- 超过此时间停止轮询
export const MAX_POLL_DURATION = 300000; // 5分钟

// 最大重试次数
export const MAX_RETRIES = 3;

// 重试延迟（毫秒）
export const RETRY_DELAY = 1000; // 1秒

// API 端点
export const API_ENDPOINTS = {
  TIME_CAPSULE: (year: number) => `/api/time-capsule/${year}`,
  FUTURE_FOSSILS: (year: number) => `/api/future-fossils/${year}`,
  HEALTH: '/health',
  PROXY_MODEL: '/api/proxy-model',
} as const;

/**
 * 获取当前年份
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * 判断是否应使用 Future Fossils API
 * 规则：year >= 当前年份 使用 Future Fossils
 */
export function shouldUseFutureFossils(year: number): boolean {
  return year >= getCurrentYear();
}

/**
 * 根据年份获取对应的 API 端点
 */
export function getApiEndpoint(year: number): string {
  if (shouldUseFutureFossils(year)) {
    return API_ENDPOINTS.FUTURE_FOSSILS(year);
  }
  return API_ENDPOINTS.TIME_CAPSULE(year);
}

// 错误代码
export const ERROR_CODES = {
  INVALID_YEAR: 'invalid_year',
  GENERATION_FAILED: 'generation_failed',
  TIMEOUT: 'timeout',
  NETWORK_ERROR: 'network_error',
} as const;

// 错误消息映射
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.INVALID_YEAR]: '年份无效，请选择 -500 到 2100 之间的年份',
  [ERROR_CODES.GENERATION_FAILED]: '生成失败，请稀后重试',
  [ERROR_CODES.TIMEOUT]: '请求超时，请检查网络连接',
  [ERROR_CODES.NETWORK_ERROR]: '网络错误，请检查网络连接',
};

// Fallback 模型 URL (用于演示/fallback)
export const FALLBACK_MODEL_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';

/**
 * 处理模型 URL
 * - 强制转换为 https
 * - 如果 URL 为空，返回 fallback 模型
 * - 如果是 tripo3d.com 的 URL，通过代理访问以解决 CORS 问题
 */
export function processModelUrl(url: string): string {
  if (!url) return FALLBACK_MODEL_URL;

  // 强制转换为 https
  const httpsUrl = url.replace(/^http:/, 'https:');

  // 如果是 tripo3d.com 的 URL，通过代理访问
  if (httpsUrl.includes('tripo3d.com')) {
    return `${API_BASE_URL}${API_ENDPOINTS.PROXY_MODEL}?url=${encodeURIComponent(httpsUrl)}`;
  }

  return httpsUrl;
}
