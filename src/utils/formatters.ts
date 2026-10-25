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
  return `$${val.toLocaleString()}`;
}

export function formatPrice(price: number): string {
  if (price === undefined || price === null || isNaN(price)) return '$0.00';
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  return val.toLocaleString();
}

export function getLogoUrl(logoId: string | null): string | null {
  if (!logoId) return null;
  // If logoId is an icon name from TradingView CDN
  return `https://s3-symbol-logo.tradingview.com/${logoId}.svg`;
}
