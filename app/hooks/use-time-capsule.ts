/**
 * Time Capsule Hook
 * 封装 API 调用和状态管理
 */

import { useCallback, useEffect, useRef } from 'react';

import {
  API_BASE_URL,
  API_TIMEOUT,
  ERROR_CODES,
  ERROR_MESSAGES,
  MAX_POLL_DURATION,
  POLL_INTERVAL,
  processModelUrl,
  USE_MOCK,
  getApiEndpoint,
  shouldUseFutureFossils,
} from '@/constants/api';
import { useTimeCapsuleStore } from '@/store/time-capsule';
import type {
  TimeCapsuleData,
  TimeCapsuleErrorResponse,
  TimeCapsuleGeneratingResponse,
  CapsuleData,
  FutureFossilsData,
} from '@/types/time-capsule';
import { YEAR_MAX, YEAR_MIN } from '@/types/time-capsule';

// ============================================================================
// Mock 数据生成（开发调试用）
// ============================================================================

/**
 * 生成 Mock 数据 (Time Capsule)
 */
function generateMockData(year: number): TimeCapsuleData {
  const isBC = year < 0;
  const absYear = Math.abs(year);
  const yearDisplay = isBC ? `公元前 ${absYear} 年` : `公元 ${year} 年`;

  const mockEvents = [
    {
      title: `${yearDisplay}的重大发现`,
      description: '这一年，人类在探索未知的道路上迈出了重要一步。',
      category: 'science' as const,
    },
    {
      title: `${yearDisplay}的社会变革`,
      description: '社会结构发生了深刻的变化，影响了此后数百年的发展。',
      category: 'politics' as const,
    },
    {
      title: `${yearDisplay}的文化繁荣`,
      description: '艺术与思想在这一时期达到了新的高度。',
      category: 'culture' as const,
    },
  ];

  const mockSymbols = ['时间之轮', '永恒之火', '智慧之眼', '命运之线'];

  return {
    year,
    year_display: yearDisplay,
    events: mockEvents,
    symbols: mockSymbols,
    synthesis: `一枚凝聚了 ${yearDisplay} 精华的神秘物体，表面刻有古老的符文。`,
    philosophy: `${yearDisplay}，是人类历史长河中的一个节点。在这里，过去与未来交汇，时间的本质在此显现。`,
    model_url: '',
    generated_at: new Date().toISOString(),
  };
}

/**
 * 生成 Mock 数据 (Future Fossils - Misread 模式)
 */
function generateMockFossilData(year: number): FutureFossilsData {
  const yearDisplay = `公元 ${year} 年`;

  const mockEvents = [
    {
      title: '散热神坛出土',
      description: '发现大量带有风扇结构的祭祀平台，推测为高级祭司专用。',
      category: 'ritual' as const,
    },
    {
      title: '发光祈祷板遗迹',
      description: '一种能发出蓝光的薄板，上面刻有神秘符号，疑似用于与神灵沟通。',
      category: 'unknown' as const,
    },
    {
      title: '数据祭品容器',
      description: '小型金属盒，内部结构极其复杂，可能用于存储献给神灵的祭品。',
      category: 'technology' as const,
    },
  ];

  const mockSymbols = ['散热神坛', '发光祈祷板', '数据祭品', '算力图腾'];

  return {
    year,
    year_display: yearDisplay,
    mode: 'misread',
    events: mockEvents,
    symbols: mockSymbols,
    synthesis: `一块化石化的显卡，风扇叶片已石化，表面覆盖着苔藓。`,
    philosophy: `这个文明崇拜一种名为"算力"的无形神灵，他们相信通过不断的"挖矿"仪式可以获得神灵的庇佑。`,
    archaeologist_report: `编号 XA-${year}-07：本遗物被确认为高级祭司专用的"散热神坛"。根据周围出土的"发光祈祷板"和"数据祭品"判断，这是一处重要的宗教场所。该文明似乎相信通过复杂的电子仪式可以与"云端"神灵建立连接。`,
    model_url: '',
    generated_at: new Date().toISOString(),
  };
}

/**
 * 根据年份生成对应的 Mock 数据
 */
function generateMockDataForYear(year: number): CapsuleData {
  if (shouldUseFutureFossils(year)) {
    return generateMockFossilData(year);
  }
  return generateMockData(year);
}

/**
 * 模拟 API 调用延迟（开发用）
 */
