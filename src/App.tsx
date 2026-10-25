import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ViewMode, Stock } from './types';
import snapshotData from './data/snp500_snapshot.json';
import { processStockData } from './utils/dataProcessor';
import { fetchLiveTradingViewStocks } from './services/tradingViewService';
import { Navbar } from './components/Navbar';
import { MarketStatsHeader } from './components/MarketStatsHeader';
import { Top5IndustriesView } from './components/Top5IndustriesView';
import { MatrixView } from './components/MatrixView';
import { TreemapView } from './components/TreemapView';
import { All19SectorsView } from './components/All19SectorsView';
import { StockDetailModal } from './components/StockDetailModal';
import { Footer } from './components/Footer';
import './App.css';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('snp500_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('snp500_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Stocks state initialized with pre-baked high-accuracy snapshot
  const [stocks, setStocks] = useState<Stock[]>(snapshotData.stocks as Stock[]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date(snapshotData.timestamp));
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isLiveOnline, setIsLiveOnline] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // View & Filter states
  const [currentView, setCurrentView] = useState<ViewMode>('top5');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deduplicateDualClass, setDeduplicateDualClass] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Compute processed hierarchy: Top 5 Industries and Top 10 Stocks
  const processed = useMemo(() => {
    return processStockData(stocks, deduplicateDualClass);
  }, [stocks, deduplicateDualClass]);

  // Breadth calculation for top 50 stocks
  const { advancingCount, decliningCount } = useMemo(() => {
    let up = 0;
    let down = 0;
    processed.top50StocksAcrossTop5.forEach((s) => {
      if (s.change >= 0) up++;
      else down++;
    });
    return { advancingCount: up, decliningCount: down };
  }, [processed.top50StocksAcrossTop5]);

  // Aggregate Market Cap of Top 5 Industries
  const top5Cap = useMemo(() => {
    return processed.top5Sectors.reduce((sum, sec) => sum + sec.totalMarketCap, 0);
  }, [processed.top5Sectors]);

  // Top 5 Share of S&P 500
  const top5Share = useMemo(() => {
    return processed.totalSP500MarketCap > 0
      ? (top5Cap / processed.totalSP500MarketCap) * 100
      : 0;
  }, [top5Cap, processed.totalSP500MarketCap]);

  // Top 50 Stocks Cap
  const top50Cap = useMemo(() => {
    return processed.top50StocksAcrossTop5.reduce((sum, s) => sum + s.marketCap, 0);
  }, [processed.top50StocksAcrossTop5]);

  // Live Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsLiveLoading(true);
    setLiveError(null);

    try {
      const tickers = stocks.map((s) => s.symbol);
      const updated = await fetchLiveTradingViewStocks(tickers);

      if (updated && updated.length > 0) {
        // Merge with existing stocks to preserve any missing fields
        const updatedMap = new Map(updated.map((s) => [s.symbol, s]));
        const merged = stocks.map((s) => {
          const fresh = updatedMap.get(s.symbol);
          return fresh ? { ...s, ...fresh } : s;
        });

        setStocks(merged);
        setLastUpdated(new Date());
        setIsLiveOnline(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to TradingView';
      setLiveError(msg);
      setIsLiveOnline(false);
    } finally {
      setIsLiveLoading(false);
    }
  }, [stocks]);

  // Auto-refresh interval (30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Sector Rank',
      'Sector',
      'Sector Stock Rank',
      'S&P 500 Rank',
      'Symbol',
      'Company Name',
      'Exchange',
      'Price ($)',
      '24h Change (%)',
      'Market Cap ($)',
      'Sector Weight (%)',
      'S&P Weight (%)',
      'Sub-Industry',
      'P/E (TTM)',
      '52W Low ($)',
      '52W High ($)',
    ];

    const rows: string[] = [headers.join(',')];

    processed.top5Sectors.forEach((sector) => {
      sector.top10Stocks.forEach((stock) => {
        rows.push(
          [
            sector.rank,
            `"${sector.name}"`,
            stock.rankInSector,
            stock.rankInSP500,
            stock.symbol,
            `"${stock.name.replace(/"/g, '""')}"`,
            stock.exchange,
            stock.price.toFixed(2),
            stock.change.toFixed(2),
            stock.marketCap,
            stock.sectorWeight?.toFixed(2) || 0,
            stock.sp500Weight?.toFixed(2) || 0,
            `"${stock.industry.replace(/"/g, '""')}"`,
            stock.pe || '',
            stock.low52.toFixed(2),
            stock.high52.toFixed(2),
          ].join(',')
        );
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `snp500_top5_industries_top10_stocks_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        lastUpdated={lastUpdated}
        isLiveLoading={isLiveLoading}
        onRefresh={handleRefresh}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
        isLiveOnline={isLiveOnline}
        liveError={liveError}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {/* KPI Banner & Controls */}
        <MarketStatsHeader
          totalSP500Cap={processed.totalSP500MarketCap}
          top5Cap={top5Cap}
          top5Share={top5Share}
          top50Cap={top50Cap}
          advancingCount={advancingCount}
          decliningCount={decliningCount}
          currentView={currentView}
          onViewChange={setCurrentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          deduplicateDualClass={deduplicateDualClass}
          onToggleDeduplicate={() => setDeduplicateDualClass((prev) => !prev)}
          onExportCSV={handleExportCSV}
        />

        {/* View Switching */}
        {currentView === 'top5' && (
          <Top5IndustriesView
            top5Sectors={processed.top5Sectors}
            onSelectStock={setSelectedStock}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'matrix' && (
          <MatrixView
            top50Stocks={processed.top50StocksAcrossTop5}
            top5Sectors={processed.top5Sectors}
            onSelectStock={setSelectedStock}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'treemap' && (
          <TreemapView
            top5Sectors={processed.top5Sectors}
            onSelectStock={setSelectedStock}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'all19' && (
          <All19SectorsView
            allSectors={processed.allSectors}
            onSelectStock={setSelectedStock}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Interactive Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        theme={theme}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
