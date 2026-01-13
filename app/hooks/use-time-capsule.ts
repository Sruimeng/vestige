/**
 * Time Capsule Hook
 */

import { useCallback, useEffect, useRef } from 'react';

import {
  MAX_POLL_DURATION,
  processModelUrl,
  USE_MOCK,
  getCurrentYear,
} from '@/constants/api';
import { useTimeCapsuleStore } from '@/store/time-capsule';
import type {
  TimeCapsuleData,
  CapsuleData,
  FutureFossilsData,
} from '@/types/time-capsule';
import { YEAR_MAX, YEAR_MIN } from '@/types/time-capsule';
import { fetchHistory, fetchDaily } from '@/api/context';
import { createForge, pollForgeUntilDone, getForgeAssets } from '@/api/forge';

// ============================================================================
// Mock 数据生成（开发调试用）
// ============================================================================

function generateMockData(year: number): TimeCapsuleData {
  const isBC = year < 0;
  const absYear = Math.abs(year);
  const yearDisplay = isBC ? `公元前 ${absYear} 年` : `公元 ${year} 年`;

  return {
    year,
    year_display: yearDisplay,
    events: [
      { title: `${yearDisplay}的重大发现`, description: '这一年，人类在探索未知的道路上迈出了重要一步。', category: 'science' },
      { title: `${yearDisplay}的社会变革`, description: '社会结构发生了深刻的变化，影响了此后数百年的发展。', category: 'politics' },
      { title: `${yearDisplay}的文化繁荣`, description: '艺术与思想在这一时期达到了新的高度。', category: 'culture' },
    ],
    symbols: ['时间之轮', '永恒之火', '智慧之眼', '命运之线'],
    synthesis: `一枚凝聚了 ${yearDisplay} 精华的神秘物体，表面刻有古老的符文。`,
    philosophy: `${yearDisplay}，是人类历史长河中的一个节点。在这里，过去与未来交汇，时间的本质在此显现。`,
    model_url: '',
    generated_at: new Date().toISOString(),
  };
}

function generateMockFossilData(year: number): FutureFossilsData {
  const yearDisplay = `公元 ${year} 年`;

  return {
    year,
    year_display: yearDisplay,
    mode: 'misread',
    events: [
      { title: '散热神坛出土', description: '发现大量带有风扇结构的祭祀平台，推测为高级祭司专用。', category: 'ritual' },
      { title: '发光祈祷板遗迹', description: '一种能发出蓝光的薄板，上面刻有神秘符号，疑似用于与神灵沟通。', category: 'unknown' },
      { title: '数据祭品容器', description: '小型金属盒，内部结构极其复杂，可能用于存储献给神灵的祭品。', category: 'technology' },
    ],
    symbols: ['散热神坛', '发光祈祷板', '数据祭品', '算力图腾'],
    synthesis: `一块化石化的显卡，风扇叶片已石化，表面覆盖着苔藓。`,
    philosophy: `这个文明崇拜一种名为"算力"的无形神灵，他们相信通过不断的"挖矿"仪式可以获得神灵的庇佑。`,
    archaeologist_report: `编号 XA-${year}-07：本遗物被确认为高级祭司专用的"散热神坛"。`,
    model_url: '',
    generated_at: new Date().toISOString(),
  };
}

function generateMockDataForYear(year: number): CapsuleData {
  return year >= getCurrentYear() ? generateMockFossilData(year) : generateMockData(year);
}

async function simulateApiCall(
  year: number,
  onProgress?: (p: number) => void,
  signal?: AbortSignal
): Promise<CapsuleData> {
  const totalSteps = 20;
  const stepDelay = 150;

  for (let i = 1; i <= totalSteps; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise((resolve) => setTimeout(resolve, stepDelay));
    onProgress?.(Math.round((i / totalSteps) * 100));
  }

  return generateMockDataForYear(year);
}

// ============================================================================
// v5 -> Legacy 转换
// ============================================================================

function historyToLegacy(ctx: { year: number; year_display: string; events: TimeCapsuleData['events']; symbols: string[]; synthesis: string; philosophy: string }, modelUrl: string): TimeCapsuleData {
  return {
    year: ctx.year,
    year_display: ctx.year_display,
    events: ctx.events,
    symbols: ctx.symbols,
    synthesis: ctx.synthesis,
    philosophy: ctx.philosophy,
    model_url: modelUrl,
    generated_at: new Date().toISOString(),
  };
}

