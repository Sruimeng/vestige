/**
 * 历史档案抽屉组件
 * 深空终端美学 - 展示历史事件详情
 * 支持 Time Capsule 和 Future Fossils 两种数据格式
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import type { CapsuleData, FossilEvent, HistoryEvent, FossilEventCategory, EventCategory } from '@/types/time-capsule';
import { CATEGORY_COLORS, CATEGORY_LABELS, FOSSIL_CATEGORY_COLORS, FOSSIL_CATEGORY_LABELS, isFutureFossilsData, isMisreadMode } from '@/types/time-capsule';

interface ArchivesSheetProps {
  data: CapsuleData;
  isOpen: boolean;
  onClose: () => void;
}

/** 事件卡片 - 支持两种事件类型 */
function EventCard({ event, isFossil }: { event: HistoryEvent | FossilEvent; isFossil: boolean }) {
  const category = event.category as FossilEventCategory;
  const categoryColor = isFossil ? FOSSIL_CATEGORY_COLORS[category] : CATEGORY_COLORS[category as EventCategory];
  const categoryLabel = isFossil ? FOSSIL_CATEGORY_LABELS[category] : CATEGORY_LABELS[category as EventCategory];

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

/** 外星考古报告卡片 - Misread 模式特有 */
function ArchaeologistReportCard({ report }: { report: string }) {
  const { t } = useTranslation();

  return (
    <div className="hud-panel border-amber-500/30 bg-amber-500/5 p-4">
      {/* 标题 */}
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="data-label text-amber-500">
          {t('archives.archaeologistReport', '外星考古报告')}
        </span>
      </div>

      {/* 报告内容 */}
      <p className="font-mono text-sm text-amber-200/80 leading-relaxed whitespace-pre-wrap">
        {report}
      </p>
    </div>
  );
}

export function ArchivesSheet({ data, isOpen, onClose }: ArchivesSheetProps) {
  const { t } = useTranslation();
  const isFossil = isFutureFossilsData(data);
  const isMisread = isMisreadMode(data);

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
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] sm:max-h-[80vh] overflow-hidden rounded-t-[32px] bg-canvas safe-area-pb"
      >
        {/* 拖拽指示器 */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-white/20" />
        </div>

        {/* 标题栏 */}
        <div className="border-b border-white/10 px-4 pb-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="data-label">{t('archives.title')}</p>
                {/* Misread 模式标识 */}
                {isMisread && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-amber-500/20 text-amber-400 rounded">
                    MISREAD
                  </span>
                )}
              </div>
              <h2 className="font-mono text-xl sm:text-2xl text-hud-text">{data.year_display}</h2>
            </div>
            <button onClick={onClose} className="btn-hud min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('common.close')}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 事件列表 */}
        <div className="scrollbar-thin max-h-[65vh] sm:max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {/* 外星考古报告 - Misread 模式特有，放在最前面 */}
            {isFossil && isMisread && data.archaeologist_report && (
              <ArchaeologistReportCard report={data.archaeologist_report} />
            )}

            {/* 事件卡片 */}
            {data.events.map((event, index) => (
              <EventCard key={index} event={event} isFossil={isFossil} />
            ))}
          </div>

          {/* 底部信息 */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="data-label mb-2">{t('archives.culturalSymbols')}</p>
            <div className="flex flex-wrap gap-2">
              {data.symbols.map((symbol, index) => (
                <span key={index} className="btn-hud">
                  {symbol}
                </span>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-hud-text-dim">
              {t('archives.generatedAt', { date: new Date(data.generated_at).toLocaleString() })}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
