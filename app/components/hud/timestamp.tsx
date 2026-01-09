/**
 * HUD 实时时间戳
 * 深空终端美学 - 毫秒级更新
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TimestampProps {
  className?: string;
}

export function Timestamp({ className = '' }: TimestampProps) {
  const { t } = useTranslation('common');
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
      setTime(`${hours}:${minutes}:${seconds}.${milliseconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 47); // ~21fps 更新，视觉流畅

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`font-mono text-xs text-hud-text-dim tracking-wider ${className}`}>
      <span className="text-hud-text tabular-nums">{time}</span>
      <span className="ml-1 text-hud-accent">{t('hud.timezone')}</span>
    </div>
  );
}
