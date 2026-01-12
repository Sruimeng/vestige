/**
 * Style Filter Context & Provider
 * @description 风格滤镜状态管理
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  StyleFilter,
  PostProcessingConfig,
  SystemState,
  StyleFilterContextValue,
} from './types';
import { DEFAULT_POST_PROCESSING } from './constants';

const StyleFilterContext = createContext<StyleFilterContextValue | null>(null);

interface StyleFilterProviderProps {
  children: ReactNode;
  initialFilter?: StyleFilter;
  initialState?: SystemState;
}

/** 检测移动端 */
const detectMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/** 检测 GPU 等级 (简化版) */
const detectGPUTier = (): number => {
  if (typeof window === 'undefined') return 2;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return 1;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return 2;

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  // 简单判断：集成显卡为低端
  if (/Intel|Mali|Adreno 3|Adreno 4/i.test(renderer)) return 1;
  if (/Adreno 5|Adreno 6|Apple/i.test(renderer)) return 2;
  return 3;
};

export function StyleFilterProvider({
  children,
  initialFilter = 'default',
  initialState = 'IDLE',
}: StyleFilterProviderProps) {
  const [filter, setFilterState] = useState<StyleFilter>(initialFilter);
  const [config, setConfigState] =
    useState<PostProcessingConfig>(DEFAULT_POST_PROCESSING);
  const [systemState, setSystemState] = useState<SystemState>(initialState);
  const [isMobile, setIsMobile] = useState(false);
  const [gpuTier, setGpuTier] = useState(2);

  // 客户端检测
  useEffect(() => {
    setIsMobile(detectMobile());
    setGpuTier(detectGPUTier());
  }, []);

  // 根据系统状态调整后处理配置
  useEffect(() => {
    setConfigState((prev) => {
      switch (systemState) {
        case 'SCROLLING':
          return {
            ...prev,
            scanline: { ...prev.scanline, density: prev.scanline.density + 0.5 },
          };
        case 'CONSTRUCTING':
          return {
            ...prev,
            bloom: { ...prev.bloom, enabled: true, intensity: 0.5 },
          };
        case 'ERROR':
          return {
            ...prev,
            chromaticAberration: { ...prev.chromaticAberration, enabled: true },
          };
        default:
          return DEFAULT_POST_PROCESSING;
      }
    });
  }, [systemState]);

  const setFilter = useCallback(
    (newFilter: StyleFilter) => {
      setFilterState(newFilter);
    },
    []
  );

  const setConfig = useCallback((partial: Partial<PostProcessingConfig>) => {
    setConfigState((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo<StyleFilterContextValue>(
    () => ({
      filter,
      setFilter,
      config,
      setConfig,
      systemState,
      setSystemState,
      isMobile,
      gpuTier,
    }),
    [filter, setFilter, config, setConfig, systemState, isMobile, gpuTier]
  );

  return (
    <StyleFilterContext.Provider value={value}>
      {children}
    </StyleFilterContext.Provider>
  );
}

/** Hook: 使用风格滤镜 */
export function useStyleFilter(): StyleFilterContextValue {
  const context = useContext(StyleFilterContext);
  if (!context) {
    throw new Error('useStyleFilter must be used within StyleFilterProvider');
  }
  return context;
}
