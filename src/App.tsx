import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ViewMode, Stock } from './types';
import snapshotData from './data/snp500_snapshot.json';
import { processStockData } from './utils/dataProcessor';
import { fetchLiveTradingViewStocks } from './services/tradingViewService';
import { Navbar } from './components/Navbar';
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

  // View state
  const [currentView] = useState<ViewMode>('top5');
  const searchQuery = '';
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Compute processed hierarchy: Top 5 Industries and Top 10 Stocks
  const processed = useMemo(() => {
    return processStockData(stocks, true);
  }, [stocks]);

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
        currentQuarter={processed.currentQuarter}
      />

      <main className="main-content">
        {/* View Switching */}
        {currentView === 'top5' && (
          <Top5IndustriesView
            top5Sectors={processed.top5Sectors}
            onSelectStock={setSelectedStock}
            searchQuery={searchQuery}
            currentQuarter={processed.currentQuarter}
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
