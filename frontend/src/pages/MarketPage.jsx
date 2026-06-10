import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronUp, Star, Info, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatPrice, CURRENCIES } from '../utils/constants';
import AssetInfoModal from '../components/AssetInfoModal';

export default function MarketPage({ activeTab, setActiveTab, selectedAsset, setSelectedAsset, setSelectedForDetail, selectedForDetail }) {
  const { marketData, marketLoading, toggleFavorite, favorites, currency, rates, t, API_BASE_URL } = useAppContext();
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' });
  const [subTab, setSubTab] = useState('all'); // all | favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const filteredData = useMemo(() => {
    let list = marketData.filter(item => {
      const matchType = item.type === activeTab;
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFav = subTab === 'all' || favorites.includes(item.symbol);
      return matchType && matchSearch && matchFav;
    });

    list.sort((a, b) => {
      const aFav = favorites.includes(a.symbol);
      const bFav = favorites.includes(b.symbol);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [marketData, activeTab, searchQuery, subTab, sortConfig, favorites]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };



  const handleAnalyzeChart = async (currentChartData) => {
    setShowAnalysisModal(true);
    setAiAnalysis(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/analyze-chart`, {
        symbol: selectedAsset.symbol,
        current_price: selectedAsset.price,
        chart_data: currentChartData || [],
        currency: currency,
        currency_symbol: CURRENCIES[currency]?.symbol || "$"
      });
      setAiAnalysis(res.data.analysis); // This is now an object: {signal, analysis}
    } catch (e) {
      setAiAnalysis({ signal: "HOLD", analysis: 'Analiz alınırken hata oluştu. Backend bağlantısını kontrol edin.' });
    }
  };

  const handleSummarizeNews = (newsTitle) => {
    window.dispatchEvent(new CustomEvent('nt-summarize-news', { detail: { title: newsTitle } }));
  };

  if (!selectedAsset) return null;

  return (
    <div className="market-layout">
      <div className="market-list-panel" style={{ width: '100%', maxWidth: '100%', borderRight: 'none' }}>
        <div className="market-tabs">
          <button className={`market-tab ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => { setActiveTab('crypto'); const f = marketData.find(a => a.type === 'crypto'); if (f) setSelectedAsset(f); }}>
            ₿ {t('crypto')}
          </button>
          <button className={`market-tab ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stock'); const f = marketData.find(a => a.type === 'stock'); if (f) setSelectedAsset(f); }}>
            📈 {t('stock')}
          </button>
          <button className={`market-tab ${activeTab === 'metal' ? 'active' : ''}`}
            onClick={() => { setActiveTab('metal'); const f = marketData.find(a => a.type === 'metal'); if (f) setSelectedAsset(f); }}>
            ✨ {t('metal')}
          </button>
        </div>

        <div className="market-subtabs">
          <button className={`sub-tab ${subTab === 'all' ? 'active' : ''}`} onClick={() => setSubTab('all')}>{t('all')}</button>
          <button className={`sub-tab ${subTab === 'favorites' ? 'active' : ''}`} onClick={() => setSubTab('favorites')}>
            ⭐ {t('favorites')} {favorites.length > 0 && <span style={{ marginLeft: 3, opacity: 0.7 }}>({favorites.length})</span>}
          </button>
        </div>

        <div className="search-bar" style={{ margin: '0 16px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <Search size={13} className="search-icon" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-header">
          <div className={`table-header-cell ${sortConfig.key === 'name' ? 'sorted' : ''}`} onClick={() => handleSort('name')}>
            {t('asset')} <SortIcon col="name" />
          </div>
          <div className={`table-header-cell right ${sortConfig.key === 'price' ? 'sorted' : ''}`} onClick={() => handleSort('price')}>
            {t('price')} <SortIcon col="price" />
          </div>
          <div className={`table-header-cell right ${sortConfig.key === 'high24h' ? 'sorted' : ''}`} onClick={() => handleSort('high24h')}>
            {t('high')} <SortIcon col="high24h" />
          </div>
          <div className={`table-header-cell right ${sortConfig.key === 'low24h' ? 'sorted' : ''}`} onClick={() => handleSort('low24h')}>
            {t('low')} <SortIcon col="low24h" />
          </div>
          <div className={`table-header-cell right ${sortConfig.key === 'change' ? 'sorted' : ''}`} onClick={() => handleSort('change')}>
            {t('change')} <SortIcon col="change" />
          </div>
        </div>

        <div className="asset-list">
          {marketLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12, color: 'var(--text-muted)' }}>
              <div className="spinner" /> {t('loading')}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <Search size={36} className="empty-state-icon" />
              <div className="empty-state-title">{t('noResult')}</div>
            </div>
          ) : filteredData.map(asset => (
            <div
              key={asset.id}
              className={`asset-row ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
              onClick={() => { setSelectedAsset(asset); navigate(`/asset/${asset.id}`); }}
            >
              <div className="asset-icon-wrapper">
                <button className={`star-btn ${favorites.includes(asset.symbol) ? 'favorited' : ''}`}
                  onClick={e => toggleFavorite(e, asset.symbol)}>
                  <Star size={13} fill={favorites.includes(asset.symbol) ? 'currentColor' : 'none'} />
                </button>
                <div className="asset-icon">{asset.symbol.slice(0, 2)}</div>
                <div className="asset-name-group">
                  <span className="asset-symbol" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {asset.symbol}
                    <button 
                      title="Detay ve Haberler"
                      className="info-btn-inline"
                      onClick={e => { e.stopPropagation(); setSelectedForDetail(asset); }}
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }}
                    >
                      <Info size={13} />
                    </button>
                  </span>
                  <span className="asset-name-small">{asset.name.length > 14 ? asset.name.slice(0, 14) + '…' : asset.name}</span>
                </div>
              </div>
              <div className="price-cell">{formatPrice(asset.price, currency, rates)}</div>
              <div className="price-cell" style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{formatPrice(asset.high24h, currency, rates)}</div>
              <div className="price-cell" style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{formatPrice(asset.low24h, currency, rates)}</div>
              <div className={`change-badge ${(asset.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                {(asset.change || 0) >= 0 ? '+' : ''}{(asset.change || 0).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedForDetail && (
        <AssetInfoModal
          asset={selectedForDetail}
          currency={currency}
          rates={rates}
          t={t}
          onClose={() => setSelectedForDetail(null)}
          onSummarizeNews={handleSummarizeNews}
        />
      )}

      {showAnalysisModal && (
        <div className="analysis-modal" onClick={() => setShowAnalysisModal(false)}>
          <div className="analysis-modal-box" onClick={e => e.stopPropagation()}>
            <div className="analysis-modal-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'Space Grotesk, sans-serif' }}>
                <Sparkles size={18} /> {selectedAsset.symbol} — AI Teknik Analiz
              </span>
              <button className="icon-btn" onClick={() => setShowAnalysisModal(false)}><X size={15} /></button>
            </div>
            <div className="analysis-modal-body">
              {aiAnalysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Signal Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Sinyali:</span>
                    <span style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700,
                      background: aiAnalysis.signal === 'STRONG_BUY' ? 'rgba(16,185,129,0.15)' :
                                  aiAnalysis.signal === 'BUY' ? 'rgba(134,239,172,0.15)' :
                                  aiAnalysis.signal === 'HOLD' ? 'rgba(252,211,77,0.15)' :
                                  aiAnalysis.signal === 'SELL' ? 'rgba(251,146,60,0.15)' : 'rgba(244,63,94,0.15)',
                      color: aiAnalysis.signal === 'STRONG_BUY' ? 'var(--accent-green)' :
                             aiAnalysis.signal === 'BUY' ? '#86efac' :
                             aiAnalysis.signal === 'HOLD' ? '#fcd34d' :
                             aiAnalysis.signal === 'SELL' ? '#fb923c' : 'var(--accent-red)',
                      border: `1px solid ${
                        aiAnalysis.signal === 'STRONG_BUY' ? 'var(--accent-green)' :
                        aiAnalysis.signal === 'BUY' ? '#86efac' :
                        aiAnalysis.signal === 'HOLD' ? '#fcd34d' :
                        aiAnalysis.signal === 'SELL' ? '#fb923c' : 'var(--accent-red)'
                      }40`
                    }}>
                      {t(aiAnalysis.signal) || aiAnalysis.signal}
                    </span>
                  </div>
                  {/* Analysis Text */}
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {aiAnalysis.analysis}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 14, color: 'var(--text-muted)' }}>
                  <Sparkles size={32} style={{ color: 'var(--accent-purple)', opacity: 0.6 }} className="animate-float" />
                  <span style={{ fontSize: 13 }}>{t('aiAnalyzing')}</span>
                  <div className="spinner" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
