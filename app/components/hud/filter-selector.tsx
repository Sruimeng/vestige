/**
 * Filter Selector
 * @description 滤镜选择器组件 - HUD 风格下拉菜单
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStyleFilter, STYLE_FILTERS, type StyleFilter } from '@/components/post-processing';

/** 滤镜 ID 到国际化 key 的映射 */
const FILTER_I18N_KEYS = {
  default: 'filter.default',
  blueprint: 'filter.blueprint',
  halftone: 'filter.halftone',
  ascii: 'filter.ascii',
  pixel: 'filter.pixel',
  sketch: 'filter.sketch',
  glitch: 'filter.glitch',
  crystal: 'filter.crystal',
  claymation: 'filter.claymation',
} as const satisfies Record<StyleFilter, string>;

export function FilterSelector() {
  const { t } = useTranslation('common');
  const { filter, setFilter } = useStyleFilter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 获取当前滤镜标签
  const currentLabel = t(FILTER_I18N_KEYS[filter]);

  const handleSelect = (id: StyleFilter) => {
    setFilter(id);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* 触发按钮 - HUD 风格，参考语言选择器 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-mono text-xs text-hud-text-dim tracking-wider transition-colors hover:text-hud-text"
      >
        <span className="text-hud-accent">[</span>
        <span className="mx-0.5">{currentLabel}</span>
        <span className="text-hud-accent">]</span>
      </button>

      {/* 弹出菜单 - 参考语言选择器样式 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full z-[100] mt-2 border border-hud-accent/20 bg-[#050505] shadow-xl"
          >
            {STYLE_FILTERS.map((f, index) => {
              const isActive = filter === f.id;
              const label = t(FILTER_I18N_KEYS[f.id]);

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelect(f.id)}
                  className={`block w-full px-3 py-1.5 text-left font-mono text-xs tracking-wider transition-colors ${
                    isActive
                      ? 'text-hud-accent'
                      : 'text-hud-text-dim hover:text-hud-text hover:bg-hud-accent/5'
                  } ${index !== STYLE_FILTERS.length - 1 ? 'border-b border-hud-accent/10' : ''}`}
                >
                  <span className="inline-flex items-center gap-2">
                    {isActive && <span>›</span>}
                    <span>{label}</span>
                    {/* 性能指示器 */}
                    <span className="inline-flex items-center gap-0.5 ml-auto">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`w-1 h-1 rounded-full ${
                            level <= f.performance
                              ? f.performance === 3
                                ? 'bg-amber-400'
                                : f.performance === 2
                                  ? 'bg-hud-accent'
                                  : 'bg-green-400'
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
