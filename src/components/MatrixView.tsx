import React, { useState, useMemo } from 'react';
import type { Stock, SectorData } from '../types';
import { StockRow } from './StockRow';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TableProperties,
} from 'lucide-react';

interface MatrixViewProps {
  top50Stocks: Stock[];
  top5Sectors: SectorData[];
  onSelectStock: (stock: Stock) => void;
  searchQuery: string;
}

type MatrixSortKey = 'marketCap' | 'perf1M' | 'price' | 'pe' | 'perfYTD' | 'rankInSP500';

export const MatrixView: React.FC<MatrixViewProps> = ({
  top50Stocks,
  top5Sectors,
  onSelectStock,
  searchQuery,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [sortKey, setSortKey] = useState<MatrixSortKey>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: MatrixSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return top50Stocks
      .filter((stock) => {
        // Sector filter
        if (selectedSector !== 'All' && stock.sector !== selectedSector) {
          return false;
        }
        // Search filter
        if (q) {
          return (
            stock.symbol.toLowerCase().includes(q) ||
            stock.name.toLowerCase().includes(q) ||
            stock.industry.toLowerCase().includes(q) ||
            stock.sector.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey] ?? 0;
        let valB = b[sortKey] ?? 0;

        // If sorting by rank, smaller number is better
        if (sortKey === 'rankInSP500') {
          return sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [top50Stocks, selectedSector, searchQuery, sortKey, sortDirection]);

  const renderSortIndicator = (key: MatrixSortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={13} className="text-muted sort-icon" />;
    return sortDirection === 'desc' ? (
      <ArrowDown size={13} className="text-cyan sort-icon" />
    ) : (
      <ArrowUp size={13} className="text-cyan sort-icon" />
    );
  };

  return (
    <div className="matrix-view-container glass-panel">
      <div className="matrix-header-bar">
        <div>
          <h2 className="section-title">
            <TableProperties size={18} className="title-icon text-cyan" />
            Top 50 Stocks Master Comparison Matrix
          </h2>
          <p className="section-subtitle">
            Cross-industry analysis of the top 10 stocks across all 5 leading S&amp;P 500 sectors.
          </p>
        </div>

        {/* Sector Filter Chips */}
        <div className="sector-filter-pills">
          <button
            className={`filter-pill ${selectedSector === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedSector('All')}
          >
            All 5 Sectors ({top50Stocks.length})
          </button>
          {top5Sectors.map((sec) => (
            <button
              key={sec.name}
              className={`filter-pill ${selectedSector === sec.name ? 'active' : ''}`}
              style={{
                '--pill-color': sec.color,
              } as React.CSSProperties}
              onClick={() => setSelectedSector(sec.name)}
            >
              <span className="pill-dot" style={{ backgroundColor: sec.color }}></span>
              <span>{sec.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div
        className="table-wrapper"
        tabIndex={0}
        role="region"
        aria-label="Top 50 Stocks Comparative Table"
      >
        <table className="stocks-data-table matrix-table">
          <thead>
            <tr>
              <th className="th-rank sortable" onClick={() => handleSort('rankInSP500')}>
                <span>S&amp;P Rank</span>
                {renderSortIndicator('rankInSP500')}
              </th>
              <th className="th-symbol">Company &amp; Sector</th>
              <th className="th-industry">Sub-Industry</th>
              <th className="th-price sortable" onClick={() => handleSort('price')}>
                <span>Price</span>
                {renderSortIndicator('price')}
              </th>
              <th className="th-change sortable" onClick={() => handleSort('perf1M')}>
                <span>1M Change</span>
                {renderSortIndicator('perf1M')}
              </th>
              <th className="th-mcap sortable" onClick={() => handleSort('marketCap')}>
                <span>Market Cap</span>
                {renderSortIndicator('marketCap')}
              </th>
              <th className="th-range">52-Week Range</th>
              <th className="th-pe sortable" onClick={() => handleSort('pe')}>
                <span>P/E</span>
                {renderSortIndicator('pe')}
              </th>
              <th className="th-action"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-table-cell">
                  No stocks match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedStocks.map((stock, idx) => {
                const sector = top5Sectors.find((s) => s.name === stock.sector);
                return (
                  <StockRow
                    key={stock.symbol}
                    stock={stock}
                    index={idx}
                    onSelectStock={onSelectStock}
                    sectorColor={sector?.color}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
