/**
 * HUD 信息层
 * 深空终端美学 - 整合所有 HUD 元素
 */

import { useTranslation } from 'react-i18next';

import { Coordinates } from './coordinates';
import { CornerFrames } from './corner-frames';
import { Crosshair } from './crosshair';
import { LanguageSelector } from './language-selector';
import { SignalBar } from './signal-bar';
import { StatusIndicator } from './status-indicator';
import { Timestamp } from './timestamp';

interface HUDOverlayProps {
  year: number;
  status: 'NOMINAL' | 'INIT' | 'LOADING' | 'READY' | 'ERROR';
  isLoading?: boolean;
}

export function HUDOverlay({ year, status, isLoading = false }: HUDOverlayProps) {
  const { t } = useTranslation('common');

  return (
    <>
      {/* 四角装饰框 */}
      <CornerFrames />

      {/* 十字准星 */}
      <Crosshair isLoading={isLoading} />

      {/* 顶部栏 */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex items-start justify-between p-4 safe-area-pt">
        {/* 左上：项目标识 + 状态 */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-hud-text-dim tracking-[0.3em]">{t('hud.projectId')}</span>
          <StatusIndicator status={status} />
        </div>

        {/* 右上：时间戳 + 语言选择 + 信号 */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Timestamp />
          </div>
          <SignalBar strength={status === 'ERROR' ? 1 : status === 'LOADING' ? 3 : 5} />
        </div>
      </div>

      {/* 底部左侧：坐标 */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-30 p-4 safe-area-pb">
        <Coordinates year={year} />
      </div>
    </>
  );
}
