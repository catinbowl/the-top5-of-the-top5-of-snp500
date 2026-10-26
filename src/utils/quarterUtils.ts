import type { QuarterInfo } from '../types';

/**
 * Returns current active quarter details based on target date.
 */
export function getQuarterInfo(targetDate: Date = new Date()): QuarterInfo {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth(); // 0 - 11

  let quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  let dateRange: string;
  let prevQuarterLabel: string;
  let nextQuarterStart: Date;

  if (month < 3) {
    quarter = 'Q1';
    dateRange = `Jan 1 – Mar 31, ${year}`;
    prevQuarterLabel = `Q4 ${year - 1}`;
    nextQuarterStart = new Date(year, 3, 1);
  } else if (month < 6) {
    quarter = 'Q2';
    dateRange = `Apr 1 – Jun 30, ${year}`;
    prevQuarterLabel = `Q1 ${year}`;
    nextQuarterStart = new Date(year, 6, 1);
  } else if (month < 9) {
    quarter = 'Q3';
    dateRange = `Jul 1 – Sep 30, ${year}`;
    prevQuarterLabel = `Q2 ${year}`;
    nextQuarterStart = new Date(year, 9, 1);
  } else {
    quarter = 'Q4';
    dateRange = `Oct 1 – Dec 31, ${year}`;
    prevQuarterLabel = `Q3 ${year}`;
    nextQuarterStart = new Date(year + 1, 0, 1);
  }

  const msRemaining = nextQuarterStart.getTime() - targetDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  return {
    quarter,
    year,
    label: `${quarter} ${year}`,
    prevQuarterLabel,
    dateRange,
    daysRemaining,
  };
}
