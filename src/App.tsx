import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ViewMode, Stock } from './types';
import snapshotData from './data/snp500_snapshot.json';
import { processStockData } from './utils/dataProcessor';
import { fetchLiveTradingViewStocks } from './services/tradingViewService';
import { Navbar } from './components/Navbar';
import { Top5IndustriesView } from './components/Top5IndustriesView';
import { CapitalDistributionView } from './components/CapitalDistributionView';
import { MatrixView } from './components/MatrixView';
import { TreemapView } from './components/TreemapView';
import { All19SectorsView } from './components/All19SectorsView';
import { StockDetailModal } from './components/StockDetailModal';
import { Footer } from './components/Footer';
import { Layers, Wallet } from 'lucide-react';
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

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Stocks state initialized with pre-baked high-accuracy snapshot
  const [stocks, setStocks] = useState<Stock[]>(snapshotData.stocks as Stock[]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date(snapshotData.timestamp));
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isLiveOnline, setIsLiveOnline] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // View state (synced with URL hash for bookmarkable pages)
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return window.location.hash === '#allocator' ? 'allocator' : 'top5';
  });
  const searchQuery = '';
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedStock(null);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentView(window.location.hash === '#allocator' ? 'allocator' : 'top5');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleViewChange = useCallback((view: ViewMode) => {
    setCurrentView(view);
    if (view === 'allocator') {
      window.history.replaceState(null, '', '#allocator');
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

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
        onToggleAutoRefresh={handleToggleAutoRefresh}
        isLiveOnline={isLiveOnline}
        liveError={liveError}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentQuarter={processed.currentQuarter}
      />

      <main className="main-content">
        {/* Primary Page Navigation Tabs */}
        <nav className="page-switcher-bar" aria-label="Primary Pages">
          <div className="view-tabs page-view-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={currentView === 'top5'}
              className={`view-tab ${currentView === 'top5' ? 'active' : ''}`}
              onClick={() => handleViewChange('top5')}
            >
              <Layers size={16} />
              <span>Top 5 Tracker</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={currentView === 'allocator'}
              className={`view-tab ${currentView === 'allocator' ? 'active' : ''}`}
              onClick={() => handleViewChange('allocator')}
            >
              <Wallet size={16} />
              <span>Capital Allocator</span>
              <span className="tab-pill font-mono">25 Stocks</span>
            </button>
          </div>
        </nav>

        {/* View Switching */}
        {currentView === 'top5' && (
          <Top5IndustriesView
            top5Sectors={processed.top5Sectors}
            onSelectStock={setSelectedStock}
            searchQuery={searchQuery}
            currentQuarter={processed.currentQuarter}
          />
        )}

        {currentView === 'allocator' && (
          <CapitalDistributionView
            top5Sectors={processed.top5Sectors}
            allSectors={processed.allSectors}
            onSelectStock={setSelectedStock}
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
        onClose={handleCloseModal}
        theme={theme}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
