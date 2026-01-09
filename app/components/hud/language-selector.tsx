/**
 * HUD 语言选择器
 * 深空终端美学 - 与 HUD 风格统一
 */

import { Lngs } from '@/locales';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLng = Lngs.find((lng) => lng.code === i18n.language) || Lngs[1]; // 默认中文

  const handleSelect = useCallback(
    (code: string) => {
      i18n.changeLanguage(code);
      setIsOpen(false);
    },
    [i18n]
  );

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 触发按钮 - HUD 风格 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto font-mono text-xs text-hud-text-dim tracking-wider transition-colors hover:text-hud-text"
      >
        <span className="text-hud-accent">[</span>
        <span className="mx-0.5">{currentLng.label}</span>
        <span className="text-hud-accent">]</span>
      </button>

      {/* 弹出菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-auto absolute right-0 top-full z-[100] mt-2 border border-hud-accent/20 bg-[#050505] shadow-xl"
          >
            {Lngs.map((lng, index) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => handleSelect(lng.code)}
                className={`block w-full px-3 py-1.5 text-left font-mono text-xs tracking-wider transition-colors ${
                  lng.code === currentLng.code
                    ? 'text-hud-accent'
                    : 'text-hud-text-dim hover:text-hud-text hover:bg-hud-accent/5'
                } ${index !== Lngs.length - 1 ? 'border-b border-hud-accent/10' : ''}`}
              >
                {lng.code === currentLng.code && <span className="mr-1">›</span>}
                {lng.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
