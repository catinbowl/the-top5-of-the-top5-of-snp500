import React, { memo } from 'react';
import type { Stock } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StockLogo } from './StockLogo';

interface StockRowProps {
  stock: Stock;
  index: number;
  onSelectStock: (stock: Stock) => void;
  sectorColor?: string;
}

export const StockRow: React.FC<StockRowProps> = memo(({ stock, index, onSelectStock, sectorColor }) => {
  const monthlyChange = stock.perf1M ?? stock.change;
  const isPositive = monthlyChange >= 0;
  const quarterlyChange = stock.perf3M;
  const isQuarterlyPositive = (quarterlyChange ?? 0) >= 0;

  // 52-week position
  const low52 = stock.low52 || stock.price * 0.7;
  const high52 = stock.high52 || stock.price * 1.3;
  const span = high52 - low52;
  const pct = span > 0 ? Math.max(0, Math.min(100, ((stock.price - low52) / span) * 100)) : 50;

  const isTop5 = (stock.rankInSector ?? index + 1) <= 5;

  return (
    <tr
      className={`stock-table-row ${stock.top5QuarterStatus === 'entered' ? 'row-entered-top5' : ''} ${stock.top5QuarterStatus === 'exited' ? 'row-exited-top5' : ''}`}
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
      {/* Rank within Sector & Quarterly Delta */}
      <td className="col-rank">
        <div className="rank-cell-wrapper">
          <span
            className={`rank-badge font-mono ${isTop5 ? 'top-five' : ''}`}
            style={
              isTop5 && sectorColor
                ? {
                    borderColor: sectorColor,
                    color: sectorColor,
                    backgroundColor: sectorColor.startsWith('#') ? `${sectorColor}18` : undefined,
                  }
                : undefined
            }
          >
            #{stock.rankInSector || index + 1}
          </span>
          {stock.quarterlyRankDelta !== undefined && stock.quarterlyRankDelta !== 0 && (
            <span
              className={`rank-delta-pill font-mono ${stock.quarterlyRankDelta > 0 ? 'up' : 'down'}`}
              title={`Quarterly movement: ${stock.quarterlyRankDelta > 0 ? '+' : ''}${stock.quarterlyRankDelta} rank vs prior quarter (was #${stock.prevQuarterRankInSector})`}
            >
              {stock.quarterlyRankDelta > 0 ? `▲+${stock.quarterlyRankDelta}` : `▼${stock.quarterlyRankDelta}`}
            </span>
          )}
        </div>
      </td>

      {/* Stock Symbol + Logo + Name */}
      <td className="col-symbol">
        <div className="symbol-cell-content">
          <StockLogo symbol={stock.symbol} logoId={stock.logoId} />
          <div className="symbol-details">
            <div className="symbol-row">
              <span className="stock-symbol font-mono">{stock.symbol}</span>
              <span className="stock-exchange font-mono">{stock.exchange}</span>

              {stock.top5QuarterStatus === 'entered' && (
                <span
                  className="quarter-status-pill entered font-mono"
                  title={`Entered Top 5 this quarter (was #${stock.prevQuarterRankInSector} in prior quarter)`}
                >
                  <ArrowUpRight size={10} />
                  <span className="pill-text-desktop">ENTERED TOP 5</span>
                  <span className="pill-text-mobile">IN</span>
                </span>
              )}
              {stock.top5QuarterStatus === 'exited' && (
                <span
                  className="quarter-status-pill exited font-mono"
                  title={`Exited Top 5 this quarter (was #${stock.prevQuarterRankInSector} in prior quarter)`}
                >
                  <ArrowDownRight size={10} />
                  <span className="pill-text-desktop">EXITED TOP 5</span>
                  <span className="pill-text-mobile">OUT</span>
                </span>
              )}
            </div>
            <span className="stock-company-name" title={stock.name}>
              {stock.name}
            </span>
            <span className="stock-mobile-industry">{stock.industry}</span>
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

      {/* Monthly (1M) Change % */}
      <td className="col-change">
        <span
          className={`change-pill font-mono ${isPositive ? 'positive' : 'negative'}`}
          title="Monthly (1M) Price Change"
        >
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {formatPercent(monthlyChange)}
        </span>
      </td>

      {/* Quarterly (3M) Change % */}
      <td className="col-qtr-change">
        {quarterlyChange !== null && quarterlyChange !== undefined ? (
          <span
            className={`change-pill font-mono ${isQuarterlyPositive ? 'positive' : 'negative'}`}
            title="Quarterly (3M) Price Change"
          >
            {isQuarterlyPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {formatPercent(quarterlyChange)}
          </span>
        ) : (
          <span className="text-muted font-mono">—</span>
        )}
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
          <span className="mcap-weight-text">
            <span className="mcap-weight-desktop">{(stock.sectorWeight || 0).toFixed(1)}% of Sector</span>
            <span className="mcap-weight-mobile">{(stock.sectorWeight || 0).toFixed(1)}%</span>
          </span>
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
});
