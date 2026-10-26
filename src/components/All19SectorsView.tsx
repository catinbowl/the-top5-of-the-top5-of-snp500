import React, { useState } from 'react';
import type { SectorData, Stock } from '../types';
import { StockRow } from './StockRow';
import { formatMarketCap, formatPercent } from '../utils/formatters';
import {
  PieChart,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface All19SectorsViewProps {
  allSectors: SectorData[];
  onSelectStock: (stock: Stock) => void;
  searchQuery: string;
}

export const All19SectorsView: React.FC<All19SectorsViewProps> = ({
  allSectors,
  onSelectStock,
  searchQuery,
}) => {
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const toggleSector = (name: string) => {
    setExpandedSector((prev) => (prev === name ? null : name));
  };

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="all19-view-container glass-panel">
      <div className="all19-header">
        <div>
          <h2 className="section-title">
            <PieChart size={18} className="title-icon text-cyan" />
            TradingView 19 Sectors Classification &bull; Full S&amp;P 500 Ranking
          </h2>
          <p className="section-subtitle">
            Complete ranking of all 19 market sectors defined in TradingView (FactSet model), ordered by total Market Capitalization.
          </p>
        </div>

        <div className="all19-legend font-mono">
          <span className="legend-highlight-dot"></span>
          <span>Ranks #1–#5 form the Top 5 tracked on the main board</span>
        </div>
      </div>

      <div className="all19-list">
        {allSectors.map((sector) => {
          const isTop5 = sector.rank <= 5;
          const isExpanded = expandedSector === sector.name;
          const isPositive = sector.avgChange >= 0;
          const topStock = sector.stocks[0];

          // Search filter
          if (q) {
            const matchesSector = sector.name.toLowerCase().includes(q);
            const matchesStocks = sector.stocks.some(
              (s) =>
                s.symbol.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q) ||
                s.industry.toLowerCase().includes(q)
            );
            if (!matchesSector && !matchesStocks) return null;
          }

          return (
            <div
              key={sector.name}
              className={`sector-row-item ${isTop5 ? 'top5-highlight' : ''} ${
                isExpanded ? 'expanded' : ''
              }`}
              style={{
                '--sector-color': sector.color,
              } as React.CSSProperties}
            >
              <div
                className="sector-row-head"
                onClick={() => toggleSector(sector.name)}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSector(sector.name);
                  }
                }}
              >
                <div className="row-head-left">
                  <span
                    className={`rank-circle font-mono ${isTop5 ? 'gold-rank' : ''}`}
                    style={isTop5 ? { borderColor: sector.color, color: sector.color } : undefined}
                  >
                    #{sector.rank}
                  </span>

                  <div className="sector-info-block">
                    <div className="sector-title-line">
                      <strong className="sector-item-name">{sector.name}</strong>
                      {isTop5 && <span className="top5-badge font-mono">TOP 5</span>}
                    </div>
                    <span className="sector-item-desc">{sector.description}</span>
                  </div>
                </div>

                <div className="row-head-right">
                  {/* Leading stock pill */}
                  {topStock && (
                    <div
                      className="lead-stock-pill font-mono"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(topStock);
                      }}
                      title={`Leader: ${topStock.symbol} (${topStock.name})`}
                    >
                      <span className="text-muted">Lead:</span>
                      <strong>{topStock.symbol}</strong>
                      <span className="lead-cap text-cyan">{formatMarketCap(topStock.marketCap)}</span>
                    </div>
                  )}

                  {/* Stock count */}
                  <span className="stock-count-badge font-mono">
                    {sector.stockCount} {sector.stockCount === 1 ? 'stock' : 'stocks'}
                  </span>

                  {/* Total Cap */}
                  <div className="cap-badge-wrap font-mono">
                    <span className="cap-label text-muted">Total Cap:</span>
                    <strong className="cap-val" style={{ color: sector.color }}>
                      {formatMarketCap(sector.totalMarketCap)}
                    </strong>
                  </div>

                  {/* Share % */}
                  <div className="share-badge font-mono">
                    <strong>{sector.shareOfSP500.toFixed(1)}%</strong>
                    <span className="text-muted">of S&amp;P</span>
                  </div>

                  {/* Move */}
                  <div
                    className={`move-badge font-mono ${isPositive ? 'text-green' : 'text-rose'}`}
                  >
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{formatPercent(sector.avgChange)}</span>
                  </div>

                  <button className="btn-expand-sector" aria-label="Toggle details">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Table for this Sector */}
              {isExpanded && (
                <div className="expanded-sector-drawer">
                  <div className="drawer-sub-header">
                    <h4>Top Stocks in {sector.name}</h4>
                    <span className="font-mono text-muted">
                      Showing top {Math.min(10, sector.stocks.length)} of {sector.stockCount} components
                    </span>
                  </div>

                  <div className="table-wrapper" tabIndex={0} role="region">
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
                        {sector.stocks.slice(0, 10).map((stock, idx) => (
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
