/**
 * Time Capsule API 配置 (v5)
 */

// API 基础 URL
export const API_BASE_URL = 'https://api.sruim.xin';

// App ID (用于 API 认证)
export const APP_ID = '204bb605-dd38-4c3b-90b5-d1055310051b';

// 是否使用 Mock 数据（当 API 不可用时）
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// API 超时时间（毫秒）
export const API_TIMEOUT = 10000;

// 轮询间隔（毫秒）
export const POLL_INTERVAL = 3000;

// 轮询最大总时长（毫秒）
export const MAX_POLL_DURATION = 300000;

// API 端点
export const API_ENDPOINTS = {
  HISTORY: (year: number) => `/api/context/history/${year}`,
  FOSSIL: (year: number) => `/api/context/fossil/${year}`,
  DAILY: '/api/context/daily',
  MIX: '/api/context/mix',
  FORGE_CREATE: '/api/forge/create',
  FORGE_STATUS: (id: string) => `/api/forge/status/${id}`,
  FORGE_ASSETS: '/api/forge/assets',
  PROXY_MODEL: '/api/proxy-model',
} as const;

/**
 * 获取当前年份
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * 判断是否应使用 Daily API
 */
export function shouldUseDaily(year: number): boolean {
  return year >= getCurrentYear();
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

// Fallback 模型 URL
export const FALLBACK_MODEL_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';

/**
 * 处理模型 URL
 */
export function processModelUrl(url: string): string {
  if (!url) return FALLBACK_MODEL_URL;

  const httpsUrl = url.replace(/^http:/, 'https:');

  if (httpsUrl.includes('tripo3d.com')) {
    return `${API_BASE_URL}${API_ENDPOINTS.PROXY_MODEL}?url=${encodeURIComponent(httpsUrl)}`;
  }

  return httpsUrl;
}

/**
 * 判断 URL 是否需要代理（需要带 X-App-ID header）
 */
export function isProxyUrl(url: string): boolean {
  return url.startsWith(API_BASE_URL) && url.includes(API_ENDPOINTS.PROXY_MODEL);
}

/**
 * 下载模型为 Blob URL（用于需要认证的代理请求）
 */
export async function fetchModelAsBlob(url: string): Promise<string> {
  if (!isProxyUrl(url)) {
    return url;
  }

  const response = await fetch(url, {
    headers: { 'X-App-ID': APP_ID },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch model: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
