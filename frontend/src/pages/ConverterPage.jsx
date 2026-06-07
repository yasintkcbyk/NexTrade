import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRightLeft, Calculator, ChevronDown, Search, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CURRENCIES } from '../utils/constants';

// Asset type colors
const TYPE_CONFIG = {
  crypto: { color: 'var(--accent-cyan)', bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.25)', label: 'Kripto' },
  stock:  { color: 'var(--accent-blue)', bg: 'rgba(68,136,255,0.12)', border: 'rgba(68,136,255,0.25)', label: 'Hisse' },
  fiat:   { color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', label: 'Döviz' },
};

function AssetDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selected = options.find(o => o.symbol === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.name.toLowerCase().includes(q) || o.symbol.toLowerCase().includes(q));
  }, [options, search]);

  const cfg = selected ? TYPE_CONFIG[selected.type] : TYPE_CONFIG.fiat;

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 8 }}>
        {label}
      </div>

      {/* Selected display */}
      <button
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: open ? 'rgba(13,21,38,1)' : 'rgba(13,21,38,0.8)',
          border: open ? `1px solid rgba(68,136,255,0.5)` : '1px solid var(--border-normal)',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: open ? '0 0 0 3px rgba(68,136,255,0.1)' : 'none',
        }}
      >
        {selected ? (
          <>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: cfg.color,
              fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0
            }}>
              {selected.symbol.slice(0, 3)}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                {selected.symbol}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{selected.name}</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: 700 }}>
              {TYPE_CONFIG[selected.type]?.label}
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Varlık seçin...</span>
        )}
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-card)', border: '1px solid var(--border-normal)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden', animation: 'fadeIn 0.15s ease',
          maxHeight: 360,
        }}>
          {/* Search */}
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-55%)', color: 'var(--text-dim)' }} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Varlık ara..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 290 }}>
            {filtered.map(opt => {
              const c = TYPE_CONFIG[opt.type] || TYPE_CONFIG.fiat;
              return (
                <button
                  key={opt.symbol}
                  onClick={() => { onChange(opt.symbol); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', padding: '10px 14px', background: opt.symbol === value ? 'rgba(68,136,255,0.1)' : 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 0.15s', borderBottom: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={e => { if (opt.symbol !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (opt.symbol !== value) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 11, color: c.color, fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0
                  }}>
                    {opt.symbol.slice(0, 3)}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: opt.symbol === value ? 'var(--accent-blue)' : 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {opt.symbol}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${opt.priceInUSD?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                    <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 'var(--radius-full)', background: c.bg, color: c.color, fontWeight: 700 }}>
                      {TYPE_CONFIG[opt.type]?.label}
                    </span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConverterPage() {
  const { marketData, rates } = useAppContext();

  const assetOptions = useMemo(() => {
    const list = marketData.map(m => ({
      id: m.symbol, name: m.name, symbol: m.symbol, priceInUSD: m.price, type: m.type
    }));
    Object.keys(CURRENCIES).forEach(c => {
      list.push({ id: c, name: CURRENCIES[c].label, symbol: c, priceInUSD: rates[c] ? 1 / rates[c] : 0, type: 'fiat' });
    });
    return list.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [marketData, rates]);

  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('TRY');
  const [amount, setAmount] = useState('1');

  const fromData = assetOptions.find(a => a.symbol === fromAsset);
  const toData   = assetOptions.find(a => a.symbol === toAsset);

  const convertedValue = useMemo(() => {
    if (!fromData || !toData || !amount) return 0;
    return (parseFloat(amount) * fromData.priceInUSD) / toData.priceInUSD;
  }, [fromData, toData, amount]);

  const ratePerOne = useMemo(() => {
    if (!fromData || !toData) return 0;
    return fromData.priceInUSD / toData.priceInUSD;
  }, [fromData, toData]);

  const handleSwap = () => { setFromAsset(toAsset); setToAsset(fromAsset); };

  return (
    <div style={{ padding: 32, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 680, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calculator size={24} style={{ color: 'var(--accent-blue)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Varlık Çevirici</h2>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>Kripto, hisse ve döviz arasında anlık dönüşüm</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', padding: 28, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Amount input */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 10 }}>
            Miktar
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              style={{
                width: '100%', padding: '16px 20px', fontSize: 24, fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-normal)',
                borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(68,136,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-normal)'}
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>
              {fromAsset}
            </span>
          </div>
        </div>

        {/* From / Swap / To row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <AssetDropdown label="Bundan" value={fromAsset} onChange={setFromAsset} options={assetOptions} />

          <button
            onClick={handleSwap}
            title="Değiştir"
            style={{
              marginBottom: 2, width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-blue)', cursor: 'pointer', transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(68,136,255,0.2)'; e.currentTarget.style.transform = 'rotate(180deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(68,136,255,0.1)'; e.currentTarget.style.transform = 'rotate(0)'; }}
          >
            <ArrowRightLeft size={20} />
          </button>

          <AssetDropdown label="Buna" value={toAsset} onChange={setToAsset} options={assetOptions} />
        </div>

        {/* Result */}
        <div style={{
          padding: 24, borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(68,136,255,0.06), rgba(168,85,247,0.06))',
          border: '1px solid rgba(68,136,255,0.12)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Sonuç</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{amount || 0} {fromAsset} =</span>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif' }}>{toAsset}</span>
          </div>

          {fromData && toData && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                1 <strong style={{ color: 'var(--text-secondary)' }}>{fromAsset}</strong> ≈
                <strong style={{ color: 'var(--accent-green)', marginLeft: 6 }}>
                  {ratePerOne.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {toAsset}
                </strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                1 <strong style={{ color: 'var(--text-secondary)' }}>{toAsset}</strong> ≈
                <strong style={{ color: 'var(--accent-cyan)', marginLeft: 6 }}>
                  {(1 / ratePerOne).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {fromAsset}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Quick amounts */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Hızlı Miktarlar</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[0.001, 0.01, 0.1, 1, 5, 10, 100].map(q => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                  background: parseFloat(amount) === q ? 'rgba(68,136,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: parseFloat(amount) === q ? '1px solid rgba(68,136,255,0.4)' : '1px solid var(--border-subtle)',
                  color: parseFloat(amount) === q ? 'var(--accent-blue)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
