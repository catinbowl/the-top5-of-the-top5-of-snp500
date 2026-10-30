import React, { useState, useEffect, useMemo, memo } from 'react';
import type { QuarterInfo } from '../types';
import { RefreshCw, Moon, Sun, TrendingUp, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface NavbarProps {
  lastUpdated: Date;
  isLiveLoading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  isLiveOnline: boolean;
  liveError: string | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentQuarter?: QuarterInfo;
}

const NY_PARTS_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const NY_DISPLAY_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const SYNC_TIME_FMT = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const WEEKDAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

function computeNyMarketSnapshot(now: Date): {
  nyTime: string;
  status: string;
  isOpen: boolean;
} {
  const parts = NY_PARTS_FMT.formatToParts(now);
  let weekday = '';
  let hours = 0;
  let minutes = 0;

  for (const part of parts) {
    if (part.type === 'weekday') weekday = part.value;
    else if (part.type === 'hour') hours = Number(part.value);
    else if (part.type === 'minute') minutes = Number(part.value);
  }

  const nyTime = `${NY_DISPLAY_FMT.format(now)} ET`;
  const totalMinutes = hours * 60 + minutes;
  const isWeekday = WEEKDAYS.has(weekday);
  const isMarketHours = isWeekday && totalMinutes >= 9 * 60 + 30 && totalMinutes < 16 * 60;
  const isPreMarket = isWeekday && totalMinutes >= 4 * 60 && totalMinutes < 9 * 60 + 30;
  const isAfterHours = isWeekday && totalMinutes >= 16 * 60 && totalMinutes < 20 * 60;

  if (isMarketHours) {
    return { nyTime, status: 'US Markets Open', isOpen: true };
  }
  if (isPreMarket) {
    return { nyTime, status: 'Pre-Market', isOpen: false };
  }
  if (isAfterHours) {
    return { nyTime, status: 'After-Hours', isOpen: false };
  }
  return { nyTime, status: 'Markets Closed', isOpen: false };
}

export const Navbar: React.FC<NavbarProps> = memo(({
  lastUpdated,
  isLiveLoading,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
  isLiveOnline,
  liveError,
  theme,
  onToggleTheme,
  currentQuarter,
}) => {
  const [marketSnapshot, setMarketSnapshot] = useState(() =>
    computeNyMarketSnapshot(new Date())
  );

  // Sync New York Time & US Market Status once per minute (pausing while tab is hidden)
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextTick = () => {
      if (timerId !== null) clearTimeout(timerId);
      if (document.hidden) return;
      const msUntilNextMinute = 60_000 - (Date.now() % 60_000) + 50;
      timerId = setTimeout(() => {
        const next = computeNyMarketSnapshot(new Date());
        setMarketSnapshot((prev) =>
          prev.nyTime === next.nyTime &&
          prev.status === next.status &&
          prev.isOpen === next.isOpen
            ? prev
            : next
        );
        scheduleNextTick();
      }, msUntilNextMinute);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const next = computeNyMarketSnapshot(new Date());
        setMarketSnapshot((prev) =>
          prev.nyTime === next.nyTime &&
          prev.status === next.status &&
          prev.isOpen === next.isOpen
            ? prev
            : next
        );
        scheduleNextTick();
      } else if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    scheduleNextTick();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (timerId !== null) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const formattedSyncTime = useMemo(
    () => SYNC_TIME_FMT.format(lastUpdated),
    [lastUpdated]
  );

  return (
    <header className="navbar-container">
      {/* Brand Logo & Title */}
      <div className="brand-logo">
        <div className="logo-icon-wrap">
          <TrendingUp size={20} className="logo-icon" />
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-title">S&amp;P 500</span>
            <span className="brand-badge font-mono">TOP 5</span>
          </div>
          <span className="brand-subtitle">TradingView 19 Sectors Classification</span>
        </div>
      </div>

      {/* Status Bar: Quarter, Market Hours, Auto Refresh, Timestamp */}
      <div className="navbar-status-bar">
        {/* Active Quarter Indicator */}
        {currentQuarter && (
          <div
            className="quarter-nav-pill"
            title={`Active Rebalance Quarter: ${currentQuarter.label} (${currentQuarter.dateRange}) • Next quarterly rebalance in ~${currentQuarter.daysRemaining} days`}
          >
            <Calendar size={13} className="quarter-nav-icon text-cyan" />
            <span className="quarter-nav-label font-mono">
              <strong>{currentQuarter.label}</strong>
              <span className="quarter-nav-status">Running</span>
            </span>
          </div>
        )}

        {/* US Market Hours Pill */}
        <div className="market-pill" title={`New York Time: ${marketSnapshot.nyTime}`}>
          <span className={`pulse-dot ${marketSnapshot.isOpen ? 'online' : 'after-hours'}`}></span>
          <span className="market-status-text">{marketSnapshot.status}</span>
          <span className="market-time font-mono">({marketSnapshot.nyTime})</span>
        </div>

        {/* Auto Refresh toggle */}
        <button
          onClick={onToggleAutoRefresh}
          className={`btn-auto-toggle ${autoRefresh ? 'active' : ''}`}
          title={autoRefresh ? 'Auto-refresh active (30s)' : 'Enable auto-refresh every 30s'}
        >
          <span className="auto-indicator"></span>
          <span>Auto</span>
        </button>

        {/* Timestamp */}
        <div className="last-sync-time" title={liveError ? `Last error: ${liveError}` : 'Live data stream'}>
          <Clock size={13} className="time-icon" />
          <span className="font-mono">{formattedSyncTime}</span>
          {isLiveOnline ? (
            <span title="Connected to TradingView Scanner" className="icon-badge">
              <CheckCircle2 size={13} className="icon-success" />
            </span>
          ) : (
            <span title={liveError || 'Using cached snapshot'} className="icon-badge">
              <AlertCircle size={13} className="icon-warning" />
            </span>
          )}
        </div>
      </div>

      {/* Actions: Sync Live + Theme Toggle */}
      <div className="navbar-actions">
        <button
          onClick={onRefresh}
          disabled={isLiveLoading}
          className={`btn-sync ${isLiveLoading ? 'syncing' : ''}`}
          title="Fetch real-time quotes from TradingView Scanner"
        >
          <RefreshCw size={14} className={`sync-icon ${isLiveLoading ? 'spin' : ''}`} />
          <span className="sync-btn-text">{isLiveLoading ? 'Syncing...' : 'Sync Live'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle dark/light theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
});
