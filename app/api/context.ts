/**
 * API v5 Context 模块
 */

import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT, APP_ID } from '@/constants/api';
import type { HistoryContext, DailyContext, FossilContext, ApiV5Error } from '@/types/time-capsule';
import { HistoryContextSchema, DailyContextSchema, FossilContextSchema } from '@/types/time-capsule';

class ContextApiError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ContextApiError';
  }
}

async function fetchWithTimeout(url: string, timeout = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'X-App-ID': APP_ID },
    });
  } finally {
    clearTimeout(id);
  }
}

async function handleResponse<T>(response: Response, schema: { parse: (data: unknown) => T }): Promise<T> {
  if (!response.ok) {
    const error: ApiV5Error = await response.json().catch(() => ({
      code: 'unknown',
      message: `HTTP ${response.status}`,
    }));
    throw new ContextApiError(error.code, error.message);
  }

  const json = await response.json();
  return schema.parse(json.data);
}

/**
 * 获取历史年份 Context
 */
export async function fetchHistory(year: number): Promise<HistoryContext> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.HISTORY(year)}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response, HistoryContextSchema);
}

/**
 * 获取每日 Context
 */
export async function fetchDaily(date?: string): Promise<DailyContext> {
  let url = `${API_BASE_URL}${API_ENDPOINTS.DAILY}`;
  if (date) url += `?date=${date}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response, DailyContextSchema);
}

/**
 * 获取未来化石 Context
 */
export async function fetchFossil(year: number): Promise<FossilContext> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FOSSIL(year)}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response, FossilContextSchema);
}

export { ContextApiError };
