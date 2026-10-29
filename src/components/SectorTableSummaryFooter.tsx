import React from 'react';
import type { SectorData } from '../types';
import { formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SectorTableSummaryFooterProps {
  sector: SectorData;
}

export const SectorTableSummaryFooter: React.FC<SectorTableSummaryFooterProps> = ({ sector }) => {
  const isTop5M1Pos = sector.avgChangeTop5 >= 0;
  const isTop5QtrPos = sector.avgQtrChangeTop5 >= 0;
  const isTop10M1Pos = sector.avgChangeTop10 >= 0;
  const isTop10QtrPos = sector.avgQtrChangeTop10 >= 0;

  const top5Count = Math.min(5, sector.stocks.length);
  const top10Count = Math.min(10, sector.stocks.length);

  return (
    <tfoot>
      {/* Top 5 Market-Cap-Weighted Summary Row */}
      <tr className="table-summary-row summary-row-top5">
        <td className="col-rank">
          <div className="rank-cell-wrapper">
            <span
              className="rank-badge summary-rank-badge top-five font-mono"
              style={
                sector.color
                  ? {
                      borderColor: sector.color,
                      color: sector.color,
                      backgroundColor: sector.color.startsWith('#') ? `${sector.color}18` : undefined,
                    }
                  : undefined
              }
            >
              T5
            </span>
          </div>
        </td>
        <td className="col-symbol">
          <div className="summary-label-block">
            <span className="summary-label-title">
              <span className="th-desktop">Top 5 Weighted Avg</span>
              <span className="th-mobile">Top 5 Wtd Avg</span>
            </span>
            <span className="summary-label-sub font-mono">
              <span className="th-desktop">Market-Cap Weighted &bull; Ranks #1&ndash;#{top5Count}</span>
              <span className="th-mobile">Cap-Wtd (#1&ndash;#{top5Count})</span>
            </span>
          </div>
        </td>
        <td className="col-industry">
          <span className="industry-pill summary-method-pill font-mono">Cap-Weighted</span>
        </td>
        <td className="col-price" />
        <td className="col-change">
          <span
            className={`change-pill summary-change-pill font-mono ${isTop5M1Pos ? 'positive' : 'negative'}`}
            title="Market-Cap Weighted 1-Month Move (Top 5 Stocks)"
          >
            {isTop5M1Pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {formatPercent(sector.avgChangeTop5)}
          </span>
        </td>
        <td className="col-qtr-change">
          <span
            className={`change-pill summary-change-pill font-mono ${isTop5QtrPos ? 'positive' : 'negative'}`}
            title="Market-Cap Weighted Quarterly (3M) Move (Top 5 Stocks)"
          >
            {isTop5QtrPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {formatPercent(sector.avgQtrChangeTop5)}
          </span>
        </td>
        <td className="col-mcap" />
        <td className="col-range" />
        <td className="col-pe" />
        <td className="col-action" />
      </tr>

      {/* Top 10 Market-Cap-Weighted Summary Row */}
      {sector.stocks.length > 5 && (
        <tr className="table-summary-row summary-row-top10">
          <td className="col-rank">
            <div className="rank-cell-wrapper">
              <span className="rank-badge summary-rank-badge font-mono">T10</span>
            </div>
          </td>
          <td className="col-symbol">
            <div className="summary-label-block">
              <span className="summary-label-title">
                <span className="th-desktop">Top 10 Weighted Avg</span>
                <span className="th-mobile">Top 10 Wtd Avg</span>
              </span>
              <span className="summary-label-sub font-mono">
                <span className="th-desktop">Market-Cap Weighted &bull; Ranks #1&ndash;#{top10Count}</span>
                <span className="th-mobile">Cap-Wtd (#1&ndash;#{top10Count})</span>
              </span>
            </div>
          </td>
          <td className="col-industry">
            <span className="industry-pill summary-method-pill font-mono">Cap-Weighted</span>
          </td>
          <td className="col-price" />
          <td className="col-change">
            <span
              className={`change-pill summary-change-pill font-mono ${isTop10M1Pos ? 'positive' : 'negative'}`}
              title="Market-Cap Weighted 1-Month Move (Top 10 Stocks)"
            >
              {isTop10M1Pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {formatPercent(sector.avgChangeTop10)}
            </span>
          </td>
          <td className="col-qtr-change">
            <span
              className={`change-pill summary-change-pill font-mono ${isTop10QtrPos ? 'positive' : 'negative'}`}
              title="Market-Cap Weighted Quarterly (3M) Move (Top 10 Stocks)"
            >
              {isTop10QtrPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {formatPercent(sector.avgQtrChangeTop10)}
            </span>
          </td>
          <td className="col-mcap" />
          <td className="col-range" />
          <td className="col-pe" />
          <td className="col-action" />
        </tr>
      )}
    </tfoot>
  );
};

