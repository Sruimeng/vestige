/**
 * HUD 坐标读数
 * 深空终端美学 - COORDS: YEAR <selection>
 */

import { useTranslation } from 'react-i18next';

interface CoordinatesProps {
  year: number;
  className?: string;
}

export function Coordinates({ year, className = '' }: CoordinatesProps) {
  const { t } = useTranslation('common');

  // 格式化年份显示
  const formatYear = (y: number): string => {
    if (y < 0) {
      return t('hud.yearBce', { year: String(Math.abs(y)).padStart(4, '0') });
    }
    return t('hud.yearCe', { year: String(y).padStart(4, '0') });
  };

  return (
    <div className={`font-mono text-xs ${className}`}>
      <span className="text-hud-text-dim tracking-[0.2em]">{t('hud.coordinates')} </span>
      <span className="text-hud-accent tabular-nums">{formatYear(year)}</span>
    </div>
  );
}
