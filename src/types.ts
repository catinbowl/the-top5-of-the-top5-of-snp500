export type Top5QuarterStatus = 'entered' | 'exited' | 'retained' | 'contender';

export interface QuarterInfo {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  label: string;                 // e.g. "Q4 2026"
  prevQuarterLabel: string;     // e.g. "Q3 2026"
  nextQuarterLabel: string;     // e.g. "Q1 2027"
  nextQuarterStartDate: string; // e.g. "Jan 1, 2027"
  dateRange: string;            // e.g. "Oct 1 – Dec 31, 2026"
  daysRemaining: number;
  isFirstMonthOfQuarter: boolean; // true in Jan, Apr, Jul, Oct
  currentMonthName: string;       // e.g. "October"
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  marketCap: number;
  sector: string;
  industry: string;
  volume: number;
  high52: number;
  low52: number;
  pe: number | null;
  logoId: string | null;
  divYield: number | null;
  perfW: number | null;
  perf1M: number | null;
  perf3M: number | null;
  perfYTD: number | null;
  perfY: number | null;
  rankInSector?: number;
  prevQuarterRankInSector?: number;
  quarterlyRankDelta?: number;
  top5QuarterStatus?: Top5QuarterStatus;
  rankInSP500?: number;
  sectorWeight?: number; // % of sector market cap
  sp500Weight?: number;  // % of total S&P 500 market cap
}

export interface IndustryGroup {
  name: string;
  count: number;
  marketCap: number;
}

export interface SectorData {
  name: string;
  rank: number;
  totalMarketCap: number;
  stockCount: number;
  avgChange: number;
  avgChangeTop5: number;
  avgChangeTop10: number;
  avgQtrChangeTop5: number;
  avgQtrChangeTop10: number;
  shareOfSP500: number; // percentage (e.g. 32.5)
  stocks: Stock[];
  top10Stocks: Stock[];
  innerTop5Stocks: Stock[]; // Top 5 stocks in the sector (Inner Group)
  outerContenders: Stock[];  // Stocks #6-#10 (Challengers)
  enteredCount: number;      // How many entered top 5 this quarter
  exitedCount: number;       // How many exited top 5 this quarter
  industries: IndustryGroup[];
  topGainer?: Stock;
  topLoser?: Stock;
  color: string;
  accentColor: string;
  iconName: string;
  description: string;
}

export type ViewMode = 'top5' | 'allocator' | 'matrix' | 'treemap' | 'all19';

export type SortField = 'marketCap' | 'perf1M' | 'perf3M' | 'change' | 'price' | 'pe' | 'perfYTD';
export type SortDirection = 'asc' | 'desc';
