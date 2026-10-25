import React from 'react';
import type { ViewMode } from '../types';
import { formatMarketCap } from '../utils/formatters';
import {
  Layers,
  LayoutGrid,
  TableProperties,
  PieChart,
  Search,
  Download,
  Check,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface MarketStatsHeaderProps {
  totalSP500Cap: number;
  top5Cap: number;
  top5Share: number;
  top50Cap: number;
  advancingCount: number;
  decliningCount: number;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  deduplicateDualClass: boolean;
  onToggleDeduplicate: () => void;
  onExportCSV: () => void;
}

export const MarketStatsHeader: React.FC<MarketStatsHeaderProps> = ({
  totalSP500Cap,
  top5Cap,
  top5Share,
  top50Cap,
  advancingCount,
  decliningCount,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  deduplicateDualClass,
  onToggleDeduplicate,
  onExportCSV,
}) => {
  return (
    <div className="stats-header-container">
      {/* Top Banner KPI Grid */}
      <div className="kpi-grid">
        {/* KPI 1: Total S&P 500 Market Cap */}
        <div className="kpi-card glass-panel">
          <div className="kpi-label">
            <span>S&amp;P 500 TOTAL VALUE</span>
            <span className="kpi-tag">503 Companies</span>
          </div>
          <div className="kpi-value font-mono">{formatMarketCap(totalSP500Cap)}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Aggregated US Large Cap Benchmark</span>
          </div>
        </div>

        {/* KPI 2: Top 5 Industries Market Cap */}
        <div className="kpi-card glass-panel kpi-highlight">
          <div className="kpi-label">
            <span className="kpi-title-with-icon">
              <Sparkles size={14} className="accent-sparkle" />
              TOP 5 INDUSTRIES VALUE
            </span>
            <span className="kpi-badge-pill">{top5Share.toFixed(1)}% Dominance</span>
          </div>
          <div className="kpi-value font-mono text-cyan">{formatMarketCap(top5Cap)}</div>
          <div className="kpi-footer">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(top5Share, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Top 50 Stocks Market Cap */}
        <div className="kpi-card glass-panel">
          <div className="kpi-label">
            <span>TOP 50 CONSTITUENTS</span>
            <span className="kpi-tag">Top 10 x 5 Sectors</span>
          </div>
          <div className="kpi-value font-mono">{formatMarketCap(top50Cap)}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">
              Accounts for {((top50Cap / (totalSP500Cap || 1)) * 100).toFixed(1)}% of total index
            </span>
          </div>
        </div>

        {/* KPI 4: Top 50 Market Breadth */}
        <div className="kpi-card glass-panel">
          <div className="kpi-label">
            <span>TOP 50 BREADTH</span>
            <span className="kpi-tag">Today's Moves</span>
          </div>
          <div className="kpi-breadth-row font-mono">
            <span className="breadth-item text-green">
              <TrendingUp size={16} />
              <strong>{advancingCount}</strong> Up
            </span>
            <span className="breadth-divider">/</span>
            <span className="breadth-item text-rose">
              <TrendingDown size={16} />
              <strong>{decliningCount}</strong> Down
            </span>
          </div>
          <div className="kpi-footer">
            <div className="breadth-ratio-bar">
              <div
                className="breadth-bar-green"
                style={{ width: `${(advancingCount / 50) * 100}%` }}
              ></div>
              <div
                className="breadth-bar-rose"
                style={{ width: `${(decliningCount / 50) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs & Action Bar */}
      <div className="view-controls-bar glass-panel">
        <div className="view-tabs" role="tablist" aria-label="Dashboard Views">
          <button
            role="tab"
            aria-selected={currentView === 'top5'}
            className={`view-tab ${currentView === 'top5' ? 'active' : ''}`}
            onClick={() => onViewChange('top5')}
          >
            <Layers size={16} />
            <span>Top 5 Industries</span>
            <span className="tab-pill">Core</span>
          </button>

          <button
            role="tab"
            aria-selected={currentView === 'matrix'}
            className={`view-tab ${currentView === 'matrix' ? 'active' : ''}`}
            onClick={() => onViewChange('matrix')}
          >
            <TableProperties size={16} />
            <span>50 Stocks Matrix</span>
          </button>

          <button
            role="tab"
            aria-selected={currentView === 'treemap'}
            className={`view-tab ${currentView === 'treemap' ? 'active' : ''}`}
            onClick={() => onViewChange('treemap')}
          >
            <LayoutGrid size={16} />
            <span>Market Treemap</span>
          </button>

          <button
            role="tab"
            aria-selected={currentView === 'all19'}
            className={`view-tab ${currentView === 'all19' ? 'active' : ''}`}
            onClick={() => onViewChange('all19')}
          >
            <PieChart size={16} />
            <span>All 19 TV Sectors</span>
          </button>
        </div>

        {/* Search & Global Actions */}
        <div className="controls-right">
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search ticker, company, sub-industry..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Deduplicate Dual Shares Toggle */}
          <button
            className={`toggle-dual-shares ${deduplicateDualClass ? 'checked' : ''}`}
            onClick={onToggleDeduplicate}
            title="Deduplicate multi-share classes (e.g., show single primary entry for Alphabet instead of GOOG & GOOGL)"
          >
            <span className="checkbox-box">
              {deduplicateDualClass && <Check size={12} />}
            </span>
            <span className="toggle-label">Unique Companies</span>
          </button>

          {/* Export CSV Button */}
          <button
            className="btn-export"
            onClick={onExportCSV}
            title="Export top 50 stock records to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