function dailyToLegacy(ctx: { date: string; news: { title: string; content: string }[]; philosophy: string; suggested_prompt: string; keywords: string[] }, modelUrl: string): FutureFossilsData {
  const year = new Date(ctx.date).getFullYear();

  return {
    year,
    year_display: `公元 ${year} 年`,
    mode: 'history',
    events: ctx.news.map((n) => ({
      title: n.title,
      description: n.content,
      category: 'culture' as const,
    })),
    symbols: ctx.keywords,
    synthesis: ctx.suggested_prompt.slice(0, 50),
    philosophy: ctx.philosophy,
    model_url: modelUrl,
    generated_at: new Date().toISOString(),
  };
}

// ============================================================================
// useTimeCapsule Hook
// ============================================================================

export function useTimeCapsule(initialYear?: number) {
  const store = useTimeCapsuleStore();
  const initializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressSimulation = useCallback(() => {
    clearProgressTimer();
    const startTime = Date.now();

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(5 + Math.round((elapsed / MAX_POLL_DURATION) * 90), 95);
      store.setProgress(progress);
    }, 1000);
  }, [store, clearProgressTimer]);

  const fetchCapsule = useCallback(
    async (year: number) => {
      if (year < YEAR_MIN || year > YEAR_MAX) {
        store.setError(`年份必须在 ${YEAR_MIN} 到 ${YEAR_MAX} 之间`);
        store.setSystemState('ERROR');
        return;
      }

      const targetYear = year === 0 ? 1 : year;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearProgressTimer();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        store.setSystemState('CHECKING');
        store.setError(null);
        store.setProgress(0);

        let data: CapsuleData;

        if (USE_MOCK) {
          store.setSystemState('CONSTRUCTING');
          data = await simulateApiCall(targetYear, store.setProgress, abortController.signal);
        } else {
          const isDaily = targetYear >= getCurrentYear();

          if (isDaily) {
            const ctx = await fetchDaily();

            // 检查缓存
            const cached = await getForgeAssets(ctx.context_id);
            const completedAsset = cached.assets.find((a) => a.status === 'completed' && a.model_url);

            if (completedAsset) {
              const modelUrl = processModelUrl(completedAsset.model_url || '');
              data = dailyToLegacy(ctx, modelUrl);
            } else {
              store.setSystemState('CONSTRUCTING');
              store.setProgress(10);
              startProgressSimulation();

              const forgeRes = await createForge({ context_id: ctx.context_id });
              const status = await pollForgeUntilDone(
                forgeRes.task_id,
                abortController.signal,
                store.setProgress
              );

              clearProgressTimer();
              const modelUrl = processModelUrl(status.model_url || '');
              data = dailyToLegacy(ctx, modelUrl);
            }
          } else {
            const ctx = await fetchHistory(targetYear);

            // 检查缓存
            const cached = await getForgeAssets(ctx.context_id);
            const completedAsset = cached.assets.find((a) => a.status === 'completed' && a.model_url);

            if (completedAsset) {
              const modelUrl = processModelUrl(completedAsset.model_url || '');
              data = historyToLegacy(ctx, modelUrl);
            } else {
              store.setSystemState('CONSTRUCTING');
              store.setProgress(10);
              startProgressSimulation();

              const forgeRes = await createForge({ context_id: ctx.context_id });
              const status = await pollForgeUntilDone(
                forgeRes.task_id,
                abortController.signal,
                store.setProgress
              );

              clearProgressTimer();
              const modelUrl = processModelUrl(status.model_url || '');
              data = historyToLegacy(ctx, modelUrl);
            }
          }
        }

        store.setCapsuleData(data);
        store.setSystemState('LOADING_MODEL');
        store.setProgress(95);
      } catch (error) {
        clearProgressTimer();
        if ((error as Error).name === 'AbortError') return;

        console.warn('API error, falling back to mock:', (error as Error).message);
        const mockData = generateMockDataForYear(targetYear);
        store.setCapsuleData(mockData);
        store.setSystemState('MATERIALIZED');
        store.setProgress(100);
      }
    },
    [store, clearProgressTimer, startProgressSimulation]
  );

  const handleYearChange = useCallback(
    (year: number) => {
      store.setYear(year);
      store.setSystemState('SCROLLING');
      history.replaceState(null, '', `/${year}`);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchCapsule(year);
      }, 500);
    },
    [store, fetchCapsule]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (initialYear !== undefined) {
      store.setYear(initialYear);
      history.replaceState(null, '', `/${initialYear}`);
      fetchCapsule(initialYear);
    }
  }, [initialYear, store, fetchCapsule]);

  const retry = useCallback(() => {
    fetchCapsule(store.currentYear);
  }, [fetchCapsule, store.currentYear]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      clearProgressTimer();
    };
  }, [clearProgressTimer]);

  return {
    year: store.currentYear,
    systemState: store.systemState,
    capsuleData: store.capsuleData,
    error: store.error,
    progress: store.progress,
    setYear: handleYearChange,
    fetchCapsule,
    retry,
    reset: store.reset,
  };
}
