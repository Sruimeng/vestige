/**
 * 数据流动画组件
 * 深空终端美学 - CONSTRUCTING 状态的伪日志滚动
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LogStreamProps {
  year: number;
  progress: number;
  className?: string;
}

// 预定义的日志消息模板
const LOG_TEMPLATES = [
  '> INIT_SYSTEM...',
  '> SCANNING_TEMPORAL_COORDINATES...',
  '> YEAR_LOCK_ACQUIRED: {year}',
  '> SEARCHING_CACHE... MISS',
  '> INIT_RECONSTRUCTION_PROTOCOL...',
  '> CONNECTING_TO_TEMPORAL_STREAM...',
  '> ANALYZING_HISTORICAL_DATA...',
  '> EXTRACTING_CULTURAL_SYMBOLS...',
  '> PROCESSING_EVENTS: {count}/5',
  '> GENERATING_SYNTHESIS...',
  '> CALLING_GEOMETRY_ENGINE...',
  '> MESH_GENERATION_IN_PROGRESS...',
  '> TEXTURE_SYNTHESIS_ACTIVE...',
  '> MATERIAL_PROPERTIES_CALCULATED...',
  '> FINALIZING_3D_MODEL...',
  '> UPLOADING_ARTIFACT...',
  '> VERIFICATION_COMPLETE',
  '> MATERIALIZATION_READY',
];

// 生成十六进制数据
function generateHexData(): string {
  return `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
}

export function LogStream({ year, progress, className = '' }: LogStreamProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [hexStream, setHexStream] = useState<string[]>([]);

  // 根据进度添加日志
  useEffect(() => {
    const targetLogCount = Math.floor((progress / 100) * LOG_TEMPLATES.length);

    if (logs.length < targetLogCount) {
      const newLog = LOG_TEMPLATES[logs.length]
        .replace('{year}', String(year))
        .replace('{count}', String(Math.min(5, Math.floor(progress / 20))));

      setLogs((prev) => [...prev, newLog]);
    }
  }, [progress, year, logs.length]);

  // 持续生成十六进制数据流
  useEffect(() => {
    const interval = setInterval(() => {
      setHexStream((prev) => {
        const newStream = [...prev, generateHexData()];
        // 保持最多 20 条
        return newStream.slice(-20);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`font-mono text-xs ${className}`}>
      {/* 日志消息 */}
      <div className="mb-4 space-y-1">
        <AnimatePresence mode="popLayout">
          {logs.map((log, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-hud-accent ${
                index === logs.length - 1 ? 'animate-pulse-glow' : 'opacity-60'
              }`}
            >
              {log}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* 十六进制数据流 */}
      <div className="h-32 overflow-hidden text-hud-text-dim/50">
        <div className="animate-data-stream">
          {hexStream.map((hex, index) => (
            <p key={index} className="leading-relaxed">
              {hex}
            </p>
          ))}
          {/* 重复以实现无限滚动效果 */}
          {hexStream.map((hex, index) => (
            <p key={`dup-${index}`} className="leading-relaxed">
              {hex}
            </p>
          ))}
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-hud-text-dim">
          <span>RECONSTRUCTION</span>
          <span>{progress}%</span>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded bg-hud-accent/20">
          <motion.div
            className="h-full bg-hud-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
