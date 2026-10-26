import React, { useState } from 'react';
import type { SectorData, Stock } from '../types';
import { StockRow } from './StockRow';
import { StockCard } from './StockCard';
import { formatMarketCap, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Table as TableIcon,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Cpu,
  Terminal,
  Landmark,
  Activity,
  ShoppingBag,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Top5IndustriesViewProps {
  top5Sectors: SectorData[];
  onSelectStock: (stock: Stock) => void;
  searchQuery: string;
}

export const Top5IndustriesView: React.FC<Top5IndustriesViewProps> = ({
  top5Sectors,
  onSelectStock,
  searchQuery,
}) => {
  // Sector display layout mode: table or cards (per sector or global)
  const [layoutModes, setLayoutModes] = useState<Record<string, 'table' | 'cards'>>({});
  // Collapsed state
  const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});

  const toggleLayout = (sectorName: string) => {
    setLayoutModes((prev) => ({
      ...prev,
      [sectorName]: prev[sectorName] === 'cards' ? 'table' : 'cards',
    }));
  };

  const toggleCollapse = (sectorName: string) => {
    setCollapsedSectors((prev) => ({
      ...prev,
      [sectorName]: !prev[sectorName],
    }));
  };

  const getSectorIcon = (name: string) => {
    switch (name) {
      case 'Electronic Technology':
        return <Cpu size={22} className="sector-icon" />;
      case 'Technology Services':
        return <Terminal size={22} className="sector-icon" />;
      case 'Finance':
        return <Landmark size={22} className="sector-icon" />;
      case 'Health Technology':
        return <Activity size={22} className="sector-icon" />;
      case 'Retail Trade':
        return <ShoppingBag size={22} className="sector-icon" />;
      default:
        return <Layers size={22} className="sector-icon" />;
    }
  };

  return (
    <div className="top5-view-container">
      {/* Intro banner */}
      <div className="section-intro-bar">
        <div>
          <h2 className="section-title">
            <Sparkles size={18} className="title-icon text-cyan" />
            Top 5 S&amp;P 500 Industries &bull; Top 10 Stocks in Each
          </h2>
          <p className="section-subtitle">
            Ranked by aggregate Market Capitalization based on the 19 core economic sectors classified by TradingView (FactSet).
          </p>
        </div>
        <div className="section-badge-info">
          <span>5 Industries &bull; 50 Premier Equities</span>
        </div>
      </div>

      {/* Top 5 Industry Sections */}
      <div className="sectors-stack">
        {top5Sectors.map((sector) => {
          const isCollapsed = collapsedSectors[sector.name];
          const layout = layoutModes[sector.name] || 'table';
          const isPositive = sector.avgChange >= 0;

          // Filter stocks by search query if present
          const q = searchQuery.toLowerCase().trim();
          const filteredTop10 = sector.top10Stocks.filter((s) => {
            if (!q) return true;
            return (
              s.symbol.toLowerCase().includes(q) ||
              s.name.toLowerCase().includes(q) ||
              s.industry.toLowerCase().includes(q)
            );
          });

          return (
            <section
              key={sector.name}
              className="sector-section glass-panel"
              style={{
                '--sector-color': sector.color,
                '--sector-accent': sector.accentColor,
              } as React.CSSProperties}
            >
              {/* Sector Header Block */}
              <div
                className="sector-header"
                onClick={() => toggleCollapse(sector.name)}
                role="button"
                tabIndex={0}
                aria-expanded={!isCollapsed}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCollapse(sector.name);
                  }
                }}
              >
                <div className="sector-header-left">
                  {/* Rank Badge */}
                  <div className="sector-rank-badge font-mono">
                    <span className="rank-hash">#</span>
                    <span className="rank-num">{sector.rank}</span>
                  </div>

                  <div className="sector-icon-wrap" style={{ color: sector.color }}>
                    {getSectorIcon(sector.name)}
                  </div>

                  <div className="sector-name-group">
                    <div className="sector-title-row">
                      <h3 className="sector-name">{sector.name}</h3>
                      <span className="sector-tag font-mono">TradingView Sector</span>
                    </div>
                    <p className="sector-desc">{sector.description}</p>
                  </div>
                </div>

                <div className="sector-header-right" onClick={(e) => e.stopPropagation()}>
                  {/* Aggregate Metrics */}
                  <div className="sector-metrics">
                    <div className="sector-metric-item">
                      <span className="metric-label">Sector Total Cap</span>
                      <span className="metric-val font-mono" style={{ color: sector.color }}>
                        {formatMarketCap(sector.totalMarketCap)}
                      </span>
                    </div>

                    <div className="sector-metric-item">
                      <span className="metric-label">S&amp;P 500 Share</span>
                      <span className="metric-val font-mono">{sector.shareOfSP500.toFixed(1)}%</span>
                    </div>

                    <div className="sector-metric-item">
                      <span className="metric-label">Avg 1M Move</span>
                      <span
                        className={`metric-val font-mono ${isPositive ? 'text-green' : 'text-rose'}`}
                      >
                        {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {formatPercent(sector.avgChange)}
                      </span>
                    </div>
                  </div>

                  {/* Layout switch button (Table vs Cards) */}
                  <div className="view-mode-switch">
                    <button
                      className={`btn-layout ${layout === 'table' ? 'active' : ''}`}
                      onClick={() => toggleLayout(sector.name)}
                      title="Switch to compact Table View"
                      aria-label="Table view"
                    >
                      <TableIcon size={15} />
                    </button>
                    <button
                      className={`btn-layout ${layout === 'cards' ? 'active' : ''}`}
                      onClick={() => toggleLayout(sector.name)}
                      title="Switch to Card Grid View"
                      aria-label="Card view"
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>

                  {/* Collapse / Expand Toggle */}
                  <button
                    className="btn-collapse"
                    onClick={() => toggleCollapse(sector.name)}
                    aria-label={isCollapsed ? 'Expand sector' : 'Collapse sector'}
                  >
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </button>
                </div>
              </div>

              {/* Sub-industries chips bar */}
              <div className="sector-sub-industries-bar">
                <span className="sub-ind-title">Top Sub-Industries:</span>
                <div className="sub-ind-list">
                  {sector.industries.slice(0, 4).map((ind) => (
                    <span key={ind.name} className="sub-ind-chip">
                      <strong>{ind.name}</strong>
                      <span className="font-mono text-muted">({ind.count} stocks &bull; {formatMarketCap(ind.marketCap)})</span>
                    </span>
                  ))}
                  {sector.industries.length > 4 && (
                    <span className="sub-ind-more text-muted">
                      +{sector.industries.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Sector Content (Collapsible) */}
              {!isCollapsed && (
                <div className="sector-content-body">
                  {filteredTop10.length === 0 ? (
                    <div className="empty-search-state">
                      <p>No stocks in {sector.name} match "{searchQuery}"</p>
                    </div>
                  ) : layout === 'table' ? (
                    /* Table View */
                    <div
                      className="table-wrapper"
                      tabIndex={0}
                      role="region"
                      aria-label={`Top 10 Stocks in ${sector.name}`}
                    >
                      <table className="stocks-data-table">
                        <thead>
                          <tr>
                            <th className="th-rank">Rank</th>
                            <th className="th-symbol">Company</th>
                            <th className="th-industry">Sub-Industry</th>
                            <th className="th-price">Price</th>
                            <th className="th-change">1M Chg</th>
                            <th className="th-mcap">Market Cap &amp; Weight</th>
                            <th className="th-range">52-Week Range</th>
                            <th className="th-pe">P/E</th>
                            <th className="th-action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTop10.map((stock, idx) => (
                            <StockRow
                              key={stock.symbol}
                              stock={stock}
                              index={idx}
                              onSelectStock={onSelectStock}
                              sectorColor={sector.color}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Cards Grid View */
                    <div className="stocks-cards-grid">
                      {filteredTop10.map((stock, idx) => (
                        <StockCard
                          key={stock.symbol}
                          stock={stock}
                          index={idx}
                          onSelectStock={onSelectStock}
                          sectorColor={sector.color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
