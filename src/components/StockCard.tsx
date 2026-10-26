import React from 'react';
import type { Stock } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StockLogo } from './StockLogo';

interface StockCardProps {
  stock: Stock;
  index: number;
  onSelectStock: (stock: Stock) => void;
  sectorColor?: string;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, index, onSelectStock, sectorColor }) => {
  const monthlyChange = stock.perf1M ?? stock.change;
  const isPositive = monthlyChange >= 0;

  // 52-week position
  const low52 = stock.low52 || stock.price * 0.7;
  const high52 = stock.high52 || stock.price * 1.3;
  const span = high52 - low52;
  const pct = span > 0 ? Math.max(0, Math.min(100, ((stock.price - low52) / span) * 100)) : 50;

  return (
    <div
      className={`stock-grid-card glass-panel ${stock.top5QuarterStatus === 'entered' ? 'card-entered-top5' : ''} ${stock.top5QuarterStatus === 'exited' ? 'card-exited-top5' : ''}`}
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
      <div className="card-top-row">
        <div className="card-logo-and-sym">
          <StockLogo symbol={stock.symbol} logoId={stock.logoId} />

          <div className="card-sym-col">
            <div className="card-sym-head">
              <span className="stock-symbol font-mono">{stock.symbol}</span>
              <span className="stock-exchange font-mono">{stock.exchange}</span>
            </div>
            <span className="stock-company-name card-name" title={stock.name}>
              {stock.name}
            </span>
          </div>
        </div>

        <div className="card-rank-group">
          <span
            className={`card-rank-badge font-mono ${(stock.rankInSector ?? index + 1) <= 5 ? 'top-five' : ''}`}
            style={index === 0 && sectorColor ? { borderColor: sectorColor, color: sectorColor } : undefined}
          >
            #{stock.rankInSector || index + 1}
          </span>
          {stock.quarterlyRankDelta !== undefined && stock.quarterlyRankDelta !== 0 && (
            <span
              className={`rank-delta-pill font-mono ${stock.quarterlyRankDelta > 0 ? 'up' : 'down'}`}
              title={`Quarterly movement: ${stock.quarterlyRankDelta > 0 ? '+' : ''}${stock.quarterlyRankDelta} rank vs prior quarter`}
            >
              {stock.quarterlyRankDelta > 0 ? `▲+${stock.quarterlyRankDelta}` : `▼${stock.quarterlyRankDelta}`}
            </span>
          )}
        </div>
      </div>

      <div className="card-meta-row">
        <span className="industry-pill">{stock.industry}</span>

        {stock.top5QuarterStatus === 'entered' && (
          <span className="quarter-badge entered font-mono" title={`Entered Top 5 this quarter (was #${stock.prevQuarterRankInSector} in prior quarter)`}>
            <ArrowUpRight size={11} /> Entered Top 5
          </span>
        )}
        {stock.top5QuarterStatus === 'exited' && (
          <span className="quarter-badge exited font-mono" title={`Exited Top 5 this quarter (was #${stock.prevQuarterRankInSector} in prior quarter)`}>
            <ArrowDownRight size={11} /> Exited Top 5
          </span>
        )}
        {stock.top5QuarterStatus === 'retained' && (
          <span className="quarter-badge core font-mono" title={`Core Top 5 constituent`}>
            Top 5 Core
          </span>
        )}
        {stock.top5QuarterStatus === 'contender' && (
          <span className="quarter-badge contender font-mono" title={`Contender ranked #${stock.rankInSector}`}>
            Contender
          </span>
        )}
      </div>

      <div className="card-price-row">
        <span className="card-price font-mono">{formatPrice(stock.price)}</span>
        <span
          className={`change-pill font-mono ${isPositive ? 'positive' : 'negative'}`}
          title="Monthly (1M) Price Change"
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="change-timeframe">1M</span>
          {formatPercent(monthlyChange)}
        </span>
      </div>

      {/* Market Cap & Weight Bar */}
      <div className="card-mcap-section">
        <div className="card-mcap-header font-mono">
          <span className="mcap-label">Market Cap</span>
          <span className="mcap-value text-cyan">{formatMarketCap(stock.marketCap)}</span>
        </div>
        <div className="mcap-weight-bar">
          <div
            className="mcap-weight-fill"
            style={{
              width: `${Math.min(stock.sectorWeight || 0, 100)}%`,
              backgroundColor: sectorColor || 'var(--cyan-accent)',
            }}
          ></div>
        </div>
        <div className="card-mcap-sub font-mono">
          <span>{(stock.sectorWeight || 0).toFixed(1)}% of Sector</span>
          <span>{stock.pe ? `P/E: ${stock.pe}x` : ''}</span>
        </div>
      </div>

      {/* 52-Week Range Mini */}
      <div className="card-52w-section">
        <div className="range-mini-track">
          <div className="range-mini-dot" style={{ left: `${pct}%` }}></div>
        </div>
        <div className="range-mini-labels font-mono">
          <span>{formatPrice(low52)}</span>
          <span>52W Range</span>
          <span>{formatPrice(high52)}</span>
        </div>
      </div>

      <div className="card-footer-action">
        <span>Click for TV Chart &amp; Stats</span>
        <ArrowUpRight size={14} />
      </div>
    </div>
  );
};
