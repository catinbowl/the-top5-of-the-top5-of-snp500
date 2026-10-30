import React, { useState, memo } from 'react';
import { getLogoUrl } from '../utils/formatters';

interface StockLogoProps {
  symbol: string;
  logoId: string | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

export const StockLogo: React.FC<StockLogoProps> = memo(({
  symbol,
  logoId,
  className = 'stock-logo-wrap',
  imgClassName = 'stock-logo-img',
  fallbackClassName = 'stock-logo-fallback font-mono',
}) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const logoUrl = getLogoUrl(logoId);
  const hasError = logoUrl !== null && failedUrl === logoUrl;

  return (
    <div className={className}>
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={`${symbol} logo`}
          className={imgClassName}
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(logoUrl)}
        />
      ) : (
        <span className={fallbackClassName}>{symbol.slice(0, 2)}</span>
      )}
    </div>
  );
});
