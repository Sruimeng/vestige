'use client';

/**
 * Time Capsule - Year Route
 * URL: /{year} (e.g., /2023, /-500)
 */

import { useMemo } from 'react';
import { useParams } from 'react-router';

import { TimeCapsulePage } from '@/components/time-capsule-page';
import { YEAR_MAX, YEAR_MIN } from '@/types/time-capsule';

function parseYear(yearStr: string): number | null {
  const match = yearStr.match(/^(-?\d+)$/);
  if (!match) return null;

  const year = Number(match[1]);
  if (year < YEAR_MIN || year > YEAR_MAX) return null;
  if (year === 0) return null;

  return year;
}

export default function YearRoute() {
  const params = useParams();
  const yearParam = params.year as string;
  const year = useMemo(() => parseYear(yearParam), [yearParam]);

  return <TimeCapsulePage initialYear={year ?? undefined} />;
}

export function meta({ params }: { params: { year: string } }) {
  const year = parseYear(params.year);
  const yearDisplay = year
    ? year < 0
      ? `${Math.abs(year)} BCE`
      : `${year} CE`
    : 'Unknown';

  return [
    { title: `Time Capsule | ${yearDisplay}` },
    { name: 'description', content: `Explore the time capsule for year ${yearDisplay}` },
    { name: 'theme-color', content: '#050505' },
  ];
}
