import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Wallet, Plus, Trash2, Sparkles, TrendingUp, TrendingDown,
  X, PieChart, DollarSign, BarChart3, AlertCircle, ChevronDown, Search
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CURRENCIES, formatPrice } from '../utils/constants';

// ─── Add Asset Modal ────────────────────────────────────────────
function AddAssetModal({ onClose, onAdd, marketData }) {
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1); // 1=asset select, 2=amount fill
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    if (!search) return marketData;
    const q = search.toLowerCase();
    return marketData.filter(m => m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q));
  }, [search, marketData]);

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setBuyPrice(String(asset.price?.toFixed(2) || ''));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !quantity || !buyPrice) return;
    setSubmitting(true);
    setError('');
    try {
      await onAdd({
        symbol: selectedAsset.symbol,
        asset_name: selectedAsset.name,
        asset_type: selectedAsset.type,
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        notes: notes || null,
      });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Bir hata oluştu. Backend bağlantısını kontrol edin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div style={{ width: 480, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-normal)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden', animation: 'scaleIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 2 && (
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px 6px', borderRadius: 'var(--radius-sm)', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >← Geri</button>
            )}
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
              {step === 1 ? 'Varlık Seç' : `${selectedAsset?.symbol} Ekle`}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: 6, display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        {/* Step 1: Asset selector */}
        {step === 1 && (
          <div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Varlık ara (BTC, AAPL...)"
                style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 360 }}>
              {filtered.map(asset => (
                <button key={asset.symbol} onClick={() => handleSelectAsset(asset)}
                  style={{ width: '100%', padding: '12px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(68,136,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: asset.type === 'crypto' ? 'rgba(0,212,255,0.12)' : 'rgba(68,136,255,0.12)', border: `1px solid ${asset.type === 'crypto' ? 'rgba(0,212,255,0.25)' : 'rgba(68,136,255,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: asset.type === 'crypto' ? 'var(--accent-cyan)' : 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
                    {asset.symbol.slice(0, 3)}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{asset.symbol}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{asset.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>${asset.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 'var(--radius-full)', background: asset.type === 'crypto' ? 'rgba(0,212,255,0.1)' : 'rgba(68,136,255,0.1)', color: asset.type === 'crypto' ? 'var(--accent-cyan)' : 'var(--accent-blue)', fontWeight: 700 }}>
                      {asset.type === 'crypto' ? 'Kripto' : 'Hisse'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Amount form */}
        {step === 2 && selectedAsset && (
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Selected asset preview */}
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(68,136,255,0.06)', border: '1px solid rgba(68,136,255,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(68,136,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif' }}>
                {selectedAsset.symbol.slice(0, 3)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{selectedAsset.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Güncel: ${selectedAsset.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 7, display: 'block' }}>Miktar (Adet)</label>
              <input type="number" step="any" min="0" placeholder="Örn: 0.5" value={quantity} onChange={e => setQuantity(e.target.value)} required
                style={{ width: '100%', padding: '11px 14px', fontSize: 15, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', borderRadius: 'var(--radius-md)', background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(68,136,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-normal)'}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 7, display: 'block' }}>Alış Fiyatı (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 15, fontWeight: 700 }}>$</span>
                <input type="number" step="any" min="0" placeholder="65000" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} required
                  style={{ width: '100%', paddingLeft: 26, paddingRight: 14, paddingTop: 11, paddingBottom: 11, fontSize: 15, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', borderRadius: 'var(--radius-md)', background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(68,136,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-normal)'}
                />
              </div>
            </div>

            {quantity && buyPrice && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 12, color: 'var(--text-secondary)' }}>
                Toplam maliyet: <strong style={{ color: 'var(--accent-green)' }}>${(parseFloat(quantity) * parseFloat(buyPrice)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 7, display: 'block' }}>Not (Opsiyonel)</label>
              <input type="text" placeholder="Örn: Uzun vadeli yatırım" value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 'var(--radius-md)', background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(68,136,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-normal)'}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', fontSize: 12, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={!quantity || !buyPrice || submitting}
              style={{ padding: '13px', borderRadius: 'var(--radius-md)', background: (!quantity || !buyPrice || submitting) ? 'rgba(68,136,255,0.3)' : 'linear-gradient(135deg, #4488ff, #a855f7)', color: 'white', border: 'none', cursor: (!quantity || !buyPrice || submitting) ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {submitting ? (
                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Ekleniyor...</>
              ) : (
                <><Plus size={15} /> Portföye Ekle</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── AI Analysis Modal ──────────────────────────────────────────
function AIAnalysisModal({ analysis, loading, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div style={{ width: 580, maxWidth: '90vw', maxHeight: '80vh', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden', animation: 'scaleIn 0.2s ease', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(168,85,247,0.06), rgba(68,136,255,0.06))' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'Space Grotesk, sans-serif' }}>
            <Sparkles size={16} /> AI Portföy Analizi
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: 6, display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16, color: 'var(--text-muted)' }}>
              <Sparkles size={36} style={{ color: 'var(--accent-purple)', animation: 'float 3s ease-in-out infinite' }} />
              <span style={{ fontSize: 13 }}>AI portföyünüzü analiz ediyor...</span>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {analysis}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function PortfolioPage() {
  const { marketData, currency, rates, t, API_BASE_URL } = useAppContext();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('nt_token')}` } });

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/portfolio/`, getAuthHeaders());
      setPortfolio(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleAdd = async (itemData) => {
    // throws on error so the modal can display the message
    await axios.post(`${API_BASE_URL}/api/portfolio/`, itemData, getAuthHeaders());
    setShowAddModal(false);
    await fetchPortfolio();
  };



  const handleDelete = async (id) => {
    try { await axios.delete(`${API_BASE_URL}/api/portfolio/${id}`, getAuthHeaders()); fetchPortfolio(); }
    catch (e) { console.error(e); }
  };

  const handleAIAnalyze = async () => {
    setShowAIModal(true);
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const marketPrices = {};
      marketData.forEach(m => { marketPrices[m.symbol] = m.price; });
      const res = await axios.post(`${API_BASE_URL}/api/ai/analyze-portfolio`, {
        portfolio: portfolio.map(p => ({
          symbol: p.symbol, asset_name: p.asset_name, asset_type: p.asset_type,
          quantity: p.quantity, buy_price: p.buy_price
        })),
        market_prices: marketPrices
      });
      setAiAnalysis(res.data.analysis);
    } catch { setAiAnalysis('Analiz sırasında hata oluştu. Backend bağlantısını kontrol edin.'); }
    finally { setAiLoading(false); }
  };

  // ─── Portfolio Calculations ──────────────────────────────────
  const portfolioStats = useMemo(() => {
    if (!portfolio.length) return null;
    let totalCost = 0, totalValue = 0;
    const items = portfolio.map(item => {
      const currentPrice = marketData.find(m => m.symbol === item.symbol)?.price ?? item.buy_price;
      const cost = item.quantity * item.buy_price;
      const value = item.quantity * currentPrice;
      const pnl = value - cost;
      const pnlPct = item.buy_price > 0 ? ((currentPrice - item.buy_price) / item.buy_price) * 100 : 0;
      totalCost += cost;
      totalValue += value;
      return { ...item, currentPrice, cost, value, pnl, pnlPct };
    });
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const cryptoVal = items.filter(i => i.asset_type === 'crypto').reduce((s, i) => s + i.value, 0);
    const stockVal = items.filter(i => i.asset_type === 'stock').reduce((s, i) => s + i.value, 0);

    return { items, totalCost, totalValue, totalPnl, totalPnlPct, cryptoVal, stockVal };
  }, [portfolio, marketData]);

  const displayRate = rates[currency] || 1;
  const currSym = CURRENCIES[currency].symbol;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={24} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Portföyüm</h2>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>Varlıklarını takip et ve AI ile analiz et</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {portfolio.length > 0 && (
            <button onClick={handleAIAnalyze}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-purple)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.22)'; e.currentTarget.style.boxShadow = 'var(--glow-purple)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Sparkles size={15} /> AI Analiz
            </button>
          )}
          <button onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'linear-gradient(135deg, #4488ff, #a855f7)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(68,136,255,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Plus size={15} /> Varlık Ekle
          </button>
        </div>
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      )}

      {/* ─── Empty state ─── */}
      {!loading && portfolio.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={32} style={{ color: 'var(--accent-purple)', opacity: 0.7 }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>Portföy Boş</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 300 }}>İlk varlığını ekleyerek portföyünü oluşturmaya başla. AI sana kişiselleştirilmiş analiz sunacak.</div>
          </div>
          <button onClick={() => setShowAddModal(true)}
            style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: 'linear-gradient(135deg, #4488ff, #a855f7)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Plus size={15} /> İlk Varlığı Ekle
          </button>
        </div>
      )}

      {/* ─── Stats Cards ─── */}
      {portfolioStats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Toplam Değer', value: `${currSym}${(portfolioStats.totalValue * displayRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <DollarSign size={18} />, color: 'var(--accent-blue)', bg: 'rgba(68,136,255,0.1)', border: 'rgba(68,136,255,0.2)' },
              { label: 'Toplam Maliyet', value: `${currSym}${(portfolioStats.totalCost * displayRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <BarChart3 size={18} />, color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border-subtle)' },
              { label: 'Kar / Zarar', value: `${portfolioStats.totalPnl >= 0 ? '+' : ''}${currSym}${(portfolioStats.totalPnl * displayRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, sub: `${portfolioStats.totalPnlPct >= 0 ? '+' : ''}${portfolioStats.totalPnlPct.toFixed(2)}%`, icon: portfolioStats.totalPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />, color: portfolioStats.totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', bg: portfolioStats.totalPnl >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)', border: portfolioStats.totalPnl >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)' },
              { label: 'Varlık Sayısı', value: portfolio.length, sub: `${portfolioStats.cryptoVal > 0 && portfolioStats.stockVal > 0 ? 'Kripto + Hisse' : portfolioStats.cryptoVal > 0 ? 'Kripto' : 'Hisse'}`, icon: <Wallet size={18} />, color: 'var(--accent-purple)', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
            ].map((card, i) => (
              <div key={i} style={{ padding: '18px 20px', borderRadius: 'var(--radius-lg)', background: card.bg, border: `1px solid ${card.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: card.color }}>
                  {card.icon}
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: card.color }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Allocation bar */}
          {portfolioStats.totalValue > 0 && (portfolioStats.cryptoVal > 0 || portfolioStats.stockVal > 0) && (
            <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Dağılım</span>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>₿ Kripto {((portfolioStats.cryptoVal / portfolioStats.totalValue) * 100).toFixed(1)}%</span>
                  <span style={{ fontSize: 11, color: 'var(--accent-blue)' }}>📈 Hisse {((portfolioStats.stockVal / portfolioStats.totalValue) * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(portfolioStats.cryptoVal / portfolioStats.totalValue) * 100}%`, background: 'linear-gradient(90deg, var(--accent-cyan), #00a0cc)', transition: 'width 0.5s ease' }} />
                <div style={{ flex: 1, background: 'linear-gradient(90deg, #4488ff, var(--accent-purple))' }} />
              </div>
            </div>
          )}

          {/* ─── Assets Table ─── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 40px', gap: 8 }}>
              {['Varlık', 'Miktar', 'Alış', 'Güncel', 'P&L', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', textAlign: i > 0 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>
            {portfolioStats.items.map(item => (
              <div key={item.id}
                style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 40px', gap: 8, alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Asset info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: item.asset_type === 'crypto' ? 'rgba(0,212,255,0.1)' : 'rgba(68,136,255,0.1)', border: `1px solid ${item.asset_type === 'crypto' ? 'rgba(0,212,255,0.2)' : 'rgba(68,136,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: item.asset_type === 'crypto' ? 'var(--accent-cyan)' : 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {item.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{item.symbol}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.asset_name.length > 16 ? item.asset_name.slice(0, 16) + '…' : item.asset_name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{item.quantity}</div>
                <div style={{ textAlign: 'right', fontSize: 12.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{currSym}{(item.buy_price * displayRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{currSym}{(item.currentPrice * displayRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: item.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {item.pnl >= 0 ? '+' : ''}{currSym}{(item.pnl * displayRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 10.5, color: item.pnlPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                    {item.pnlPct >= 0 ? '+' : ''}{item.pnlPct.toFixed(2)}%
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid transparent', color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.15s', marginLeft: 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.12)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.25)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── Modals ─── */}
      {showAddModal && <AddAssetModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} marketData={marketData} />}
      {showAIModal && <AIAnalysisModal analysis={aiAnalysis} loading={aiLoading} onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
