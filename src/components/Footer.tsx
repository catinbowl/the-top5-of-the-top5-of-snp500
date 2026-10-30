import React, { memo } from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = memo(() => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-brand">
            <span className="brand-dot"></span>
            <strong>S&amp;P 500 TOP 5 OF TOP 5 TRACKER</strong>
          </div>
          <p className="footer-desc">
            Classified under TradingView's 19 FactSet Economic Sectors. Stocks ranked by Market Capitalization using real-time quotes and fundamentals.
          </p>
        </div>

        <div className="footer-links">
          <a
            href="https://www.tradingview.com/markets/stocks-usa/sectorandindustry-sector/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <span>TradingView Sectors Directory</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://www.spglobal.com/spdji/en/indices/equity/sp-500/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <span>S&amp;P Dow Jones Indices</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <div className="footer-bottom font-mono">
        <span>Data Stream: TradingView Scanner API &bull; 503 S&amp;P 500 Equities Tracked</span>
        <span>Market data is for informational and analytical purposes</span>
      </div>
    </footer>
  );
});
