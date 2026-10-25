import React, { useState } from 'react';
import type { SectorData, Stock } from '../types';
import { formatMarketCap, formatPercent, formatPrice } from '../utils/formatters';
import { LayoutGrid } from 'lucide-react';

interface TreemapViewProps {
  top5Sectors: SectorData[];
  onSelectStock: (stock: Stock) => void;
  searchQuery: string;
}

export const TreemapView: React.FC<TreemapViewProps> = ({
  top5Sectors,
  onSelectStock,
  searchQuery,
}) => {
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);

  // Total Market Cap of all 50 stocks in the top 5 sectors
  const top50TotalCap = top5Sectors.reduce(
    (sum, sec) => sum + sec.top10Stocks.reduce((secSum, s) => secSum + s.marketCap, 0),
    0
  );

  // Calculate background color based on daily change
  const getPerfColor = (change: number) => {
    if (change > 3) return '#059669'; // vivid emerald
    if (change > 1.5) return '#10b981';
    if (change > 0) return '#34d399';
    if (change === 0) return '#64748b';
    if (change > -1.5) return '#fb7185';
    if (change > -3) return '#f43f5e';
    return '#e11d48'; // deep rose
  };

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="treemap-container glass-panel">
      <div className="treemap-header">
        <div>
          <h2 className="section-title">
            <LayoutGrid size={18} className="title-icon text-cyan" />
            Top 5 Industries &bull; Market Cap Weight &amp; Performance Treemap
          </h2>
          <p className="section-subtitle">
            Proportional tile representation of the 50 premier stocks. Box size represents Market Capitalization; color denotes 24h percentage return.
          </p>
        </div>

        <div className="treemap-legend">
          <span className="legend-label font-mono">24h Return:</span>
          <div className="legend-scale">
            <span className="legend-chip bg-rose-deep">&lt; -3%</span>
            <span className="legend-chip bg-rose-mid">-1.5%</span>
            <span className="legend-chip bg-neutral">0%</span>
            <span className="legend-chip bg-green-mid">+1.5%</span>
            <span className="legend-chip bg-green-deep">&gt; +3%</span>
          </div>
        </div>
      </div>

      {/* Treemap Sectors Container */}
      <div className="treemap-body">
        {top5Sectors.map((sector) => {
          const sector50Cap = sector.top10Stocks.reduce((sum, s) => sum + s.marketCap, 0);
          const sectorShare = top50TotalCap > 0 ? (sector50Cap / top50TotalCap) * 100 : 20;

          // Filter by search
          const filteredStocks = sector.top10Stocks.filter((s) => {
            if (!q) return true;
            return (
              s.symbol.toLowerCase().includes(q) ||
              s.name.toLowerCase().includes(q) ||
              s.industry.toLowerCase().includes(q)
            );
          });

          return (
            <div
              key={sector.name}
              className="treemap-sector-group"
              style={{
                flexGrow: Math.max(1, Math.round(sectorShare)),
                '--sector-color': sector.color,
              } as React.CSSProperties}
            >
              <div className="treemap-sector-banner">
                <span className="treemap-sector-rank font-mono">#{sector.rank}</span>
                <span className="treemap-sector-title">{sector.name}</span>
                <span className="treemap-sector-cap font-mono">{formatMarketCap(sector.totalMarketCap)}</span>
              </div>

              <div className="treemap-stocks-grid">
                {filteredStocks.map((stock) => {
                  const stockWeightInTop50 =
                    top50TotalCap > 0 ? (stock.marketCap / top50TotalCap) * 100 : 2;

                  return (
                    <div
                      key={stock.symbol}
                      className="treemap-tile"
                      style={{
                        flexGrow: Math.max(1, Math.round(stockWeightInTop50 * 10)),
                        backgroundColor: getPerfColor(stock.change),
                      }}
                      onClick={() => onSelectStock(stock)}
                      onMouseEnter={() => setHoveredStock(stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${stock.symbol}: ${formatPrice(stock.price)}, ${formatPercent(stock.change)}`}
                    >
                      <div className="treemap-tile-content font-mono">
                        <span className="tile-symbol">{stock.symbol}</span>
                        <span className="tile-change">{formatPercent(stock.change)}</span>
                        <span className="tile-cap">{formatMarketCap(stock.marketCap)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Hover Inspector Tooltip */}
      {hoveredStock && (
        <div className="treemap-hover-tooltip glass-panel font-mono">
          <div className="tooltip-head">
            <strong>{hoveredStock.symbol}</strong> ({hoveredStock.name})
          </div>
          <div className="tooltip-details">
            <span>Price: {formatPrice(hoveredStock.price)}</span>
            <span className={hoveredStock.change >= 0 ? 'text-green' : 'text-rose'}>
              24h: {formatPercent(hoveredStock.change)}
            </span>
            <span>Market Cap: {formatMarketCap(hoveredStock.marketCap)}</span>
            <span>Sector: {hoveredStock.sector}</span>
            <span>Industry: {hoveredStock.industry}</span>
          </div>
        </div>
      )}
    </div>
  );
};
