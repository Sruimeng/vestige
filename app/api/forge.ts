/**
 * Forge API 模块
 */

import { API_BASE_URL, API_ENDPOINTS, POLL_INTERVAL, MAX_POLL_DURATION, APP_ID } from '@/constants/api';
import type { ForgeCreateRequest, ForgeCreateResponse, ForgeStatusResponse, ForgeAssetsResponse, ApiV5Error } from '@/types/time-capsule';
import { ForgeCreateResponseSchema, ForgeStatusSchema, ForgeAssetsResponseSchema } from '@/types/time-capsule';

class ForgeApiError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ForgeApiError';
  }
}

/**
 * 创建 Forge 任务
 */
export async function createForge(request: ForgeCreateRequest): Promise<ForgeCreateResponse> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FORGE_CREATE}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': APP_ID,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ApiV5Error = await response.json().catch(() => ({
      code: 'forge_error',
      message: `HTTP ${response.status}`,
    }));
    throw new ForgeApiError(error.code, error.message);
  }

  const json = await response.json();
  return ForgeCreateResponseSchema.parse(json.data);
}

/**
 * 查询 Forge 任务状态
 */
export async function getForgeStatus(taskId: string): Promise<ForgeStatusResponse> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FORGE_STATUS(taskId)}`;
  const response = await fetch(url, {
    headers: { 'X-App-ID': APP_ID },
  });

  if (!response.ok) {
    const error: ApiV5Error = await response.json().catch(() => ({
      code: 'forge_error',
      message: `HTTP ${response.status}`,
    }));
    throw new ForgeApiError(error.code, error.message);
  }

  const json = await response.json();
  return ForgeStatusSchema.parse(json.data);
}

/**
 * 查询 context 关联的 Forge assets
 */
export async function getForgeAssets(contextId: string): Promise<ForgeAssetsResponse> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FORGE_ASSETS}?context_id=${encodeURIComponent(contextId)}`;
  const response = await fetch(url, {
    headers: { 'X-App-ID': APP_ID },
  });

  if (!response.ok) {
    const error: ApiV5Error = await response.json().catch(() => ({
      code: 'forge_error',
      message: `HTTP ${response.status}`,
    }));
    throw new ForgeApiError(error.code, error.message);
  }

  const json = await response.json();
  return ForgeAssetsResponseSchema.parse(json.data);
}

/**
 * 轮询 Forge 任务直到完成
 */
export async function pollForgeUntilDone(
  taskId: string,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
): Promise<ForgeStatusResponse> {
  const startTime = Date.now();

  while (true) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const status = await getForgeStatus(taskId);
    onProgress?.(status.progress_percent);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new ForgeApiError('forge_failed', status.error_message || 'Forge task failed');
    }

    if (Date.now() - startTime > MAX_POLL_DURATION) {
      throw new ForgeApiError('timeout', 'Forge polling timeout');
    }

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(resolve, POLL_INTERVAL);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }
}

export { ForgeApiError };
