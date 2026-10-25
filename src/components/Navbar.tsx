import React, { useState, useEffect } from 'react';
import { RefreshCw, Moon, Sun, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  lastUpdated,
  isLiveLoading,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
  isLiveOnline,
  liveError,
  theme,
  onToggleTheme,
}) => {
  const [nyTime, setNyTime] = useState<string>('');
  const [marketStatus, setMarketStatus] = useState<{ status: string; isOpen: boolean }>({
    status: 'Checking...',
    isOpen: false,
  });

  // Calculate New York Time and US Market Open/Closed Status
  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      // US Eastern Time formatter
      const nyDateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
      const nyDate = new Date(nyDateStr);

      const hours = nyDate.getHours();
      const minutes = nyDate.getMinutes();
      const day = nyDate.getDay(); // 0 is Sunday, 6 is Saturday

      const timeFormatted = nyDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setNyTime(`${timeFormatted} ET`);

      // Market hours: Mon-Fri 9:30 AM to 4:00 PM Eastern
      const totalMinutes = hours * 60 + minutes;
      const isWeekday = day >= 1 && day <= 5;
      const isMarketHours = isWeekday && totalMinutes >= 9 * 60 + 30 && totalMinutes < 16 * 60;
      const isPreMarket = isWeekday && totalMinutes >= 4 * 60 && totalMinutes < 9 * 60 + 30;
      const isAfterHours = isWeekday && totalMinutes >= 16 * 60 && totalMinutes < 20 * 60;

      if (isMarketHours) {
        setMarketStatus({ status: 'US Markets Open', isOpen: true });
      } else if (isPreMarket) {
        setMarketStatus({ status: 'Pre-Market', isOpen: false });
      } else if (isAfterHours) {
        setMarketStatus({ status: 'After-Hours', isOpen: false });
      } else {
        setMarketStatus({ status: 'Markets Closed', isOpen: false });
      }
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="brand-logo">
          <div className="logo-icon-wrap">
            <TrendingUp size={22} className="logo-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">S&amp;P 500</span>
              <span className="brand-badge">TOP 5 OF TOP 5</span>
            </div>
            <span className="brand-subtitle">TradingView 19 Sectors Classification</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* US Market Hours Pill */}
        <div className="market-pill" title={`New York Time: ${nyTime}`}>
          <span className={`pulse-dot ${marketStatus.isOpen ? 'online' : 'after-hours'}`}></span>
          <span className="market-status-text">{marketStatus.status}</span>
          <span className="market-time font-mono">({nyTime})</span>
        </div>

        {/* Live sync status & refresh button */}
        <div className="sync-group">
          <button
            onClick={onRefresh}
            disabled={isLiveLoading}
            className={`btn-sync ${isLiveLoading ? 'syncing' : ''}`}
            title="Fetch real-time quotes from TradingView Scanner"
          >
            <RefreshCw size={15} className={`sync-icon ${isLiveLoading ? 'spin' : ''}`} />
            <span>{isLiveLoading ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          <button
            onClick={onToggleAutoRefresh}
            className={`btn-auto-toggle ${autoRefresh ? 'active' : ''}`}
            title={autoRefresh ? 'Auto-refresh active (30s)' : 'Enable auto-refresh every 30s'}
          >
            <span className="auto-indicator"></span>
            <span>Auto</span>
          </button>
        </div>

        {/* Timestamp */}
        <div className="last-sync-time" title={liveError ? `Last error: ${liveError}` : 'Live data stream'}>
          <Clock size={13} className="time-icon" />
          <span className="font-mono">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
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

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle dark/light theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
