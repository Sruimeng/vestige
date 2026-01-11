/**
 * Filter Selector
 * @description 滤镜选择器组件 - PC端点击切换，移动端滑动切换
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion';
import { useStyleFilter, STYLE_FILTERS, type StyleFilter } from '@/components/post-processing';

/** 滤镜 ID 到国际化 key 的映射 */
const FILTER_I18N_KEYS = {
  default: 'filter.default',
  blueprint: 'filter.blueprint',
  halftone: 'filter.halftone',
  ascii: 'filter.ascii',
  pixel: 'filter.pixel',
  sketch: 'filter.sketch',
  glitch: 'filter.glitch',
  crystal: 'filter.crystal',
  claymation: 'filter.claymation',
} as const satisfies Record<StyleFilter, string>;

/** 单个滑块项高度 */
const ITEM_HEIGHT = 44;

/** 滤镜特征图标 */
function FilterIcon({ filterId }: { filterId: StyleFilter }) {
  const baseClass = 'w-full h-full rounded-sm';

  switch (filterId) {
    case 'default':
      return (
        <div className={`${baseClass} bg-gradient-to-br from-neutral-700 to-neutral-900`}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-hud-accent/60" />
          </div>
        </div>
      );
    case 'blueprint':
      return (
        <div className={`${baseClass} bg-[#0a1628]`}>
          <div className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-60">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-cyan-500/40" />
              ))}
            </div>
          </div>
        </div>
      );
    case 'halftone':
      return (
        <div className={`${baseClass} bg-[#f5f0e6]`}>
          <div className="w-full h-full flex flex-wrap items-center justify-center gap-0.5 p-0.5">
            {[1, 0.7, 0.4, 0.7, 1, 0.7, 0.4, 0.7, 1].map((opacity, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-neutral-800" style={{ opacity }} />
            ))}
          </div>
        </div>
      );
    case 'ascii':
      return (
        <div className={`${baseClass} bg-black`}>
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[5px] font-mono text-green-500 leading-none">{'>'}_</span>
          </div>
        </div>
      );
    case 'pixel':
      return (
        <div className={`${baseClass} bg-neutral-900 overflow-hidden`}>
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: [1, 4, 7].includes(i) ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      );
    case 'sketch':
      return (
        <div className={`${baseClass} bg-[#faf8f5]`}>
          <svg viewBox="0 0 24 24" className="w-full h-full p-0.5">
            <path
              d="M6 18 L12 6 L18 18"
              fill="none"
              stroke="#333"
              strokeWidth="1"
              strokeLinecap="round"
              style={{ strokeDasharray: '2 1' }}
            />
          </svg>
        </div>
      );
    case 'glitch':
      return (
        <div className={`${baseClass} bg-black overflow-hidden`}>
          <div className="w-full h-full flex flex-col justify-center gap-0.5">
            <div className="h-0.5 bg-red-500/70 translate-x-0.5" />
            <div className="h-0.5 bg-cyan-500/70 -translate-x-0.5" />
            <div className="h-0.5 bg-green-500/70 translate-x-1" />
          </div>
        </div>
      );
    case 'crystal':
      return (
        <div className={`${baseClass} bg-gradient-to-br from-purple-900/50 to-blue-900/50`}>
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-2.5 h-3 bg-gradient-to-b from-white/40 to-purple-400/30"
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            />
          </div>
        </div>
      );
    case 'claymation':
      return (
        <div className={`${baseClass} bg-gradient-to-br from-orange-200 to-amber-100`}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
          </div>
        </div>
      );
    default:
      return <div className={baseClass} />;
  }
}

