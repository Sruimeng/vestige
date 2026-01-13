/**
 * Time Capsule API 类型定义
 * 根据 time-capsule-guide.md 和 future-fossils-guide.md 规范
 */

import { z } from 'zod';

/** 历史事件分类 (Time Capsule) */
export type EventCategory = 'politics' | 'technology' | 'culture' | 'economy' | 'science';

/** Future Fossils 事件分类 (包含 Misread 模式特有分类) */
export type FossilEventCategory = EventCategory | 'ritual' | 'unknown';

/** 历史事件 */
export interface HistoryEvent {
  title: string;
  description: string;
  category: EventCategory;
}

/** Future Fossils 事件 */
export interface FossilEvent {
  title: string;
  description: string;
  category: FossilEventCategory;
}

/** Future Fossils 模式 */
export type FossilMode = 'history' | 'misread';

/** 时间胶囊数据 (原有) */
export interface TimeCapsuleData {
  year: number;
  year_display: string;
  events: HistoryEvent[];
  symbols: string[];
  synthesis: string;
  philosophy: string;
  model_url: string;
  generated_at: string;
}

/** Future Fossils 数据 (扩展) */
export interface FutureFossilsData {
  year: number;
  year_display: string;
  mode: FossilMode;
  events: FossilEvent[];
  symbols: string[];
  synthesis: string;
  philosophy: string;
  model_url: string;
  generated_at: string;
  /** Misread 模式特有：外星考古报告 */
  archaeologist_report?: string;
}

/** 统一数据类型 (兼容两种 API) */
export type CapsuleData = TimeCapsuleData | FutureFossilsData;

/** 判断是否为 Future Fossils 数据 */
export function isFutureFossilsData(data: CapsuleData): data is FutureFossilsData {
  return 'mode' in data;
}

/** 判断是否为 Misread 模式 */
export function isMisreadMode(data: CapsuleData): boolean {
  return isFutureFossilsData(data) && data.mode === 'misread';
}

/** 时间胶囊响应 */
export interface TimeCapsuleResponse {
  data: TimeCapsuleData;
}

/** 错误类型 */
export type TimeCapsuleErrorType = 'invalid_year' | 'generation_failed';

/** 错误响应 */
export interface TimeCapsuleErrorResponse {
  error: TimeCapsuleErrorType;
  message: string;
}

/** 生成状态（202 响应） */
export type GeneratingStatus = 'started' | 'generating';

/** 202 响应：正在生成中 */
export interface TimeCapsuleGeneratingResponse {
  status: GeneratingStatus;
  year: number;
  message: string;
  estimated_seconds: number;
}

/** 系统状态 */
export type SystemState =
  | 'IDLE' // 初始状态，等待输入
  | 'SCROLLING' // 用户正在快速滑动年份
  | 'CHECKING' // 用户停止，API 查询是否存在
  | 'CONSTRUCTING' // 无缓存，正在生成 (60s 等待)
  | 'LOADING_MODEL' // API 完成，GLB 模型加载中
  | 'MATERIALIZED' // 模型加载完毕，可查看
  | 'ERROR'; // 异常

/** 年份范围常量 */
export const YEAR_MIN = -500;
export const YEAR_MAX = 2100;

/** 分类显示映射 */
export const CATEGORY_LABELS: Record<EventCategory, string> = {
  politics: '政治',
  technology: '科技',
  culture: '文化',
  economy: '经济',
  science: '科学',
};

/** Future Fossils 分类显示映射 (包含 Misread 特有分类) */
export const FOSSIL_CATEGORY_LABELS: Record<FossilEventCategory, string> = {
  ...CATEGORY_LABELS,
  ritual: '祭祀',
  unknown: '未知',
};

/** 分类颜色映射 */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  politics: '#EF4444', // red
  technology: '#3B82F6', // blue
  culture: '#A855F7', // purple
  economy: '#22C55E', // green
  science: '#F59E0B', // amber
};

