/**
 * 哲学面板组件
 * 深空终端美学 - 展示年份的哲学解读
 */

import { motion } from 'framer-motion';

import type { TimeCapsuleData } from '@/types/time-capsule';

interface PhilosophyPanelProps {
  data: TimeCapsuleData;
  onTap?: () => void;
  className?: string;
}

export function PhilosophyPanel({ data, onTap, className = '' }: PhilosophyPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={`glass-panel relative cursor-pointer p-6 ${className}`}
      onClick={onTap}
    >
      {/* 顶部进度条装饰 */}
      <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-[32px]">
        <div className="h-full w-full bg-hud-accent" />
      </div>

      {/* 年份标题 */}
      <h2 className="mb-3 font-mono text-4xl text-hud-text tracking-widest">{data.year_display}</h2>

      {/* 合成物体描述 */}
      <p className="mb-2 font-sans text-sm text-hud-text/80">{data.synthesis}</p>

      {/* 哲学评判 */}
      <p className="title-philosophy text-lg leading-relaxed">{data.philosophy}</p>

      {/* 文化符号 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {data.symbols.map((symbol, index) => (
          <span key={index} className="btn-hud text-[10px]">
            {symbol}
          </span>
        ))}
      </div>

      {/* 操作提示 */}
      <p className="mt-4 data-label text-center">TAP FOR ARCHIVES</p>
    </motion.div>
  );
}
