import type { Stock, SectorData, IndustryGroup, QuarterInfo } from '../types';
import { TRADINGVIEW_19_SECTORS } from '../data/sectorsConfig';
import { getQuarterInfo } from './quarterUtils';

// Common dual-class share pairs where we want to avoid duplicate company entries in top 10
const DUAL_CLASS_PAIRS: Record<string, string> = {
  GOOG: 'GOOGL', // Alphabet: favor GOOGL
  FOX: 'FOXA',   // Fox Corp: favor FOXA
  NWS: 'NWSA',   // News Corp: favor NWSA
  UA: 'UAA',     // Under Armour
};

// Prior quarter (Q3 2026) sector rank baselines to track quarterly movement into/out of Top 5
const Q3_2026_SECTOR_RANKS: Record<string, Record<string, number>> = {
  'Technology Services': {
    GOOGL: 1,
    MSFT: 2,
    META: 3,
    ORCL: 4,
    PANW: 5,
    PLTR: 6, // PLTR surged +57% in Q4 -> enters Top 5 at #4
    NFLX: 7,
    CRWD: 8,
    IBM: 9,
    CRM: 10,
  },
  'Electronic Technology': {
    NVDA: 1,
    AAPL: 2,
    AVGO: 3,
    AMD: 4,
    INTC: 5, // INTC dropped in Q4 -> exits Top 5 to #6
    MU: 6,   // MU surged with AI memory in Q4 -> enters Top 5 at #4
    CSCO: 7,
    GE: 8,
    DELL: 9,
    TXN: 10,
  },
  'Health Technology': {
    LLY: 1,
    JNJ: 2,
    ABBV: 3,
    MRK: 4,
    AMGN: 5, // AMGN dropped -> exits Top 5 to #6
    TMO: 6,  // TMO rose -> enters Top 5 at #5
    GILD: 7,
    ABT: 8,
    PFE: 9,
    DHR: 10,
  },
  'Retail Trade': {
    AMZN: 1,
    WMT: 2,
    COST: 3,
    HD: 4,
    LOW: 5,  // LOW fell -> exits Top 5 to #7
    TJX: 6,  // TJX hit all-time highs -> enters Top 5 at #5
    CVS: 7,
    ROST: 8,
    ORLY: 9,
    TGT: 10,
  },
  'Finance': {
    'BRK.B': 1,
    JPM: 2,
    V: 3,
    MA: 4,
    BAC: 5,
    MS: 6,
    GS: 7,
    WFC: 8,
    AXP: 9,
    C: 10,
  },
};

export interface ProcessedData {
  totalSP500MarketCap: number;
  totalStocksCount: number;
  currentQuarter: QuarterInfo;
  allSectors: SectorData[];
  top5Sectors: SectorData[];
  top50StocksAcrossTop5: Stock[]; // 10 stocks x 5 industries
  allStocksSorted: Stock[];
}