/** Future Fossils 分类颜色映射 */
export const FOSSIL_CATEGORY_COLORS: Record<FossilEventCategory, string> = {
  ...CATEGORY_COLORS,
  ritual: '#EC4899', // pink
  unknown: '#6B7280', // gray
};

// ============================================================================
// API v5.0 Types
// ============================================================================

/** 新闻条目 (Daily API) */
export interface NewsItem {
  title: string;
  content: string;
}

/** v5 历史事件 Zod Schema */
export const HistoryEventSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(['politics', 'technology', 'culture', 'economy', 'science']),
});

/** v5 新闻条目 Zod Schema */
export const NewsItemSchema = z.object({
  title: z.string(),
  content: z.string(),
});

/** v5 History Context (替代 TimeCapsuleData) */
export interface HistoryContext {
  context_id: string;
  year: number;
  year_display: string;
  events: HistoryEvent[];
  symbols: string[];
  synthesis: string;
  philosophy: string;
  suggested_prompt: string;
}

/** v5 History Context Zod Schema */
export const HistoryContextSchema = z.object({
  context_id: z.string(),
  year: z.number(),
  year_display: z.string(),
  events: z.array(HistoryEventSchema),
  symbols: z.array(z.string()),
  synthesis: z.string(),
  philosophy: z.string(),
  suggested_prompt: z.string(),
});

/** v5 Daily Context (替代 FutureFossilsData) */
export interface DailyContext {
  context_id: string;
  date: string;
  news: NewsItem[];
  philosophy: string;
  suggested_prompt: string;
  keywords: string[];
}

/** v5 Daily Context Zod Schema */
export const DailyContextSchema = z.object({
  context_id: z.string(),
  date: z.string(),
  news: z.array(NewsItemSchema),
  philosophy: z.string(),
  suggested_prompt: z.string(),
  keywords: z.array(z.string()),
});

/** v5 Context 联合类型 */
export type ContextData = HistoryContext | DailyContext;

/** 判断是否为 History Context */
export function isHistoryContext(data: ContextData): data is HistoryContext {
  return 'year' in data && 'events' in data;
}

/** 判断是否为 Daily Context */
export function isDailyContext(data: ContextData): data is DailyContext {
  return 'date' in data && 'news' in data;
}

// ============================================================================
// Forge API Types
// ============================================================================

/** Forge 任务状态 */
export type ForgeStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Forge 创建请求 */
export interface ForgeCreateRequest {
  context_id: string;
  modifier?: string;
  style?: string;
}

/** Forge 创建响应 */
export interface ForgeCreateResponse {
  task_id: string;
  status: ForgeStatus;
  message: string;
}

/** Forge 状态响应 */
export interface ForgeStatusResponse {
  task_id: string;
  status: ForgeStatus;
  model_url: string | null;
  error_message: string | null;
  progress_percent: number;
}

/** Forge 状态 Zod Schema */
export const ForgeStatusSchema = z.object({
  task_id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  model_url: z.string().nullable(),
  error_message: z.string().nullable(),
  progress_percent: z.number(),
});

/** Forge 创建响应 Zod Schema */
export const ForgeCreateResponseSchema = z.object({
  task_id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  message: z.string(),
});

/** Forge Asset */
export interface ForgeAsset {
  task_id: string;
  status: ForgeStatus;
  model_url: string | null;
}

/** Forge Assets 响应 */
export interface ForgeAssetsResponse {
  context_id: string;
  assets: ForgeAsset[];
}

/** Forge Asset Zod Schema */
export const ForgeAssetSchema = z.object({
  task_id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  model_url: z.string().nullable(),
});

/** Forge Assets 响应 Zod Schema */
export const ForgeAssetsResponseSchema = z.object({
  context_id: z.string(),
  assets: z.array(ForgeAssetSchema),
});

// ============================================================================
// API v5 Response Wrappers
// ============================================================================

/** v5 API 成功响应包装 */
export interface ApiV5Response<T> {
  data: T;
}

/** v5 API 错误响应 */
export interface ApiV5Error {
  code: string;
  message: string;
}