/** 移动端滑动选择器 */
function MobileFilterSelector() {
  const { t } = useTranslation('common');
  const { filter, setFilter } = useStyleFilter();

  const currentIndex = STYLE_FILTERS.findIndex((f) => f.id === filter);
  const [activeIndex, setActiveIndex] = useState(currentIndex >= 0 ? currentIndex : 0);
  const y = useMotionValue(0);

  // 同步外部 filter 变化
  useEffect(() => {
    const newIndex = STYLE_FILTERS.findIndex((f) => f.id === filter);
    if (newIndex >= 0 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      animate(y, -newIndex * ITEM_HEIGHT, { type: 'spring', stiffness: 300, damping: 30 });
    }
  }, [filter, activeIndex, y]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      let newIndex = activeIndex;

      if (Math.abs(velocity) > 200) {
        newIndex = velocity < 0 ? activeIndex + 1 : activeIndex - 1;
      } else if (Math.abs(offset) > ITEM_HEIGHT / 3) {
        newIndex = offset < 0 ? activeIndex + 1 : activeIndex - 1;
      }

      newIndex = Math.max(0, Math.min(STYLE_FILTERS.length - 1, newIndex));

      setActiveIndex(newIndex);
      setFilter(STYLE_FILTERS[newIndex].id);
      animate(y, -newIndex * ITEM_HEIGHT, { type: 'spring', stiffness: 300, damping: 30 });
    },
    [activeIndex, setFilter, y]
  );

  const currentLabel = t(FILTER_I18N_KEYS[STYLE_FILTERS[activeIndex]?.id ?? 'default']);

  return (
    <div className="flex items-center gap-2">
      {/* 滑动选择器 */}
      <div className="relative w-8 h-[88px] overflow-hidden rounded border border-hud-accent/20 bg-black/40 backdrop-blur-sm">
        {/* 中央选中框 */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[44px] border-y border-hud-accent/40 bg-hud-accent/10 pointer-events-none z-10" />

        {/* 可拖拽列表 */}
        <motion.div
          className="absolute left-0 right-0 cursor-grab active:cursor-grabbing"
          style={{ y, top: '50%', marginTop: -ITEM_HEIGHT / 2 }}
          drag="y"
          dragConstraints={{
            top: -(STYLE_FILTERS.length - 1) * ITEM_HEIGHT,
            bottom: 0,
          }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          {STYLE_FILTERS.map((f, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.div
                key={f.id}
                className="flex items-center justify-center"
                style={{ height: ITEM_HEIGHT }}
              >
                <div
                  className={`w-6 h-6 rounded-sm overflow-hidden transition-all duration-200 ${
                    isActive ? 'ring-1 ring-hud-accent scale-110' : 'opacity-50 scale-90'
                  }`}
                >
                  <FilterIcon filterId={f.id} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 上下渐变遮罩 */}
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-20" />
      </div>

      {/* 当前滤镜名称 */}
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[8px] text-hud-text-dim tracking-wider uppercase">
          {t('hud.filter', 'FILTER')}
        </span>
        <span className="font-mono text-[10px] text-hud-accent tracking-wide">{currentLabel}</span>
      </div>
    </div>
  );
}

/** PC端点击选择器 */
function DesktopFilterSelector() {
  const { t } = useTranslation('common');
  const { filter, setFilter } = useStyleFilter();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      {/* 标签 */}
      <span className="font-mono text-[10px] text-hud-text-dim tracking-wider uppercase">
        {t('hud.filter', 'FILTER')}
      </span>

      {/* 点击选择列表 */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {STYLE_FILTERS.map((f) => {
          const isActive = filter === f.id;
          const label = t(FILTER_I18N_KEYS[f.id]);

          return (
            <motion.button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex-shrink-0 flex flex-col items-center gap-1
                p-1.5 rounded transition-all duration-200
                ${isActive
                  ? 'bg-hud-accent/10 border border-hud-accent/40'
                  : 'bg-transparent border border-transparent hover:border-hud-accent/20 hover:bg-hud-accent/5'
                }
              `}
            >
              {/* 图标预览 */}
              <div className="w-8 h-8 rounded overflow-hidden">
                <FilterIcon filterId={f.id} />
              </div>

              {/* 滤镜名称 */}
              <span
                className={`
                  font-mono text-[9px] tracking-wide whitespace-nowrap
                  ${isActive ? 'text-hud-accent' : 'text-hud-text-dim'}
                `}
              >
                {label}
              </span>

              {/* 激活指示器 */}
              {isActive && (
                <motion.div
                  layoutId="filter-indicator"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-hud-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** 主组件：根据设备类型渲染不同选择器 */
export function FilterSelector() {
  const { isMobile } = useStyleFilter();

  if (isMobile) {
    return <MobileFilterSelector />;
  }

  return <DesktopFilterSelector />;
}
