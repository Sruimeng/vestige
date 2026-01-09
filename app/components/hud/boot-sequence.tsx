/**
 * 页面入场动画组件
 * 深空终端美学 - 启动序列动画
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BootSequenceProps {
  onComplete?: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const { t } = useTranslation();
  const [currentLine, setCurrentLine] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const bootMessages = useMemo(() => [
    t('boot.projectId'),
    t('boot.initTemporal'),
    t('boot.loadingDatabase'),
    t('boot.calibrating'),
    t('boot.systemReady'),
  ], [t]);

  useEffect(() => {
    // 显示跳过按钮
    const skipTimer = setTimeout(() => setShowSkip(true), 500);

    // 逐行显示消息
    const lineInterval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev >= bootMessages.length - 1) {
          clearInterval(lineInterval);
          setTimeout(() => {
            setIsComplete(true);
            onComplete?.();
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => {
      clearTimeout(skipTimer);
      clearInterval(lineInterval);
    };
  }, [onComplete, bootMessages.length]);

  const handleSkip = () => {
    setIsComplete(true);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas"
        >
          {/* 启动日志 */}
          <div className="w-full max-w-md px-8">
            <div className="space-y-2 font-mono text-sm">
              {bootMessages.slice(0, currentLine + 1).map((message, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${
                    index === currentLine
                      ? 'text-hud-accent animate-pulse-glow'
                      : 'text-hud-text-dim'
                  }`}
                >
                  &gt; {message}
                  {index === currentLine && index < bootMessages.length - 1 && (
                    <span className="animate-pulse">_</span>
                  )}
                </motion.p>
              ))}
            </div>

            {/* 进度条 */}
            <div className="mt-8 h-0.5 w-full overflow-hidden rounded bg-hud-accent/20">
              <motion.div
                className="h-full bg-hud-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((currentLine + 1) / bootMessages.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 跳过按钮 */}
          <AnimatePresence>
            {showSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSkip}
                className="absolute bottom-8 right-8 btn-hud min-h-[44px] min-w-[44px] safe-area-pb safe-area-px"
              >
                {t('boot.skip')}
              </motion.button>
            )}
          </AnimatePresence>

          {/* 四角装饰 */}
          <div className="pointer-events-none absolute inset-4">
            <svg className="absolute left-0 top-0 h-8 w-8" viewBox="0 0 32 32">
              <path d="M 0 32 L 0 0 L 32 0" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            </svg>
            <svg className="absolute right-0 top-0 h-8 w-8" viewBox="0 0 32 32">
              <path d="M 0 0 L 32 0 L 32 32" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            </svg>
            <svg className="absolute bottom-0 left-0 h-8 w-8" viewBox="0 0 32 32">
              <path d="M 0 0 L 0 32 L 32 32" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            </svg>
            <svg className="absolute bottom-0 right-0 h-8 w-8" viewBox="0 0 32 32">
              <path d="M 32 0 L 32 32 L 0 32" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
