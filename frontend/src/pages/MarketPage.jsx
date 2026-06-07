import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronUp, ChevronDown, Star, Info, Bot, Sparkles, BarChart2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CURRENCIES, formatPrice } from '../utils/constants';
import Chart from '../components/Chart';

export default function MarketPage({ activeTab, setActiveTab, selectedAsset, setSelectedAsset, setSelectedForDetail }) {
  const { marketData, marketLoading, favorites, toggleFavorite, currency, rates, t, API_BASE_URL } = useAppContext();
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' });
  const [subTab, setSubTab] = useState('all'); // all | favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [showSignals, setShowSignals] = useState(false);
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

  useEffect(() => {
    if (!selectedAsset) return;
    const fetchChart = async () => {
      setIsLoadingChart(true);
      setChartData([]);
      setSignals([]);
      try {
        const ep = selectedAsset.type === 'crypto'
          ? `${API_BASE_URL}/api/crypto/${selectedAsset.id}/history`
          : `${API_BASE_URL}/api/stocks/${selectedAsset.id}/history`;
        const res = await axios.get(ep, { params: { interval: timeframe } });
        setChartData(res.data);
      } catch (e) { console.error('Chart error:', e); }
      finally { setIsLoadingChart(false); }

      if (showSignals) {
        try {
          const sep = selectedAsset.type === 'crypto'
            ? `${API_BASE_URL}/api/crypto/${selectedAsset.id}/signals`
            : `${API_BASE_URL}/api/stocks/${selectedAsset.id}/signals`;
          const rs = await axios.get(sep);
          setSignals(rs.data);
        } catch (e) { console.error('Signals error:', e); }
      }
    };
    fetchChart();
  }, [selectedAsset, timeframe, showSignals, API_BASE_URL]);

  const handleAnalyzeChart = async () => {
    setShowAnalysisModal(true);
    setAiAnalysis(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/analyze-chart`, {
        symbol: selectedAsset.symbol,
        current_price: selectedAsset.price,
        chart_data: chartData,
      });
      setAiAnalysis(res.data.analysis);
    } catch (e) {
      setAiAnalysis('Analiz alınırken hata oluştu. Backend bağlantısını kontrol edin.');
    }
  };

  const convertedChartData = useMemo(() => {
    const rate = rates[currency] || 1;
    return chartData.map(d => ({
      ...d,
      open: d.open * rate,
      high: d.high * rate,
      low: d.low * rate,
      close: d.close * rate
    }));
  }, [chartData, currency, rates]);

  if (!selectedAsset) return null;

  return (
    <div className="market-layout">
      <div className="market-list-panel">
        <div className="market-tabs">
          <button className={`market-tab ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => { setActiveTab('crypto'); const f = marketData.find(a => a.type === 'crypto'); if (f) setSelectedAsset(f); }}>
            ₿ {t('crypto')}
          </button>
          <button className={`market-tab ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stock'); const f = marketData.find(a => a.type === 'stock'); if (f) setSelectedAsset(f); }}>
            📈 {t('stock')}
          </button>
        </div>

        <div className="market-subtabs">
          <button className={`sub-tab ${subTab === 'all' ? 'active' : ''}`} onClick={() => setSubTab('all')}>{t('all')}</button>
          <button className={`sub-tab ${subTab === 'favorites' ? 'active' : ''}`} onClick={() => setSubTab('favorites')}>
            ⭐ {t('favorites')} {favorites.length > 0 && <span style={{ marginLeft: 3, opacity: 0.7 }}>({favorites.length})</span>}
          </button>
        </div>

        <div className="search-bar" style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.03)' }}>
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
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="asset-icon-wrapper">
                <button className={`star-btn ${favorites.includes(asset.symbol) ? 'favorited' : ''}`}
                  onClick={e => toggleFavorite(e, asset.symbol)}>
                  <Star size={13} fill={favorites.includes(asset.symbol) ? 'currentColor' : 'none'} />
                </button>
                <div className="asset-icon">{asset.symbol.slice(0, 2)}</div>
                <div className="asset-name-group">
                  <span className="asset-symbol">{asset.symbol}</span>
                  <span className="asset-name-small">{asset.name.length > 14 ? asset.name.slice(0, 14) + '…' : asset.name}</span>
                </div>
              </div>
              <div className="price-cell">{CURRENCIES[currency].symbol}{formatPrice(asset.price, currency, rates)}</div>
              <div className="price-cell" style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{CURRENCIES[currency].symbol}{formatPrice(asset.high24h, currency, rates)}</div>
              <div className="price-cell" style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{CURRENCIES[currency].symbol}{formatPrice(asset.low24h, currency, rates)}</div>
              <div className={`change-badge ${(asset.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                {(asset.change || 0) >= 0 ? '+' : ''}{(asset.change || 0).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-panel">
        <div className="chart-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{selectedAsset.name}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>({selectedAsset.symbol})</span>
                <button
                  onClick={() => setSelectedForDetail(selectedAsset)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: 'rgba(68,136,255,0.08)', border: '1px solid rgba(68,136,255,0.15)', borderRadius: 'var(--radius-full)', fontSize: 10.5, fontWeight: 600, color: 'var(--accent-blue)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(68,136,255,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(68,136,255,0.08)'}
                >
                  <Info size={10} /> {t('detail')}
                </button>
              </div>
              <div className="asset-price-display">
                <span className="asset-price-main">{CURRENCIES[currency].symbol}{formatPrice(selectedAsset.price, currency, rates)}</span>
                <span className={`asset-price-change ${(selectedAsset.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(selectedAsset.change || 0) >= 0 ? '+' : ''}{(selectedAsset.change || 0).toFixed(2)}%
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>{t('high24h')}: <strong style={{ color: 'var(--accent-green)' }}>{CURRENCIES[currency].symbol}{formatPrice(selectedAsset.high24h, currency, rates)}</strong></span>
                <span>{t('low24h')}: <strong style={{ color: 'var(--accent-red)' }}>{CURRENCIES[currency].symbol}{formatPrice(selectedAsset.low24h, currency, rates)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-actions">
          <div className="timeframe-group">
            {['1D', '1W', '1M', '1Y'].map(tf => (
              <button key={tf} className={`tf-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>{tf}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button className={`action-btn amber ${showSignals ? 'active' : ''}`} onClick={() => setShowSignals(!showSignals)}>
            <Bot size={13} /> {t('buySellSignals')}
          </button>
          <button className="action-btn purple" onClick={handleAnalyzeChart}>
            <Sparkles size={13} /> {t('aiAnalyze')}
          </button>
        </div>

        <div className="chart-area" style={{ padding: '8px 0', background: 'var(--bg-darkest)' }}>
          {isLoadingChart ? (
            <div className="chart-loading">
              <div className="spinner" />
              <span style={{ fontSize: 13 }}>{t('chartLoading')}</span>
            </div>
          ) : chartData.length > 0 ? (
            <Chart data={convertedChartData} signals={showSignals ? signals : []} />
          ) : (
            <div className="chart-loading" style={{ flexDirection: 'column', gap: 10 }}>
              <BarChart2 size={48} style={{ opacity: 0.15 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{selectedAsset.symbol} {t('chartError')}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{t('backendError')}</span>
            </div>
          )}
        </div>
      </div>

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
              {aiAnalysis ? aiAnalysis : (
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
