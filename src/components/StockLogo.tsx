import React, { useState } from 'react';
import { getLogoUrl } from '../utils/formatters';

interface StockLogoProps {
  symbol: string;
  logoId: string | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol,
  logoId,
  className = 'stock-logo-wrap',
  imgClassName = 'stock-logo-img',
  fallbackClassName = 'stock-logo-fallback font-mono',
}) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getLogoUrl(logoId);

  React.useEffect(() => {
    setHasError(false);
  }, [logoId, symbol]);

  return (
    <div className={className}>
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={`${symbol} logo`}
          className={imgClassName}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={fallbackClassName}>{symbol.slice(0, 2)}</span>
      )}
    </div>
  );
};