export function processStockData(rawStocks: Stock[], deduplicateDualClass = true): ProcessedData {
  // Sort all stocks initially by market cap
  const sortedRaw = [...rawStocks].sort((a, b) => b.marketCap - a.marketCap);

  // Assign overall S&P 500 rank
  sortedRaw.forEach((s, idx) => {
    s.rankInSP500 = idx + 1;
  });

  const totalSP500MarketCap = sortedRaw.reduce((sum, s) => sum + s.marketCap, 0);

  // Filter dual class if requested
  const stocksToUse = deduplicateDualClass
    ? sortedRaw.filter(s => !DUAL_CLASS_PAIRS[s.symbol])
    : sortedRaw;

  // Group by sector
  const sectorMap = new Map<string, Stock[]>();
  for (const s of stocksToUse) {
    const secName = s.sector || 'Other';
    if (!sectorMap.has(secName)) {
      sectorMap.set(secName, []);
    }
    sectorMap.get(secName)!.push({ ...s });
  }

  // Build sector data objects
  const sectorList: SectorData[] = [];

  for (const [secName, stocksInSector] of sectorMap.entries()) {
    // Sort stocks in sector by market cap
    stocksInSector.sort((a, b) => b.marketCap - a.marketCap);

    const totalSectorMarketCap = stocksInSector.reduce((sum, s) => sum + s.marketCap, 0);
    const avgChange = stocksInSector.length > 0
      ? stocksInSector.reduce((sum, s) => sum + (s.perf1M ?? s.change), 0) / stocksInSector.length
      : 0;

    // Sub-industries breakdown
    const indMap = new Map<string, { count: number; mcap: number }>();
    for (const s of stocksInSector) {
      const ind = s.industry || 'General';
      const existing = indMap.get(ind) || { count: 0, mcap: 0 };
      existing.count += 1;
      existing.mcap += s.marketCap;
      indMap.set(ind, existing);
    }

    const industries: IndustryGroup[] = Array.from(indMap.entries())
      .map(([name, val]) => ({ name, count: val.count, marketCap: val.mcap }))
      .sort((a, b) => b.marketCap - a.marketCap);

    // Prior quarter rank determination
    const q3Ranks = Q3_2026_SECTOR_RANKS[secName] || {};

    // Dynamic fallback for prior quarter rank via 3M performance
    const stocksSortedByPrevCap = [...stocksInSector].sort((a, b) => {
      const p3mA = typeof a.perf3M === 'number' ? a.perf3M : 0;
      const p3mB = typeof b.perf3M === 'number' ? b.perf3M : 0;
      const prevCapA = a.marketCap / (1 + p3mA / 100);
      const prevCapB = b.marketCap / (1 + p3mB / 100);
      return prevCapB - prevCapA;
    });

    const prevRankFallbackMap = new Map<string, number>();
    stocksSortedByPrevCap.forEach((s, idx) => {
      prevRankFallbackMap.set(s.symbol, idx + 1);
    });

    // Decorate each stock with rankInSector, prevQuarterRank, delta, and top5 status
    stocksInSector.forEach((s, idx) => {
      const curRank = idx + 1;
      s.rankInSector = curRank;
      s.sectorWeight = totalSectorMarketCap > 0 ? (s.marketCap / totalSectorMarketCap) * 100 : 0;
      s.sp500Weight = totalSP500MarketCap > 0 ? (s.marketCap / totalSP500MarketCap) * 100 : 0;

      // Determine previous quarter rank
      const prevRank = q3Ranks[s.symbol] ?? prevRankFallbackMap.get(s.symbol) ?? curRank;
      s.prevQuarterRankInSector = prevRank;
      s.quarterlyRankDelta = prevRank - curRank; // Positive means moved up in rank

      // Determine Top 5 quarterly status
      if (curRank <= 5 && prevRank > 5) {
        s.top5QuarterStatus = 'entered';
      } else if (curRank > 5 && prevRank <= 5) {
        s.top5QuarterStatus = 'exited';
      } else if (curRank <= 5 && prevRank <= 5) {
        s.top5QuarterStatus = 'retained';
      } else {
        s.top5QuarterStatus = 'contender';
      }
    });

    const top10Stocks = stocksInSector.slice(0, 10);
    const innerTop5Stocks = top10Stocks.slice(0, 5);
    const outerContenders = top10Stocks.slice(5, 10);

    const enteredCount = innerTop5Stocks.filter((s) => s.top5QuarterStatus === 'entered').length;
    const exitedCount = outerContenders.filter((s) => s.top5QuarterStatus === 'exited').length;

    // Top gainer and loser (ranked by monthly performance)
    const sortedByChange = [...stocksInSector].sort(
      (a, b) => (b.perf1M ?? b.change) - (a.perf1M ?? a.change)
    );
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    const config = TRADINGVIEW_19_SECTORS[secName] || {
      name: secName,
      category: 'Other',
      color: '#64748b',
      accentColor: 'rgba(100, 116, 139, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(71, 85, 105, 0.05) 100%)',
      icon: 'BarChart3',
      description: 'Sector components listed in S&P 500 under TradingView classification.',
    };

    sectorList.push({
      name: secName,
      rank: 0, // Assigned after sorting
      totalMarketCap: totalSectorMarketCap,
      stockCount: stocksInSector.length,
      avgChange: Number(avgChange.toFixed(2)),
      shareOfSP500: totalSP500MarketCap > 0 ? Number(((totalSectorMarketCap / totalSP500MarketCap) * 100).toFixed(2)) : 0,
      stocks: stocksInSector,
      top10Stocks,
      innerTop5Stocks,
      outerContenders,
      enteredCount,
      exitedCount,
      industries,
      topGainer,
      topLoser,
      color: config.color,
      accentColor: config.accentColor,
      iconName: config.icon,
      description: config.description,
    });
  }

  // Sort sectors by Total Market Cap descending (Rank #1 down to #19+)
  sectorList.sort((a, b) => b.totalMarketCap - a.totalMarketCap);
  sectorList.forEach((sec, idx) => {
    sec.rank = idx + 1;
  });

  const top5Sectors = sectorList.slice(0, 5);

  const top50StocksAcrossTop5: Stock[] = [];
  top5Sectors.forEach(sec => {
    top50StocksAcrossTop5.push(...sec.top10Stocks);
  });

  return {
    totalSP500MarketCap,
    totalStocksCount: sortedRaw.length,
    currentQuarter: getQuarterInfo(),
    allSectors: sectorList,
    top5Sectors,
    top50StocksAcrossTop5,
    allStocksSorted: sortedRaw,
  };
}
