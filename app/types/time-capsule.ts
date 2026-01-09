/**
 * Time Capsule API 类型定义
 * 根据 time-capsule-guide.md 规范
 */

/** 历史事件分类 */
export type EventCategory = 'politics' | 'technology' | 'culture' | 'economy' | 'science';

/** 历史事件 */
export interface HistoryEvent {
  title: string;
  description: string;
  category: EventCategory;
}

/** 时间胶囊数据 */
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

/** 分类颜色映射 */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  politics: '#EF4444', // red
  technology: '#3B82F6', // blue
  culture: '#A855F7', // purple
  economy: '#22C55E', // green
  science: '#F59E0B', // amber
};
