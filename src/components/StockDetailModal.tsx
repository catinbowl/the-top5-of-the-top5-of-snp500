import React, { useEffect } from 'react';
import type { Stock } from '../types';
import { formatMarketCap, formatPrice, formatPercent, formatVolume, getLogoUrl } from '../utils/formatters';
import {
  X,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Building2,
  PieChart,
} from 'lucide-react';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, theme }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!stock) return null;

  const isPositive = stock.change >= 0;
  const logoUrl = getLogoUrl(stock.logoId);
  const tradingViewSymbol = `${stock.exchange}:${stock.symbol}`;
  const tradingViewExternalUrl = `https://www.tradingview.com/symbols/${stock.exchange}-${stock.symbol}/`;

  // 52-week position calculation
  const low52 = stock.low52 || stock.price * 0.7;
  const high52 = stock.high52 || stock.price * 1.3;
  const range52Span = high52 - low52;
  const current52Pos = range52Span > 0 ? Math.max(0, Math.min(100, ((stock.price - low52) / range52Span) * 100)) : 50;

  // TradingView Widget iframe URL
  const widgetUrl = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    tradingViewSymbol
  )}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=rgba(0,0,0,0)&theme=${
    theme === 'dark' ? 'dark' : 'light'
  }&style=1&timezone=America%2FNew_York&withdateranges=1&studies=[]&hideideas=1`;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-stock-info">
            <div className="modal-logo-wrap">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${stock.symbol} logo`}
                  className="modal-logo-img"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="modal-logo-fallback">{stock.symbol.slice(0, 2)}</span>
            </div>

            <div className="modal-title-group">
              <div className="modal-symbol-row">
                <h2 className="modal-symbol font-mono">{stock.symbol}</h2>
                <span className="modal-exchange-badge font-mono">{stock.exchange}</span>
                {stock.rankInSector && (
                  <span className="modal-rank-badge">
                    #{stock.rankInSector} in {stock.sector}
                  </span>
                )}
                {stock.rankInSP500 && (
                  <span className="modal-sp-rank-badge">#{stock.rankInSP500} S&amp;P 500</span>
                )}
              </div>
              <p className="modal-company-name">{stock.name}</p>
            </div>
          </div>

          <div className="modal-header-actions">
            <a
              href={tradingViewExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-tv"
              title="Open full chart on TradingView"
            >
              <span>TradingView</span>
              <ExternalLink size={14} />
            </a>
            <button className="btn-close-modal" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Price Row & Chart */}
        <div className="modal-price-bar">
          <div className="modal-price-wrap">
            <span className="modal-price font-mono">{formatPrice(stock.price)}</span>
            <span className={`modal-change font-mono ${isPositive ? 'text-green' : 'text-rose'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {formatPercent(stock.change)}
            </span>
          </div>

          <div className="modal-weights-row font-mono">
            <span className="weight-pill">
              Sector Weight: <strong>{stock.sectorWeight?.toFixed(2)}%</strong>
            </span>
            <span className="weight-pill">
              S&amp;P 500 Weight: <strong>{stock.sp500Weight?.toFixed(2)}%</strong>
            </span>
          </div>
        </div>

        {/* Embedded Interactive TradingView Chart */}
        <div className="modal-chart-container">
          <iframe
            title={`TradingView Chart for ${stock.symbol}`}
            src={widgetUrl}
            className="tradingview-chart-iframe"
            loading="lazy"
          ></iframe>
        </div>

        {/* Key Fundamentals Grid */}
        <div className="modal-stats-grid">
          <div className="modal-stat-box">
            <span className="stat-label">Market Capitalization</span>
            <span className="stat-value font-mono text-cyan">{formatMarketCap(stock.marketCap)}</span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">P/E Ratio (TTM)</span>
            <span className="stat-value font-mono">{stock.pe ? `${stock.pe}x` : 'N/A'}</span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">Dividend Yield</span>
            <span className="stat-value font-mono">
              {stock.divYield ? `${stock.divYield.toFixed(2)}%` : '0.00%'}
            </span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value font-mono">{formatVolume(stock.volume)}</span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">1-Week Perf</span>
            <span
              className={`stat-value font-mono ${
                (stock.perfW || 0) >= 0 ? 'text-green' : 'text-rose'
              }`}
            >
              {formatPercent(stock.perfW)}
            </span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">1-Month Perf</span>
            <span
              className={`stat-value font-mono ${
                (stock.perf1M || 0) >= 0 ? 'text-green' : 'text-rose'
              }`}
            >
              {formatPercent(stock.perf1M)}
            </span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">YTD Return</span>
            <span
              className={`stat-value font-mono ${
                (stock.perfYTD || 0) >= 0 ? 'text-green' : 'text-rose'
              }`}
            >
              {formatPercent(stock.perfYTD)}
            </span>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">1-Year Return</span>
            <span
              className={`stat-value font-mono ${
                (stock.perfY || 0) >= 0 ? 'text-green' : 'text-rose'
              }`}
            >
              {formatPercent(stock.perfY)}
            </span>
          </div>
        </div>

        {/* 52-Week Range Bar */}
        <div className="modal-range-wrapper">
          <div className="range-label-row">
            <span className="range-title">52-Week Price Range</span>
            <span className="range-current font-mono">Current: {formatPrice(stock.price)}</span>
          </div>
          <div className="range-bar-track">
            <div className="range-bar-fill" style={{ width: `${current52Pos}%` }}></div>
            <div className="range-indicator-dot" style={{ left: `${current52Pos}%` }}></div>
          </div>
          <div className="range-bounds font-mono">
            <span>Low: {formatPrice(low52)}</span>
            <span>High: {formatPrice(high52)}</span>
          </div>
        </div>

        {/* Sector & Industry Classification Footer */}
        <div className="modal-footer-info">
          <div className="footer-info-item">
            <Building2 size={15} className="footer-icon" />
            <span className="footer-label">TradingView Sector:</span>
            <strong className="footer-val">{stock.sector}</strong>
          </div>
          <div className="footer-info-item">
            <PieChart size={15} className="footer-icon" />
            <span className="footer-label">Sub-Industry:</span>
            <strong className="footer-val">{stock.industry}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
