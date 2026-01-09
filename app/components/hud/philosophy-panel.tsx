/**
 * 哲学面板组件
 * 深空终端美学 - 展示年份的哲学解读
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import type { TimeCapsuleData } from '@/types/time-capsule';

interface PhilosophyPanelProps {
  data: TimeCapsuleData;
  onTap?: () => void;
  className?: string;
}

export function PhilosophyPanel({ data, onTap, className = '' }: PhilosophyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 移动端：可折叠面板
  const MobilePanel = () => (
    <div className="sm:hidden">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // 折叠状态：只显示年份条
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel flex items-center justify-between p-3 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-hud-accent animate-pulse" />
              <span className="font-mono text-lg text-hud-text">{data.year_display}</span>
            </div>
            <span className="data-label text-[10px]">TAP TO EXPAND ↑</span>
          </motion.div>
        ) : (
          // 展开状态：完整面板
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`glass-panel relative p-4 ${className}`}
          >
            {/* 顶部进度条 */}
            <div className="absolute left-0 right-0 top-0 h-0.5 overflow-hidden rounded-t-[32px]">
              <div className="h-full w-full bg-hud-accent" />
            </div>

            {/* 收起按钮 */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute right-3 top-3 btn-hud min-h-[32px] min-w-[32px] flex items-center justify-center text-[10px]"
            >
              ↓
            </button>

            {/* 年份标题 */}
            <h2 className="mb-2 font-mono text-xl text-hud-text tracking-widest">{data.year_display}</h2>

            {/* 合成物体描述 */}
            <p className="mb-1 font-sans text-xs text-hud-text/70 line-clamp-2">{data.synthesis}</p>

            {/* 哲学评判 */}
            <p className="title-philosophy text-sm leading-relaxed line-clamp-3">{data.philosophy}</p>

            {/* 文化符号 */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.symbols.slice(0, 3).map((symbol, index) => (
                <span key={index} className="btn-hud min-h-[32px] px-2 py-1 text-[10px] flex items-center justify-center">
                  {symbol}
                </span>
              ))}
              {data.symbols.length > 3 && (
                <span className="btn-hud min-h-[32px] px-2 py-1 text-[10px] flex items-center justify-center opacity-60">
                  +{data.symbols.length - 3}
                </span>
              )}
            </div>

            {/* 查看详情按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTap?.();
              }}
              className="mt-3 w-full btn-hud min-h-[40px] text-xs"
            >
              VIEW ARCHIVES
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // 桌面端：固定面板
  const DesktopPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={`hidden sm:block glass-panel relative cursor-pointer p-5 ${className}`}
      onClick={onTap}
    >
      {/* 顶部进度条装饰 */}
      <div className="absolute left-0 right-0 top-0 h-0.5 overflow-hidden rounded-t-[32px]">
        <div className="h-full w-full bg-hud-accent" />
      </div>

      {/* 年份标题 */}
      <h2 className="mb-2 font-mono text-2xl text-hud-text tracking-widest">{data.year_display}</h2>

      {/* 合成物体描述 */}
      <p className="mb-1 font-sans text-sm text-hud-text/70 line-clamp-2">{data.synthesis}</p>

      {/* 哲学评判 */}
      <p className="title-philosophy text-base leading-relaxed line-clamp-3">{data.philosophy}</p>

      {/* 文化符号 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {data.symbols.slice(0, 4).map((symbol, index) => (
          <span key={index} className="btn-hud min-h-[36px] px-2 py-1.5 text-[10px] flex items-center justify-center">
            {symbol}
          </span>
        ))}
        {data.symbols.length > 4 && (
          <span className="btn-hud min-h-[36px] px-2 py-1.5 text-[10px] flex items-center justify-center opacity-60">
            +{data.symbols.length - 4}
          </span>
        )}
      </div>

      {/* 操作提示 */}
      <p className="mt-3 data-label text-center text-[10px]">TAP FOR DETAILS</p>
    </motion.div>
  );

  return (
    <>
      <MobilePanel />
      <DesktopPanel />
    </>
  );
}
