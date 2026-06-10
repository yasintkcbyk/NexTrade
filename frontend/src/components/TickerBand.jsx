import React from 'react';
import { CURRENCIES, formatPrice } from '../utils/constants';

export default function TickerBand({ marketData, currency, rates }) {
  const importantAssetIds = [
    'bitcoin', 'ethereum', 'GC=F', 'BZ=F', 'AAPL', 'NVDA', 'THYAO.IS'
  ];
  
  const baseImportant = marketData.filter(a => importantAssetIds.includes(a.id));
  
  const forexItems = [
    { id: 'forex-usd', symbol: 'USD', price: 1, change: 0 },
    { id: 'forex-eur', symbol: 'EUR', price: rates['EUR'] ? 1 / rates['EUR'] : 1.08, change: 0 },
    { id: 'forex-gbp', symbol: 'GBP', price: rates['GBP'] ? 1 / rates['GBP'] : 1.25, change: 0 }
  ];

  const combinedItems = [...forexItems, ...baseImportant];
  
  // To ensure the infinite CSS animation is seamless, we repeat the items a few times
  const items = [...combinedItems, ...combinedItems, ...combinedItems, ...combinedItems];

  return (
    <div className="ticker-container" style={{ height: 36 }}>
      <div className="ticker-track">
        {items.map((asset, i) => (
          <div key={`${asset.id}-${i}`} className="ticker-item">
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}>{asset.symbol}</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>
              {formatPrice(asset.price, currency, rates)}
            </span>
            <span style={{ color: (asset.change || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 10.5, fontWeight: 700 }}>
              {(asset.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(asset.change || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
