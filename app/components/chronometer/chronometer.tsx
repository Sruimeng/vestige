/**
 * 时间轴滚动器 (Chronometer)
 * 深空终端美学 - 支持 -500 ~ 2100 年份选择
 *
 * 特性：
 * - 惯性滚动
 * - 停止时自动吸附最近年份
 * - 选中年份高亮
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ChronometerProps {
  value: number;
  onChange: (year: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const YEAR_MIN = -500;
const YEAR_MAX = 2100;
const ITEM_HEIGHT = 40; // 每个年份的高度
const VISIBLE_ITEMS = 7; // 可见的年份数量

export function Chronometer({
  value,
  onChange,
  min = YEAR_MIN,
  max = YEAR_MAX,
  className = '',
}: ChronometerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const animationFrame = useRef<number | null>(null);

  // 计算滚动位置
  const getScrollPosition = useCallback(
    (year: number) => {
      return (year - min) * ITEM_HEIGHT;
    },
    [min]
  );

  // 从滚动位置计算年份
  const getYearFromScroll = useCallback(
    (scrollTop: number) => {
      const year = Math.round(scrollTop / ITEM_HEIGHT) + min;
      return Math.max(min, Math.min(max, year));
    },
    [min, max]
  );

  // 滚动到指定年份
  const scrollToYear = useCallback(
    (year: number, smooth = true) => {
      if (containerRef.current) {
        const targetScroll = getScrollPosition(year);
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    },
    [getScrollPosition]
  );

  // 初始化滚动位置
  useEffect(() => {
    scrollToYear(value, false);
  }, []);

  // 惯性动画
  useEffect(() => {
    if (!isDragging && Math.abs(velocity) > 0.5) {
      const animate = () => {
        if (containerRef.current) {
          containerRef.current.scrollTop += velocity;
          setVelocity((v) => v * 0.95); // 摩擦力

          if (Math.abs(velocity) > 0.5) {
            animationFrame.current = requestAnimationFrame(animate);
          } else {
            // 停止后吸附到最近年份
            const currentYear = getYearFromScroll(containerRef.current.scrollTop);
            scrollToYear(currentYear);
            onChange(currentYear);
          }
        }
      };
      animationFrame.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isDragging, velocity, getYearFromScroll, scrollToYear, onChange]);

  // 鼠标/触摸事件处理
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastY.current = e.clientY;
    lastTime.current = Date.now();
    setVelocity(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaY = lastY.current - e.clientY;
    const deltaTime = Date.now() - lastTime.current;

    containerRef.current.scrollTop += deltaY;

    // 计算速度
    if (deltaTime > 0) {
      setVelocity(deltaY / deltaTime * 16); // 转换为每帧的速度
    }

    lastY.current = e.clientY;
    lastTime.current = Date.now();
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // 滚轮事件
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      containerRef.current.scrollTop += e.deltaY;

      // 防抖：停止滚动后吸附
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = window.setTimeout(() => {
        if (containerRef.current) {
          const currentYear = getYearFromScroll(containerRef.current.scrollTop);
          scrollToYear(currentYear);
          onChange(currentYear);
        }
      }, 150) as unknown as number;
    }
  };

  // 点击年份
  const handleYearClick = (year: number) => {
    scrollToYear(year);
    onChange(year);
  };

  // 格式化年份显示
  const formatYear = (year: number): string => {
    if (year <= 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  };

  // 生成年份列表
  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={`relative ${className}`}>
      {/* 选中指示器 */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-10 border-y border-hud-accent/30 bg-hud-accent/5"
        style={{
          top: `${((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT}px`,
          height: `${ITEM_HEIGHT}px`,
        }}
      />

      {/* 渐变遮罩 - 顶部 */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-canvas to-transparent"
        style={{ height: `${ITEM_HEIGHT * 2}px` }}
      />

      {/* 渐变遮罩 - 底部 */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-canvas to-transparent"
        style={{ height: `${ITEM_HEIGHT * 2}px` }}
      />

      {/* 滚动容器 */}
      <div
        ref={containerRef}
        className="scrollbar-thin overflow-y-auto touch-pan-y"
        style={{
          height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px`,
          scrollbarWidth: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* 顶部填充 */}
        <div style={{ height: `${((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT}px` }} />

        {/* 年份列表 */}
        {years.map((year) => {
          const isSelected = year === value;
          return (
            <div
              key={year}
              className={`flex cursor-pointer items-center justify-center font-mono transition-all ${
                isSelected
                  ? 'text-2xl text-hud-accent font-semibold'
                  : 'text-sm text-hud-text-dim hover:text-hud-text'
              }`}
              style={{ height: `${ITEM_HEIGHT}px` }}
              onClick={() => handleYearClick(year)}
            >
              {formatYear(year)}
            </div>
          );
        })}

        {/* 底部填充 */}
        <div style={{ height: `${((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT}px` }} />
      </div>
    </div>
  );
}
