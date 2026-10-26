import type { Stock, SectorData, IndustryGroup } from '../types';
import { TRADINGVIEW_19_SECTORS } from '../data/sectorsConfig';

// Common dual-class share pairs where we want to avoid duplicate company entries in top 10
const DUAL_CLASS_PAIRS: Record<string, string> = {
  GOOG: 'GOOGL', // Alphabet: favor GOOGL
  FOX: 'FOXA',   // Fox Corp: favor FOXA
  NWS: 'NWSA',   // News Corp: favor NWSA
  UA: 'UAA',     // Under Armour
};

export interface ProcessedData {
  totalSP500MarketCap: number;
  totalStocksCount: number;
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

    // Decorate each stock with rankInSector and weights
    stocksInSector.forEach((s, idx) => {
      s.rankInSector = idx + 1;
      s.sectorWeight = totalSectorMarketCap > 0 ? (s.marketCap / totalSectorMarketCap) * 100 : 0;
      s.sp500Weight = totalSP500MarketCap > 0 ? (s.marketCap / totalSP500MarketCap) * 100 : 0;
    });

    const top10Stocks = stocksInSector.slice(0, 10);

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
    allSectors: sectorList,
    top5Sectors,
    top50StocksAcrossTop5,
    allStocksSorted: sortedRaw,
  };
}
