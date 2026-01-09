/**
 * HUD 状态指示器
 * 深空终端美学 - 脉冲圆点 + 状态文字
 */

interface StatusIndicatorProps {
  status: 'NOMINAL' | 'INIT' | 'LOADING' | 'READY' | 'ERROR';
  className?: string;
}

const STATUS_CONFIG = {
  NOMINAL: { label: 'SYS.NOMINAL', color: 'bg-hud-success' },
  INIT: { label: 'SYS.INIT', color: 'bg-hud-accent' },
  LOADING: { label: 'DATA.SYNC', color: 'bg-hud-accent' },
  READY: { label: 'DATA.RDY', color: 'bg-hud-success' },
  ERROR: { label: 'SYS.ERROR', color: 'bg-hud-error' },
};

export function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${config.color} animate-pulse-glow`} />
      <span className="data-label">{config.label}</span>
    </div>
  );
}
