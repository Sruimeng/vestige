'use client';

/**
 * Time Capsule 年份路由
 * 支持 URL 直接访问特定年份: /{year}
 * 例如: /2023, /-500 (公元前500年)
 */

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { YEAR_MAX, YEAR_MIN } from '@/types/time-capsule';

/**
 * 解析年份字符串
 * 支持: "2023", "-500" (公元前)
 */
function parseYear(yearStr: string): number | null {
  // 验证格式: 可选负号 + 数字
  const match = yearStr.match(/^(-?\d+)$/);
  if (!match) return null;

  const year = Number(match[1]);

  // 验证范围
  if (year < YEAR_MIN || year > YEAR_MAX) {
    return null;
  }

  // 排除公元0年（历史上不存在）
  if (year === 0) {
    return null;
  }

  return year;
}

/**
 * 年份路由页面
 * URL: /{year}
 */
export default function YearRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const yearParam = params.year as string;

  // 解析并验证年份
  const parsedYear = useMemo(() => parseYear(yearParam), [yearParam]);

  // 重定向到首页并传递年份参数
  useEffect(() => {
    if (parsedYear !== null) {
      // 有效年份：重定向到首页，通过 state 传递年份
      navigate('/', { replace: true, state: { initialYear: parsedYear } });
    } else {
      // 无效年份：直接重定向到首页
      navigate('/', { replace: true });
    }
  }, [parsedYear, navigate]);

  // 显示加载状态（重定向前短暂显示）
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-canvas">
      <div className="text-center">
        <div className="font-mono text-sm text-hud-text-dim animate-pulse">
          {t('year.redirecting', 'REDIRECTING...')}
        </div>
      </div>
    </div>
  );
}

/**
 * Meta 标签
 */
export function meta({ params }: { params: { year: string } }) {
  const year = parseYear(params.year);
  const yearDisplay = year
    ? year < 0
      ? `${Math.abs(year)} BCE`
      : `${year} CE`
    : 'Unknown';

  return [
    { title: `Time Capsule | ${yearDisplay}` },
    {
      name: 'description',
      content: `Explore the time capsule for year ${yearDisplay}`,
    },
    { name: 'theme-color', content: '#050505' },
  ];
}
