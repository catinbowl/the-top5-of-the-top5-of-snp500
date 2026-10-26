import type { Stock } from '../types';

const TRADINGVIEW_SCAN_URL = 'https://scanner.tradingview.com/america/scan';

const SCAN_COLUMNS = [
  'name',
  'description',
  'close',
  'change',
  'market_cap_basic',
  'sector',
  'industry',
  'volume',
  'price_52_week_high',
  'price_52_week_low',
  'price_earnings_ttm',
  'logoid',
  'dividends_yield_current',
  'Perf.W',
  'Perf.1M',
  'Perf.3M',
  'Perf.YTD',
  'Perf.Y',
];

export async function fetchLiveTradingViewStocks(tickers: string[]): Promise<Stock[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const payload = {
    filter: [
      {
        left: 'name',
        operation: 'in_range',
        right: tickers,
      },
    ],
    columns: SCAN_COLUMNS,
    sort: {
      sortBy: 'market_cap_basic',
      sortOrder: 'desc',
    },
    range: [0, 600],
  };

  try {
    const response = await fetch(TRADINGVIEW_SCAN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`TradingView Scanner HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.data || [];

    const updatedStocks: Stock[] = [];
    const seen = new Set<string>();

    for (const item of rows) {
      const sFull: string = item.s || '';
      const d = item.d || [];
      const ticker: string = d[0];

      if (!ticker || seen.has(ticker)) continue;
      seen.add(ticker);

      const exchange = sFull.includes(':') ? sFull.split(':')[0] : 'US';

      updatedStocks.push({
        symbol: ticker,
        name: d[1] || ticker,
        exchange,
        price: typeof d[2] === 'number' ? d[2] : 0,
        change: typeof d[3] === 'number' ? d[3] : 0,
        marketCap: typeof d[4] === 'number' ? d[4] : 0,
        sector: d[5] || 'Other',
        industry: d[6] || 'Other',
        volume: typeof d[7] === 'number' ? d[7] : 0,
        high52: typeof d[8] === 'number' ? d[8] : 0,
        low52: typeof d[9] === 'number' ? d[9] : 0,
        pe: typeof d[10] === 'number' ? Number(d[10].toFixed(2)) : null,
        logoId: d[11] || null,
        divYield: typeof d[12] === 'number' ? Number(d[12].toFixed(2)) : null,
        perfW: typeof d[13] === 'number' ? Number(d[13].toFixed(2)) : null,
        perf1M: typeof d[14] === 'number' ? Number(d[14].toFixed(2)) : null,
        perf3M: typeof d[15] === 'number' ? Number(d[15].toFixed(2)) : null,
        perfYTD: typeof d[16] === 'number' ? Number(d[16].toFixed(2)) : null,
        perfY: typeof d[17] === 'number' ? Number(d[17].toFixed(2)) : null,
      });
    }

    return updatedStocks;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.warn('Failed to fetch live data from TradingView scanner:', err);
    throw err;
  }
}
