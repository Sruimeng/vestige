/**
 * HUD 信号强度指示器
 * 深空终端美学 - 5级强度条
 */

interface SignalBarProps {
  strength: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export function SignalBar({ strength, className = '' }: SignalBarProps) {
  return (
    <div className={`flex items-end gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={`w-1 rounded-sm transition-colors ${
            level <= strength ? 'bg-hud-accent' : 'bg-white/10'
          }`}
          style={{ height: `${level * 3 + 2}px` }}
        />
      ))}
    </div>
  );
}
