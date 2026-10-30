const INT_FMT = new Intl.NumberFormat('en-US');
const PRICE_FMT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const SHARES_4_FMT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function formatMarketCap(val: number): string {
  if (!val || isNaN(val)) return '$0';
  if (val >= 1e12) {
    return `$${(val / 1e12).toFixed(2)}T`;
  }
  if (val >= 1e9) {
    return `$${(val / 1e9).toFixed(2)}B`;
  }
  if (val >= 1e6) {
    return `$${(val / 1e6).toFixed(1)}M`;
  }
  return `$${INT_FMT.format(val)}`;
}

export function formatPrice(price: number): string {
  if (price === undefined || price === null || isNaN(price)) return '$0.00';
  return `$${PRICE_FMT.format(price)}`;
}

export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return `$${PRICE_FMT.format(amount)}`;
}

export function formatShares(shares: number): string {
  if (!shares || isNaN(shares) || !isFinite(shares)) return '0';
  if (shares >= 100) return PRICE_FMT.format(shares);
  return SHARES_4_FMT.format(shares);
}

export function formatPercent(val: number | null | undefined, includeSign = true): string {
  if (val === null || val === undefined || isNaN(val)) return '0.00%';
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export function formatVolume(val: number): string {
  if (!val || isNaN(val)) return '0';
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return INT_FMT.format(val);
}

export function getLogoUrl(logoId: string | null): string | null {
  if (!logoId) return null;
  // If logoId is an icon name from TradingView CDN
  return `https://s3-symbol-logo.tradingview.com/${logoId}.svg`;
}
