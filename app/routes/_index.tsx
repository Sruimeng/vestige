/**
 * Ephemera: Time Capsule - 首页
 * 深空终端美学 - Phase 3 美化与动效
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Chronometer } from '@/components/chronometer';
import {
  ArchivesSheet,
  BootSequence,
  HUDOverlay,
  LogStream,
  PhilosophyPanel,
} from '@/components/hud';
import { ArtifactModel, HologramWireframe, PlaceholderSphere, SceneCanvas } from '@/components/scene';
import { useTimeCapsule } from '@/hooks/use-time-capsule';

export default function Index() {
  const { t } = useTranslation();
  const location = useLocation();
  const { year, systemState, capsuleData, progress, setYear } = useTimeCapsule();
  const [isArchivesOpen, setIsArchivesOpen] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const [initialYearHandled, setInitialYearHandled] = useState(false);

  // 处理从 URL 传入的初始年份
  useEffect(() => {
    if (!initialYearHandled && isBooted) {
      const state = location.state as { initialYear?: number } | null;
      if (state?.initialYear) {
        setYear(state.initialYear);
        // 清除 state 避免刷新时重复触发
        window.history.replaceState({}, document.title);
      }
      setInitialYearHandled(true);
    }
  }, [isBooted, initialYearHandled, location.state, setYear]);

  // 映射系统状态到 HUD 状态
  const getHUDStatus = (): 'NOMINAL' | 'INIT' | 'LOADING' | 'READY' | 'ERROR' => {
    switch (systemState) {
      case 'IDLE':
        return 'INIT';
      case 'SCROLLING':
      case 'CHECKING':
      case 'CONSTRUCTING':
        return 'LOADING';
      case 'MATERIALIZED':
        return 'READY';
      case 'ERROR':
        return 'ERROR';
      default:
        return 'NOMINAL';
    }
  };

  // 判断是否正在加载
  const isLoading = systemState === 'CONSTRUCTING' || systemState === 'CHECKING';

  // 判断是否有真实模型 URL
  const hasRealModel = capsuleData?.model_url && capsuleData.model_url.length > 0;

  return (
    <>
      {/* 启动序列动画 */}
      <BootSequence onComplete={() => setIsBooted(true)} />

      {/* 主界面 */}
      <AnimatePresence>
        {isBooted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-screen w-screen overflow-hidden bg-canvas vignette scanlines"
          >
            {/* 3D 场景 */}
            <SceneCanvas>
              {systemState === 'CONSTRUCTING' && <HologramWireframe isAnimating />}

              {systemState === 'MATERIALIZED' && (
                <>
                  {hasRealModel ? (
                    <ArtifactModel url={capsuleData!.model_url} />
                  ) : (
                    <PlaceholderSphere />
                  )}
                </>
              )}
            </SceneCanvas>

            {/* HUD 信息层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <HUDOverlay year={year} status={getHUDStatus()} isLoading={isLoading} />
            </motion.div>

            {/* 时间轴滚动器 - 右侧（桌面端） */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-20 right-4 top-20 z-40 hidden w-32 sm:block safe-area-px"
            >
              <Chronometer value={year} onChange={setYear} className="h-full" />
            </motion.div>

            {/* 时间轴滚动器 - 底部（移动端） */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-4 left-4 right-4 z-40 block sm:hidden safe-area-pb"
            >
              {/* 移动端年份显示 */}
              <div className="glass-panel flex items-center justify-between p-3">
                <button
                  onClick={() => setYear(Math.max(-500, year - 1))}
                  className="btn-hud min-h-[44px] min-w-[44px] flex items-center justify-center text-lg"
                  aria-label={t('index.previousYear')}
                >
                  ←
                </button>
                <div className="text-center flex-1">
                  <p className="font-mono text-3xl text-hud-accent tabular-nums">{year}</p>
                  <p className="text-xs text-hud-text-dim">
                    {year < 0 ? t('index.bce') : t('index.ce')}
                  </p>
                </div>
                <button
                  onClick={() => setYear(Math.min(2100, year + 1))}
                  className="btn-hud min-h-[44px] min-w-[44px] flex items-center justify-center text-lg"
                  aria-label={t('index.nextYear')}
                >
                  →
                </button>
              </div>
            </motion.div>

            {/* CONSTRUCTING 状态 - 数据流动画 */}
            <AnimatePresence>
              {systemState === 'CONSTRUCTING' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="fixed bottom-24 left-4 right-4 z-40 sm:bottom-8 sm:right-auto sm:w-72 safe-area-pb"
                >
                  <LogStream year={year} progress={progress} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* MATERIALIZED 状态 - 哲学面板 */}
            <AnimatePresence>
              {systemState === 'MATERIALIZED' && capsuleData && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed bottom-24 left-4 right-4 z-40 sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm safe-area-pb"
                >
                  <PhilosophyPanel
                    data={capsuleData}
                    onTap={() => setIsArchivesOpen(true)}
                    className="glass-interactive"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR 状态 - 错误提示 */}
            <AnimatePresence>
              {systemState === 'ERROR' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed bottom-24 left-4 right-4 z-40 sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm safe-area-pb"
                >
                  <div className="hud-panel border-hud-error/30 p-6 text-center">
                    <p className="font-mono text-sm text-hud-error animate-text-glow">
                      {t('index.errorTitle')}
                    </p>
                    <p className="mt-2 text-xs text-hud-text-dim">{t('index.errorMessage')}</p>
                    <button
                      onClick={() => setYear(year)}
                      className="btn-hud mt-4"
                    >
                      {t('index.errorRetry')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 历史档案抽屉 */}
            <AnimatePresence>
              {capsuleData && (
                <ArchivesSheet
                  data={capsuleData}
                  isOpen={isArchivesOpen}
                  onClose={() => setIsArchivesOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* 操作提示（首次加载后显示） */}
            <AnimatePresence>
              {systemState === 'IDLE' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1 }}
                  className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
                >
                  <div className="text-center">
                    <p className="font-serif text-2xl text-hud-text/80 sm:text-3xl">
                      {t('index.selectYear')}
                    </p>
                    <p className="mt-2 text-sm text-hud-text-dim">
                      {t('index.yearRange')}
                    </p>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="mt-8 text-hud-accent"
                    >
                      <svg className="mx-auto h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
