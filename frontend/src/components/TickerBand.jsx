import React from 'react';
import { CURRENCIES, formatPrice } from '../utils/constants';

export default function TickerBand({ marketData, currency, rates }) {
  const items = [...marketData, ...marketData]; // infinite loop için çift
  return (
    <div className="ticker-container" style={{ height: 36 }}>
      <div className="ticker-track">
        {items.map((asset, i) => (
          <div key={`${asset.id}-${i}`} className="ticker-item">
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}>{asset.symbol}</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>
              {CURRENCIES[currency].symbol}{formatPrice(asset.price, currency, rates)}
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
