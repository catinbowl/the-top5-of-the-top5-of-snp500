import React, { useState, useMemo } from 'react';
import type { SectorData, Stock, QuarterInfo } from '../types';
import {
  formatCurrency,
  formatPrice,
  formatPercent,
  formatShares,
} from '../utils/formatters';
import { StockLogo } from './StockLogo';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react';

interface CapitalDistributionViewProps {
  top5Sectors: SectorData[];
  onSelectStock: (stock: Stock) => void;
  currentQuarter?: QuarterInfo;
}

interface RankedSectorAllocation {
  sector: SectorData;
  perfRank: number;        // 1 (best) .. 5 (worst)
  points: number;          // 5 .. 1
  sectorShare: number;     // points / 15
  sectorCapital: number;   // capital * (points / 15)
  perStockCapital: number; // sectorCapital / 5
  perStockWeightPct: number;
  stocksToBuy: Stock[];
}

const CAPITAL_STORAGE_KEY = 'snp500_investment_capital';
const DEFAULT_CAPITAL = 10000;

function formatInputNumber(val: number): string {
  if (!val && val !== 0) return '';
  const hasDecimals = Math.round(val * 100) !== Math.round(val) * 100;
  return val.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export const CapitalDistributionView: React.FC<CapitalDistributionViewProps> = ({
  top5Sectors,
  onSelectStock,
  currentQuarter,
}) => {
  const [rawCapital, setRawCapital] = useState<string>(() => {
    const saved = localStorage.getItem(CAPITAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved.replace(/,/g, ''));
      if (!isNaN(parsed) && parsed >= 0) {
        return formatInputNumber(parsed);
      }
    }
    return formatInputNumber(DEFAULT_CAPITAL);
  });

  const numericCapital = useMemo(() => {
    const cleaned = rawCapital.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }, [rawCapital]);

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, commas, and at most a single decimal point while typing
    if (/^[0-9,]*\.?[0-9]*$/.test(val)) {
      setRawCapital(val);
      const cleaned = val.replace(/,/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed >= 0) {
        localStorage.setItem(CAPITAL_STORAGE_KEY, String(parsed));
      } else if (cleaned === '') {
        localStorage.setItem(CAPITAL_STORAGE_KEY, '0');
      }
    }
  };

  const handleCapitalBlur = () => {
    if (rawCapital.trim() === '') {
      setRawCapital('0');
      localStorage.setItem(CAPITAL_STORAGE_KEY, '0');
      return;
    }
    setRawCapital(formatInputNumber(numericCapital));
  };

  // Rank the 5 sectors by previous quarter % change (Top 5 market-cap-weighted quarterly move)
  // Best = 5 pts down to Worst = 1 pt, divided by 15 total points
  const rankedAllocations = useMemo<RankedSectorAllocation[]>(() => {
    if (top5Sectors.length === 0) return [];

    const sorted = [...top5Sectors].sort(
      (a, b) =>
        b.avgQtrChangeTop5 - a.avgQtrChangeTop5 ||
        b.totalMarketCap - a.totalMarketCap
    );

    const n = sorted.length;
    const totalPoints = (n * (n + 1)) / 2; // 15 when n = 5

    return sorted.map((sector, idx) => {
      const points = n - idx; // 5, 4, 3, 2, 1
      const sectorShare = totalPoints > 0 ? points / totalPoints : 0;
      const sectorCapital = numericCapital * sectorShare;
      const stocksToBuy = sector.innerTop5Stocks.slice(0, 5);
      const count = stocksToBuy.length || 5;
      const perStockCapital = sectorCapital / count;
      const perStockWeightPct = (sectorShare / count) * 100;

      return {
        sector,
        perfRank: idx + 1,
        points,
        sectorShare,
        sectorCapital,
        perStockCapital,
        perStockWeightPct,
        stocksToBuy,
      };
    });
  }, [top5Sectors, numericCapital]);

  const totalPoints = useMemo(
    () => rankedAllocations.reduce((sum, item) => sum + item.points, 0),
    [rankedAllocations]
  );

  // Flatten all 25 stocks to buy in point-rank order
  const buyList = useMemo(() => {
    return rankedAllocations
      .flatMap((alloc) =>
        alloc.stocksToBuy.map((stock) => {
          const estShares = stock.price > 0 ? alloc.perStockCapital / stock.price : 0;
          return {
            stock,
            alloc,
            estShares,
          };
        })
      )
      .map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
  }, [rankedAllocations]);

  // First month of a quarter check (Jan, Apr, Jul, Oct)
  const [fallbackFirstMonth] = useState<boolean>(() => new Date().getMonth() % 3 === 0);
  const isFirstMonthOfQuarter = currentQuarter
    ? currentQuarter.isFirstMonthOfQuarter
    : fallbackFirstMonth;

  // Stocks that exited the Top 5 rank across the 5 leading sectors
  const stocksToSell = useMemo(() => {
    if (!isFirstMonthOfQuarter) return [];

    return top5Sectors.flatMap((sector) => {
      const entrants = sector.innerTop5Stocks.filter(
        (s) => s.top5QuarterStatus === 'entered'
      );

      return sector.stocks
        .filter((s) => s.top5QuarterStatus === 'exited')
        .map((stock, exitedIdx) => {
          const replacement = entrants[exitedIdx] || entrants[0];
          return {
            stock,
            sector,
            replacement,
          };
        });
    });
  }, [top5Sectors, isFirstMonthOfQuarter]);

  return (
    <div className="allocator-view-container">
      {/* Capital Input & 15-Point Sector Distribution Panel */}
      <section className="allocator-hero-card glass-panel">
        <div className="allocator-hero-top">
          <div className="allocator-title-block">
            <div className="allocator-eyebrow font-mono">
              <Wallet size={14} className="text-cyan" />
              <span>15-POINT MOMENTUM WEIGHTED ALLOCATOR</span>
            </div>
            <h1 className="allocator-heading">Investment Capital Distribution</h1>
            <p id="capital-distribution-rule" className="allocator-description">
              Sectors are ranked by Quarterly (3M) weighted % change from{' '}
              <strong>5 pts</strong> (best) to <strong>1 pt</strong> (worst), divided by{' '}
              <strong>{totalPoints || 15} total points</strong>, then split equally across each
              sector&rsquo;s <strong>Top 5 stocks</strong> (25 total positions).
            </p>
          </div>

          <form
            className="capital-input-form"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            <label htmlFor="investment-capital-input" className="capital-input-label font-mono">
              Investment Capital (USD)
            </label>
            <div className="capital-input-field-wrap">
              <span className="capital-currency-prefix font-mono" aria-hidden="true">
                $
              </span>
              <input
                id="investment-capital-input"
                name="investmentCapital"
                type="text"
                inputMode="decimal"
                enterKeyHint="done"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={rawCapital}
                onChange={handleCapitalChange}
                onBlur={handleCapitalBlur}
                placeholder="10,000"
                aria-describedby="capital-distribution-rule"
                className="capital-amount-input font-mono"
              />
            </div>
          </form>
        </div>

        {/* Visual Proportional Allocation Bar */}
        {rankedAllocations.length > 0 && (
          <div className="sector-points-strip">
            <div className="allocation-stacked-bar" aria-label="Sector Capital Proportions">
              {rankedAllocations.map((alloc) => (
                <div
                  key={alloc.sector.name}
                  className="allocation-bar-segment"
                  style={{
                    width: `${alloc.sectorShare * 100}%`,
                    backgroundColor: alloc.sector.color,
                  }}
                  title={`${alloc.sector.name}: ${alloc.points}/${totalPoints} pts (${(
                    alloc.sectorShare * 100
                  ).toFixed(2)}%) — ${formatCurrency(alloc.sectorCapital)}`}
                />
              ))}
            </div>

            <div className="sector-points-grid">
              {rankedAllocations.map((alloc) => {
                const isQtrPos = alloc.sector.avgQtrChangeTop5 >= 0;
                return (
                  <div
                    key={alloc.sector.name}
                    className="sector-point-card"
                    style={
                      {
                        '--sector-color': alloc.sector.color,
                        '--sector-accent': alloc.sector.accentColor,
                      } as React.CSSProperties
                    }
                  >
                    <div className="spc-top-row">
                      <span
                        className="spc-points-badge font-mono"
                        style={{
                          borderColor: alloc.sector.color,
                          color: alloc.sector.color,
                          backgroundColor: alloc.sector.color.startsWith('#')
                            ? `${alloc.sector.color}18`
                            : undefined,
                        }}
                      >
                        <Award size={11} />
                        {alloc.points} {alloc.points === 1 ? 'PT' : 'PTS'} &bull;{' '}
                        {(alloc.sectorShare * 100).toFixed(1)}%
                      </span>
                      <span
                        className={`spc-qtr-move font-mono ${
                          isQtrPos ? 'text-green' : 'text-rose'
                        }`}
                        title="Top 5 Market-Cap-Weighted Quarterly (3M) Change"
                      >
                        {isQtrPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {formatPercent(alloc.sector.avgQtrChangeTop5)}
                      </span>
                    </div>

                    <div className="spc-sector-name" title={alloc.sector.name}>
                      <span
                        className="spc-color-dot"
                        style={{ backgroundColor: alloc.sector.color }}
                      />
                      <span>{alloc.sector.name}</span>
                    </div>

                    <div className="spc-amounts font-mono">
                      <span className="spc-sector-total">
                        {formatCurrency(alloc.sectorCapital)}
                      </span>
                      <span className="spc-per-stock">
                        {formatCurrency(alloc.perStockCapital)} / stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* First Month of Quarter Only: Stocks to Sell (Exited Top 5) */}
      {isFirstMonthOfQuarter && (
        <section className="allocator-sell-section glass-panel">
          <div className="allocator-section-header sell-header">
            <div className="alloc-sec-title-group">
              <div className="alloc-sec-title-row">
                <AlertTriangle size={18} className="text-rose" />
                <h2 className="alloc-sec-title">Stocks to Sell (Exited Top 5)</h2>
                <span className="sell-count-badge font-mono">
                  {stocksToSell.length} {stocksToSell.length === 1 ? 'Stock' : 'Stocks'}
                </span>
              </div>
              <p className="alloc-sec-subtitle">
                Quarterly rebalance window active for{' '}
                <strong>
                  {currentQuarter
                    ? `${currentQuarter.currentMonthName} (${currentQuarter.label} Month 1)`
                    : 'Month 1 of Quarter'}
                </strong>
                . These constituents dropped out of their sector&rsquo;s Top 5 rank since{' '}
                {currentQuarter?.prevQuarterLabel || 'prior quarter'}.
              </p>
            </div>
          </div>

          {stocksToSell.length === 0 ? (
            <div className="empty-sell-state font-mono">
              No stocks exited the Top 5 rank across the 5 leading sectors this quarter.
            </div>
          ) : (
            <div
              className="table-wrapper"
              tabIndex={0}
              role="region"
              aria-label="Stocks to Sell that exited Top 5 rank"
            >
              <table className="stocks-data-table allocator-sell-table">
                <thead>
                  <tr>
                    <th className="sell-col-action">Action</th>
                    <th className="sell-col-symbol">Company</th>
                    <th className="sell-col-sector">Sector</th>
                    <th className="sell-col-rank">Rank Shift</th>
                    <th className="sell-col-replaced">Replaced By</th>
                    <th className="sell-col-price">Price</th>
                    <th className="sell-col-qtr">
                      <span className="th-desktop">Quarterly Chg</span>
                      <span className="th-mobile">Qtr Chg</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stocksToSell.map(({ stock, sector, replacement }) => {
                    const qtrVal = stock.perf3M ?? 0;
                    const isQtrPos = qtrVal >= 0;
                    return (
                      <tr
                        key={stock.symbol}
                        className="stock-table-row row-exited-top5"
                        onClick={() => onSelectStock(stock)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Sell ${stock.symbol} ${stock.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectStock(stock);
                          }
                        }}
                      >
                        <td className="sell-col-action">
                          <span className="action-order-pill sell font-mono">
                            <ArrowDownRight size={11} />
                            SELL
                          </span>
                        </td>

                        <td className="sell-col-symbol">
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
                              <span className="stock-mobile-industry">{sector.name}</span>
                            </div>
                          </div>
                        </td>

                        <td className="sell-col-sector">
                          <span className="alloc-sector-chip">
                            <span
                              className="spc-color-dot"
                              style={{ backgroundColor: sector.color }}
                            />
                            <span>{sector.name}</span>
                          </span>
                        </td>

                        <td className="sell-col-rank font-mono">
                          <span className="rank-shift-badge text-rose">
                            #{stock.prevQuarterRankInSector} &rarr; #{stock.rankInSector}
                          </span>
                        </td>

                        <td className="sell-col-replaced font-mono">
                          {replacement ? (
                            <span className="replacement-pill text-green">
                              <ArrowUpRight size={12} />
                              {replacement.symbol} (#{replacement.rankInSector})
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        <td className="sell-col-price font-mono">
                          {formatPrice(stock.price)}
                        </td>

                        <td className="sell-col-qtr">
                          {stock.perf3M !== null && stock.perf3M !== undefined ? (
                            <span
                              className={`change-pill font-mono ${
                                isQtrPos ? 'positive' : 'negative'
                              }`}
                            >
                              {isQtrPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                              {formatPercent(stock.perf3M)}
                            </span>
                          ) : (
                            <span className="text-muted font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* 25 Stocks to Buy Table */}
      <section className="allocator-buy-section glass-panel">
        <div className="allocator-section-header buy-header">
          <div className="alloc-sec-title-group">
            <div className="alloc-sec-title-row">
              <ShoppingCart size={18} className="text-cyan" />
              <h2 className="alloc-sec-title">
                {buyList.length} Stocks to Buy (Top 5 per Sector)
              </h2>
              <span className="buy-total-badge font-mono">
                {formatCurrency(numericCapital)} Total
              </span>
            </div>
            <p className="alloc-sec-subtitle">
              Ordered from highest-ranked quarterly sector (<strong>5 pts &bull; 6.67%/stock</strong>) to
              lowest-ranked sector (<strong>1 pt &bull; 1.33%/stock</strong>). Click any stock to inspect
              its TradingView chart.
            </p>
          </div>
        </div>

        <div
          className="table-wrapper"
          tabIndex={0}
          role="region"
          aria-label="25 Stocks to Buy Capital Distribution Table"
        >
          <table className="stocks-data-table allocator-buy-table">
            <thead>
              <tr>
                <th className="alloc-col-rank">#</th>
                <th className="alloc-col-symbol">Company</th>
                <th className="alloc-col-sector">Sector &amp; Tier</th>
                <th className="alloc-col-qtr">Quarterly Chg</th>
                <th className="alloc-col-price">Price</th>
                <th className="alloc-col-weight">Weight</th>
                <th className="alloc-col-amount">
                  <span className="th-desktop">Allocation ($)</span>
                  <span className="th-mobile">Buy ($)</span>
                </th>
                <th className="alloc-col-shares">
                  <span className="th-desktop">Est. Shares</span>
                  <span className="th-mobile">Shares</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {buyList.map(({ order, stock, alloc, estShares }) => {
                const isEntered = stock.top5QuarterStatus === 'entered';
                const qtrVal = stock.perf3M ?? 0;
                const isQtrPos = qtrVal >= 0;

                return (
                  <tr
                    key={stock.symbol}
                    className={`stock-table-row ${isEntered ? 'row-entered-top5' : ''}`}
                    onClick={() => onSelectStock(stock)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Buy ${formatCurrency(alloc.perStockCapital)} of ${stock.symbol} ${stock.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectStock(stock);
                      }
                    }}
                  >
                    <td className="alloc-col-rank">
                      <div className="rank-cell-wrapper">
                        <span
                          className="rank-badge top-five font-mono"
                          style={{
                            borderColor: alloc.sector.color,
                            color: alloc.sector.color,
                            backgroundColor: alloc.sector.color.startsWith('#')
                              ? `${alloc.sector.color}18`
                              : undefined,
                          }}
                          title={`Allocation item #${order} • Rank #${stock.rankInSector} in ${alloc.sector.name}`}
                        >
                          {order}
                        </span>
                      </div>
                    </td>

                    <td className="alloc-col-symbol">
                      <div className="symbol-cell-content">
                        <StockLogo symbol={stock.symbol} logoId={stock.logoId} />
                        <div className="symbol-details">
                          <div className="symbol-row">
                            <span className="stock-symbol font-mono">{stock.symbol}</span>
                            <span className="action-order-pill buy font-mono">BUY</span>
                            {isEntered && (
                              <span
                                className="quarter-status-pill entered font-mono"
                                title={`Entered Top 5 this quarter (was #${stock.prevQuarterRankInSector})`}
                              >
                                <ArrowUpRight size={10} />
                                <span className="pill-text-desktop">NEW</span>
                                <span className="pill-text-mobile">IN</span>
                              </span>
                            )}
                          </div>
                          <span className="stock-company-name" title={stock.name}>
                            {stock.name}
                          </span>
                          <span className="stock-mobile-industry font-mono">
                            {alloc.sector.name} &bull; {alloc.points}pt
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="alloc-col-sector">
                      <div className="alloc-sector-cell">
                        <span className="alloc-sector-chip">
                          <span
                            className="spc-color-dot"
                            style={{ backgroundColor: alloc.sector.color }}
                          />
                          <span>{alloc.sector.name}</span>
                        </span>
                        <span className="alloc-points-sub font-mono">
                          {alloc.points} {alloc.points === 1 ? 'pt' : 'pts'} &bull; Sector #
                          {stock.rankInSector}
                        </span>
                      </div>
                    </td>

                    <td className="alloc-col-qtr">
                      {stock.perf3M !== null && stock.perf3M !== undefined ? (
                        <span
                          className={`change-pill font-mono ${isQtrPos ? 'positive' : 'negative'}`}
                        >
                          {isQtrPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {formatPercent(stock.perf3M)}
                        </span>
                      ) : (
                        <span className="text-muted font-mono">—</span>
                      )}
                    </td>

                    <td className="alloc-col-price font-mono">
                      {formatPrice(stock.price)}
                    </td>

                    <td className="alloc-col-weight font-mono">
                      <span className="alloc-weight-pill">
                        {alloc.perStockWeightPct.toFixed(2)}%
                      </span>
                    </td>

                    <td className="alloc-col-amount font-mono">
                      <div className="alloc-amount-wrap">
                        <span className="alloc-dollar-val">
                          {formatCurrency(alloc.perStockCapital)}
                        </span>
                        <span className="alloc-mobile-weight">
                          {alloc.perStockWeightPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    <td className="alloc-col-shares font-mono">
                      <span className="alloc-shares-val">{formatShares(estShares)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="table-summary-row summary-row-top5">
                <td className="alloc-col-rank">
                  <div className="rank-cell-wrapper">
                    <span className="rank-badge summary-rank-badge top-five font-mono">
                      {buyList.length}
                    </span>
                  </div>
                </td>
                <td className="alloc-col-symbol">
                  <div className="summary-label-block">
                    <span className="summary-label-title">
                      <span className="th-desktop">Total Capital Distributed</span>
                      <span className="th-mobile">Total Distributed</span>
                    </span>
                    <span className="summary-label-sub font-mono">
                      <span className="th-desktop">
                        {totalPoints} / {totalPoints} Points &bull; 5 Sectors &times; 5 Stocks
                      </span>
                      <span className="th-mobile">{totalPoints} pts &bull; 25 Stocks</span>
                    </span>
                  </div>
                </td>
                <td className="alloc-col-sector">
                  <span className="industry-pill summary-method-pill font-mono">
                    {totalPoints} / {totalPoints} pts
                  </span>
                </td>
                <td className="alloc-col-qtr" />
                <td className="alloc-col-price" />
                <td className="alloc-col-weight font-mono">
                  <span className="alloc-weight-pill">100.00%</span>
                </td>
                <td className="alloc-col-amount font-mono">
                  <div className="alloc-amount-wrap">
                    <span className="alloc-dollar-val">
                      {formatCurrency(numericCapital)}
                    </span>
                    <span className="alloc-mobile-weight">100%</span>
                  </div>
                </td>
                <td className="alloc-col-shares" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};
