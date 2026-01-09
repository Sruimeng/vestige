/**
 * HUD 坐标读数
 * 深空终端美学 - COORDS: YEAR <selection>
 */

interface CoordinatesProps {
  year: number;
  className?: string;
}

export function Coordinates({ year, className = '' }: CoordinatesProps) {
  // 格式化年份显示
  const formatYear = (y: number): string => {
    if (y < 0) {
      return `BCE ${String(Math.abs(y)).padStart(4, '0')}`;
    }
    return `CE  ${String(y).padStart(4, '0')}`;
  };

  return (
    <div className={`font-mono text-xs ${className}`}>
      <span className="text-hud-text-dim tracking-[0.2em]">COORDS: YEAR </span>
      <span className="text-hud-accent tabular-nums">{formatYear(year)}</span>
    </div>
  );
}
