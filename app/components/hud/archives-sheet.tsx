/**
 * 历史档案抽屉组件
 * 深空终端美学 - 展示历史事件详情
 */

import { motion } from 'framer-motion';

import type { HistoryEvent, TimeCapsuleData } from '@/types/time-capsule';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/time-capsule';

interface ArchivesSheetProps {
  data: TimeCapsuleData;
  isOpen: boolean;
  onClose: () => void;
}

function EventCard({ event }: { event: HistoryEvent }) {
  const categoryColor = CATEGORY_COLORS[event.category];
  const categoryLabel = CATEGORY_LABELS[event.category];

  return (
    <div className="hud-panel p-4">
      {/* 分类标签 */}
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor }} />
        <span className="data-label" style={{ color: categoryColor }}>
          {categoryLabel}
        </span>
      </div>

      {/* 事件标题 */}
      <h3 className="mb-1 font-sans text-base font-semibold text-hud-text">{event.title}</h3>

      {/* 事件描述 */}
      <p className="font-sans text-sm text-hud-text/70">{event.description}</p>
    </div>
  );
}

export function ArchivesSheet({ data, isOpen, onClose }: ArchivesSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />

      {/* 抽屉内容 */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-[32px] bg-canvas safe-area-pb"
      >
        {/* 拖拽指示器 */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-white/20" />
        </div>

        {/* 标题栏 */}
        <div className="border-b border-white/10 px-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="data-label">HISTORICAL ARCHIVES</p>
              <h2 className="font-mono text-2xl text-hud-text">{data.year_display}</h2>
            </div>
            <button onClick={onClose} className="btn-hud p-2" aria-label="关闭">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 事件列表 */}
        <div className="scrollbar-thin max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {data.events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>

          {/* 底部信息 */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="data-label mb-2">CULTURAL SYMBOLS</p>
            <div className="flex flex-wrap gap-2">
              {data.symbols.map((symbol, index) => (
                <span key={index} className="btn-hud">
                  {symbol}
                </span>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-hud-text-dim">
              Generated at {new Date(data.generated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