async function simulateApiCall(
  year: number,
  onProgress?: (p: number) => void,
  signal?: AbortSignal
): Promise<CapsuleData> {
  const totalSteps = 20;
  const stepDelay = 150; // 3秒总时长

  for (let i = 1; i <= totalSteps; i++) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    await new Promise((resolve) => setTimeout(resolve, stepDelay));
    onProgress?.(Math.round((i / totalSteps) * 100));
  }

  return generateMockDataForYear(year);
}

// ============================================================================
// API 工具函数
// ============================================================================

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // 合并外部 signal
  const externalSignal = options.signal;
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 解析 API 错误
 */
function parseApiError(response: Response, data?: TimeCapsuleErrorResponse): string {
  if (data?.error) {
    return ERROR_MESSAGES[data.error] || data.message || `请求失败 (${response.status})`;
  }
  if (response.status === 400) {
    return ERROR_MESSAGES[ERROR_CODES.INVALID_YEAR];
  }
  if (response.status >= 500) {
    return ERROR_MESSAGES[ERROR_CODES.GENERATION_FAILED];
  }
  return `请求失败 (${response.status})`;
}

// ============================================================================
// API 响应类型（与后端匹配）
// ============================================================================

/** 特殊错误类型：年份无效，应显示占位 */
class InvalidYearError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidYearError';
  }
}

/** 特殊错误类型：网络/服务器错误，应回退到 mock */
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/** 成功响应：{ data: CapsuleData } */
interface ApiSuccessResponse {
  data: CapsuleData;
}

/** fetchOnce 返回结果类型 */
type FetchResult =
  | { type: 'success'; data: CapsuleData }
  | { type: 'generating'; waitSeconds: number }
  | { type: 'retry' };

// ============================================================================
// useTimeCapsule Hook
// ============================================================================

