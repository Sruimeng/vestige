/**
 * Time Capsule Page
 * Shared rendering logic for / and /$year routes
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Chronometer } from '@/components/chronometer';
import {
  ArchivesSheet,
  BootSequence,
  HUDOverlay,
  LogStream,
  PhilosophyPanel,
} from '@/components/hud';
import { StyleFilterProvider } from '@/components/post-processing';
import { ArtifactModel, HologramWireframe, PlaceholderSphere, SceneCanvas } from '@/components/scene';
import { useTimeCapsule } from '@/hooks/use-time-capsule';
import { useTimeCapsuleStore } from '@/store/time-capsule';

interface Props {
  initialYear?: number;
}

type HUDStatus = 'NOMINAL' | 'INIT' | 'LOADING' | 'READY' | 'ERROR';

export function TimeCapsulePage({ initialYear }: Props) {
  const { t } = useTranslation();
  const { year, systemState, capsuleData, progress, setYear } = useTimeCapsule(initialYear);
  const store = useTimeCapsuleStore();

  const [isArchivesOpen, setIsArchivesOpen] = useState(false);
  const [isBooted, setIsBooted] = useState(false);

  const handleModelLoad = useCallback(() => {
    store.setSystemState('MATERIALIZED');
    store.setProgress(100);
  }, [store]);

  const hudStatus: HUDStatus = (() => {
    switch (systemState) {
      case 'IDLE': return 'INIT';
      case 'SCROLLING':
      case 'CHECKING':
      case 'CONSTRUCTING':
      case 'LOADING_MODEL': return 'LOADING';
      case 'MATERIALIZED': return 'READY';
      case 'ERROR': return 'ERROR';
      default: return 'NOMINAL';
    }
  })();

  const isLoading = systemState === 'CONSTRUCTING' || systemState === 'CHECKING' || systemState === 'LOADING_MODEL';
  const hasRealModel = capsuleData?.model_url && capsuleData.model_url.length > 0;

  return (
    <>
      <BootSequence onComplete={() => setIsBooted(true)} />

      <AnimatePresence>
        {isBooted && (
          <StyleFilterProvider>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-screen w-screen overflow-hidden bg-canvas vignette scanlines"
            >
              {/* 3D Scene */}
              <SceneCanvas>
                {systemState === 'CONSTRUCTING' && <HologramWireframe isAnimating />}

                {(systemState === 'LOADING_MODEL' || systemState === 'MATERIALIZED') && (
                  <>
                    {hasRealModel ? (
                      <ArtifactModel url={capsuleData!.model_url} onLoad={handleModelLoad} />
                    ) : (
                      <PlaceholderSphere />
                    )}
                  </>
                )}
              </SceneCanvas>

              {/* HUD */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <HUDOverlay year={year} status={hudStatus} isLoading={isLoading} />
              </motion.div>

              {/* Chronometer - Desktop */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="fixed bottom-20 right-4 top-20 z-40 hidden w-32 sm:block safe-area-px"
              >
                <Chronometer value={year} onChange={setYear} className="h-full" />
              </motion.div>

              {/* Chronometer - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="fixed bottom-4 left-4 right-4 z-40 block sm:hidden safe-area-pb"
              >
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

              {/* Left Panel - LogStream or PhilosophyPanel */}
              <AnimatePresence mode="wait">
                {(systemState === 'CONSTRUCTING' || systemState === 'LOADING_MODEL') && (
                  <motion.div
                    key="log-stream"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-24 left-4 right-4 z-40 sm:bottom-8 sm:right-auto sm:w-72 safe-area-pb"
                  >
                    <LogStream year={year} progress={progress} />
                  </motion.div>
                )}

                {systemState === 'MATERIALIZED' && capsuleData && (
                  <motion.div
                    key="philosophy-panel"
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

              {/* Error Panel */}
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
                      <button onClick={() => setYear(year)} className="btn-hud mt-4">
                        {t('index.errorRetry')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Archives Sheet */}
              <AnimatePresence>
                {capsuleData && (
                  <ArchivesSheet
                    data={capsuleData}
                    isOpen={isArchivesOpen}
                    onClose={() => setIsArchivesOpen(false)}
                  />
                )}
              </AnimatePresence>

              {/* Idle Prompt */}
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
                      <p className="mt-2 text-sm text-hud-text-dim">{t('index.yearRange')}</p>
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
          </StyleFilterProvider>
        )}
      </AnimatePresence>
    </>
  );
}
