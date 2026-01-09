/**
 * HUD 状态指示器
 * 深空终端美学 - 脉冲圆点 + 状态文字
 */

import { useTranslation } from 'react-i18next';

interface StatusIndicatorProps {
  status: 'NOMINAL' | 'INIT' | 'LOADING' | 'READY' | 'ERROR';
  className?: string;
}

const STATUS_CONFIG = {
  NOMINAL: { labelKey: 'hud.nominal' as const, color: 'bg-hud-success' },
  INIT: { labelKey: 'hud.init' as const, color: 'bg-hud-accent' },
  LOADING: { labelKey: 'hud.loading' as const, color: 'bg-hud-accent' },
  READY: { labelKey: 'hud.ready' as const, color: 'bg-hud-success' },
  ERROR: { labelKey: 'hud.error' as const, color: 'bg-hud-error' },
};

export function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
  const { t } = useTranslation('common');
  const config = STATUS_CONFIG[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${config.color} animate-pulse-glow`} />
      <span className="data-label">{t(config.labelKey)}</span>
    </div>
  );
}