export function useTimeCapsule() {
  const store = useTimeCapsuleStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 清理进度定时器
   */
  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  /**
   * 清理轮询定时器
   */
  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /**
   * 启动模拟进度（用于长时间等待时显示进度）
   */
  const startProgressSimulation = useCallback(() => {
    clearProgressTimer();
    const startTime = Date.now();

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // 3分钟内从 5% 到 95%
      const progress = Math.min(5 + Math.round((elapsed / MAX_POLL_DURATION) * 90), 95);
      store.setProgress(progress);
    }, 1000);
  }, [store, clearProgressTimer]);

  /**
   * 单次请求时间胶囊数据
   * @returns FetchResult 指示成功、正在生成（需等待）、或需重试
   */
  const fetchOnce = useCallback(
    async (url: string, userSignal: AbortSignal): Promise<FetchResult> => {
      try {
        const response = await fetchWithTimeout(url, { signal: userSignal }, API_TIMEOUT);

        // 200: 数据已存在，直接返回
        if (response.status === 200) {
          const result: ApiSuccessResponse = await response.json();
          if (!result.data) {
            return { type: 'retry' };
          }
          return {
            type: 'success',
            data: {
              ...result.data,
              model_url: processModelUrl(result.data.model_url),
            },
          };
        }

        // 202: 正在生成中，返回等待时间
        if (response.status === 202) {
          const generating: TimeCapsuleGeneratingResponse = await response.json();
          const waitSeconds = Math.min(generating.estimated_seconds, 5); // 最多等 5 秒
          return { type: 'generating', waitSeconds };
        }

        // 400: 年份无效
        if (response.status === 400) {
          let errorData: TimeCapsuleErrorResponse | undefined;
          try {
            errorData = await response.json();
          } catch {
            // JSON 解析失败
          }
          throw new InvalidYearError(parseApiError(response, errorData));
        }

        // 其他错误状态
        let errorData: TimeCapsuleErrorResponse | undefined;
        try {
          errorData = await response.json();
        } catch {
          // JSON 解析失败
        }
        throw new Error(parseApiError(response, errorData));
      } catch (error) {
        // 用户主动取消
        if ((error as Error).name === 'AbortError') {
          if (userSignal.aborted) {
            throw error;
          }
          // 单次请求超时，返回重试
          console.warn('Request timeout, will retry');
          return { type: 'retry' };
        }
        if ((error as Error).name === 'InvalidYearError') {
          throw error;
        }
        // 网络错误直接抛出
        if ((error as Error).name === 'TypeError' || (error as Error).message?.includes('fetch')) {
          throw new NetworkError((error as Error).message || '网络错误');
        }
        // 其他错误返回重试
        console.warn('Fetch attempt failed, will retry:', (error as Error).message);
        return { type: 'retry' };
      }
    },
    []
  );

  /**
   * 请求时间胶囊数据（带轮询）
   */
  const fetchCapsule = useCallback(
    async (year: number) => {
      // 验证年份范围
      if (year < YEAR_MIN || year > YEAR_MAX) {
        store.setError(`年份必须在 ${YEAR_MIN} 到 ${YEAR_MAX} 之间`);
        store.setSystemState('ERROR');
        return;
      }

      // 处理公元 0 年（历史上不存在）
      const targetYear = year === 0 ? 1 : year;

      // 取消之前的请求和定时器
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearProgressTimer();
      clearPollTimer();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        store.setSystemState('CHECKING');
        store.setError(null);
        store.setProgress(0);

        let data: CapsuleData;

        if (USE_MOCK) {
          // ====== Mock 模式 ======
          store.setSystemState('CONSTRUCTING');
          data = await simulateApiCall(targetYear, store.setProgress, abortController.signal);
        } else {
          // ====== 真实 API 调用（轮询模式）======
          // 根据年份自动选择 API 端点
          const url = `${API_BASE_URL}${getApiEndpoint(targetYear)}`;
          const pollStartTime = Date.now();

          // 第一次尝试
          let result = await fetchOnce(url, abortController.signal);

          if (result.type === 'success') {
            // 缓存命中，直接返回
            data = result.data;
          } else {
            // 需要生成，进入轮询模式
            store.setSystemState('CONSTRUCTING');
            store.setProgress(5);
            startProgressSimulation();

            // 轮询直到成功或超时
            while (result.type !== 'success') {
              // 检查是否被取消
              if (abortController.signal.aborted) {
                throw new DOMException('Aborted', 'AbortError');
              }

              // 检查是否超过最大轮询时长
              if (Date.now() - pollStartTime > MAX_POLL_DURATION) {
                throw new Error(ERROR_MESSAGES[ERROR_CODES.TIMEOUT]);
              }

              // 根据返回类型决定等待时间
              const waitMs =
                result.type === 'generating'
                  ? result.waitSeconds * 1000 // 使用服务器返回的 estimated_seconds
                  : POLL_INTERVAL; // retry 时使用默认间隔

              // 等待轮询间隔
              await new Promise<void>((resolve, reject) => {
                const timeoutId = setTimeout(resolve, waitMs);
                pollTimerRef.current = timeoutId;
                // 如果被取消，清除定时器并拒绝
                abortController.signal.addEventListener('abort', () => {
                  clearTimeout(timeoutId);
                  reject(new DOMException('Aborted', 'AbortError'));
                });
              });

              // 再次请求
              result = await fetchOnce(url, abortController.signal);
            }

            clearProgressTimer();
            data = result.data;
          }
        }

        store.setCapsuleData(data);
        store.setSystemState('MATERIALIZED');
        store.setProgress(100);
      } catch (error) {
        clearProgressTimer();
        clearPollTimer();
        if ((error as Error).name === 'AbortError') {
          return; // 请求被取消，忽略
        }

        // 年份无效或服务器错误时，回退到 mock 数据 + 占位球体
        const isInvalidYear = (error as Error).name === 'InvalidYearError';
        if (isInvalidYear) {
          console.warn('Invalid year, falling back to mock:', (error as Error).message);
        } else {
          console.warn('Server error, falling back to mock:', (error as Error).message);
        }

        // 使用 mock 数据（model_url 为空会显示占位球体）
        const mockData = generateMockDataForYear(targetYear);
        store.setCapsuleData(mockData);
        store.setSystemState('MATERIALIZED');
        store.setProgress(100);
      }
    },
    [store, clearProgressTimer, clearPollTimer, startProgressSimulation, fetchOnce]
  );

  /**
   * 带防抖的年份变化处理
   */
  const handleYearChange = useCallback(
    (year: number) => {
      store.setYear(year);
      store.setSystemState('SCROLLING');

      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的防抖定时器
      debounceTimerRef.current = setTimeout(() => {
        fetchCapsule(year);
      }, 500);
    },
    [store, fetchCapsule]
  );

  /**
   * 重试当前年份
   */
  const retry = useCallback(() => {
    fetchCapsule(store.currentYear);
  }, [fetchCapsule, store.currentYear]);

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      clearProgressTimer();
      clearPollTimer();
    };
  }, [clearProgressTimer, clearPollTimer]);

  return {
    // 状态
    year: store.currentYear,
    systemState: store.systemState,
    capsuleData: store.capsuleData,
    error: store.error,
    progress: store.progress,

    // 动作
    setYear: handleYearChange,
    fetchCapsule,
    retry,
    reset: store.reset,
  };
}
