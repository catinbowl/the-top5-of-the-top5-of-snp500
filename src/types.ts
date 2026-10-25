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
  perfYTD: number | null;
  perfY: number | null;
  rankInSector?: number;
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
  shareOfSP500: number; // percentage (e.g. 32.5)
  stocks: Stock[];
  top10Stocks: Stock[];
  industries: IndustryGroup[];
  topGainer?: Stock;
  topLoser?: Stock;
  color: string;
  accentColor: string;
  iconName: string;
  description: string;
}

export type ViewMode = 'top5' | 'matrix' | 'treemap' | 'all19';

export type SortField = 'marketCap' | 'change' | 'price' | 'pe' | 'perfYTD';
export type SortDirection = 'asc' | 'desc';
