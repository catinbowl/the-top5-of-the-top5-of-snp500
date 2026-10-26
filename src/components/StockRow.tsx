import React from 'react';
import type { Stock } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { StockLogo } from './StockLogo';

interface StockRowProps {
  stock: Stock;
  index: number;
  onSelectStock: (stock: Stock) => void;
  sectorColor?: string;
}

export const StockRow: React.FC<StockRowProps> = ({ stock, index, onSelectStock, sectorColor }) => {
  const isPositive = stock.change >= 0;

  // 52-week position
  const low52 = stock.low52 || stock.price * 0.7;
  const high52 = stock.high52 || stock.price * 1.3;
  const span = high52 - low52;
  const pct = span > 0 ? Math.max(0, Math.min(100, ((stock.price - low52) / span) * 100)) : 50;

  return (
    <tr
      className="stock-table-row"
      onClick={() => onSelectStock(stock)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${stock.symbol} ${stock.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectStock(stock);
        }
      }}
    >
      {/* Rank within Sector */}
      <td className="col-rank">
        <span
          className={`rank-badge font-mono ${index < 3 ? 'top-three' : ''}`}
          style={index === 0 && sectorColor ? { borderColor: sectorColor, color: sectorColor } : undefined}
        >
          #{stock.rankInSector || index + 1}
        </span>
      </td>

      {/* Stock Symbol + Logo + Name */}
      <td className="col-symbol">
        <div className="symbol-cell-content">
          <StockLogo symbol={stock.symbol} logoId={stock.logoId} />
          <div className="symbol-details">
            <div className="symbol-row">
              <span className="stock-symbol font-mono">{stock.symbol}</span>
              <span className="stock-exchange font-mono">{stock.exchange}</span>
            </div>
            <span className="stock-company-name" title={stock.name}>
              {stock.name}
            </span>
          </div>
        </div>
      </td>

      {/* Sub-Industry */}
      <td className="col-industry">
        <span className="industry-pill" title={stock.industry}>
          {stock.industry}
        </span>
      </td>

      {/* Real-Time Price */}
      <td className="col-price font-mono">
        {formatPrice(stock.price)}
      </td>

      {/* 24h Change % */}
      <td className="col-change">
        <span className={`change-pill font-mono ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {formatPercent(stock.change)}
        </span>
      </td>

      {/* Market Cap & Sector Weight */}
      <td className="col-mcap font-mono">
        <div className="mcap-cell-content">
          <span className="mcap-val">{formatMarketCap(stock.marketCap)}</span>
          <div className="mcap-weight-bar">
            <div
              className="mcap-weight-fill"
              style={{
                width: `${Math.min(stock.sectorWeight || 0, 100)}%`,
                backgroundColor: sectorColor || 'var(--cyan-accent)',
              }}
            ></div>
          </div>
          <span className="mcap-weight-text">{(stock.sectorWeight || 0).toFixed(1)}% of Sector</span>
        </div>
      </td>

      {/* 52-Week Range Bar */}
      <td className="col-range">
        <div className="range-mini-wrap" title={`52W Low: ${formatPrice(low52)} | High: ${formatPrice(high52)}`}>
          <div className="range-mini-track">
            <div className="range-mini-dot" style={{ left: `${pct}%` }}></div>
          </div>
          <div className="range-mini-labels font-mono">
            <span>{formatPrice(low52)}</span>
            <span>{formatPrice(high52)}</span>
          </div>
        </div>
      </td>

      {/* P/E Ratio (TTM) */}
      <td className="col-pe font-mono">
        {stock.pe ? `${stock.pe}x` : <span className="text-muted">—</span>}
      </td>

      {/* Action Arrow */}
      <td className="col-action">
        <button
          className="btn-row-action"
          aria-label={`Open ${stock.symbol} chart`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectStock(stock);
          }}
        >
          <ChevronRight size={16} />
        </button>
      </td>
    </tr>
  );
};
