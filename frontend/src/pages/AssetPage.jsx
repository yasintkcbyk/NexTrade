import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BarChart2, Bot, Sparkles, Info, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatPrice, CURRENCIES } from '../utils/constants';
import Chart from '../components/Chart';
import AssetInfoModal from '../components/AssetInfoModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { marketData, currency, rates, t } = useAppContext();
  
  const asset = marketData.find(a => a.id === id);
  
  const [chartData, setChartData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [showSignals, setShowSignals] = useState(false);
  
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Fetch Chart Data
  useEffect(() => {
    if (!asset) return;
    const fetchChart = async () => {
      setIsLoadingChart(true);
      setChartData([]);
      setSignals([]);
      try {
        const ep = asset.type === 'crypto'
          ? `${API_BASE_URL}/api/crypto/${asset.id}/history`
          : `${API_BASE_URL}/api/stocks/${asset.id}/history`;
        const res = await axios.get(ep, { params: { interval: timeframe } });
        setChartData(res.data);
      } catch (e) { console.error('Chart error:', e); }
      finally { setIsLoadingChart(false); }

      if (showSignals) {
        try {
          const sep = asset.type === 'crypto'
            ? `${API_BASE_URL}/api/crypto/${asset.id}/signals`
            : `${API_BASE_URL}/api/stocks/${asset.id}/signals`;
          const rs = await axios.get(sep, { params: { interval: timeframe } });
          setSignals(rs.data);
        } catch (e) { console.error('Signals error:', e); }
      }
    };
    fetchChart();
  }, [asset, timeframe, showSignals]);

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

  const handleAnalyzeChart = async () => {
    setShowAnalysisModal(true);
    setAiAnalysis(null);
    
    const CURRENCY_SYMBOLS = { USD: '$', TRY: '\u20ba', GBP: '\u00a3', KZT: '\u20b8', RUB: '\u20bd', EUR: '\u20ac' };
    const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/analyze-chart`, {
        symbol: asset.symbol,
        current_price: (asset.price || 0) * (rates[currency] || 1),
        chart_data: convertedChartData || [],
        currency: currency,
        currency_symbol: currencySymbol,
      });
      setAiAnalysis(res.data.analysis);
    } catch (e) {
      setAiAnalysis({ signal: "HOLD", analysis: 'Analiz alınırken hata oluştu. Backend bağlantısını kontrol edin.' });
    }
  };

  const handleSummarizeNews = (newsTitle) => {
    window.dispatchEvent(new CustomEvent('nt-summarize-news', { detail: { title: newsTitle } }));
  };

  if (!asset) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <BarChart2 size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
        <h3>Varlık bulunamadı</h3>
        <button className="action-btn" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }}/> Piyasalar'a Dön
        </button>
      </div>
    );
  }

  const isCrypto = asset.type === 'crypto';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 'calc(100vh - 120px)', padding: '24px 32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button 
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16, padding: 0 }}
          >
            <ArrowLeft size={14} /> {t('goBack') || 'Geri Dön'}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(68,136,255,0.3), rgba(168,85,247,0.3))',
              border: '1px solid rgba(68,136,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'var(--accent-blue)',
              fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0
            }}>
              {asset.symbol.slice(0, 2)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {asset.name}
                </div>
                <button
                  onClick={() => setShowInfoModal(true)}
                  title="Detaylı Bilgi ve Haberler"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.2)', borderRadius: '50%', color: 'var(--accent-blue)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(68,136,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(68,136,255,0.1)'}
                >
                  <Info size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{asset.symbol}</span>
                <span className={`badge ${isCrypto ? 'purple' : 'blue'}`}>{isCrypto ? t('crypto') : t('stock')}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
            {formatPrice(asset.price, currency, rates)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 15, fontWeight: 600, color: (asset.change || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: 4 }}>
            {(asset.change || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {(asset.change || 0) >= 0 ? '+' : ''}{(asset.change || 0).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart Tools */}
      <div className="chart-actions" style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', borderBottom: 'none' }}>
        <div className="timeframe-group">
          {['1D', '1W', '1M', '3M', '1Y', '4H', 'MAX'].map(tf => (
            <button key={tf} className={`tf-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>
              {tf === '4H' ? t('time4h') : tf === 'MAX' ? t('timeMax') : tf}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className={`action-btn amber ${showSignals ? 'active' : ''}`} onClick={() => setShowSignals(!showSignals)}>
          <Bot size={13} /> {t('buySellSignals')} {showSignals && signals.length === 0 ? '(Yok)' : ''}
        </button>
        <button className="action-btn purple" onClick={handleAnalyzeChart}>
          <Sparkles size={13} /> {t('aiAnalyze')}
        </button>
      </div>

      {/* Chart Area */}
      <div className="chart-area" style={{ flex: 1, minHeight: 400, background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: 12 }}>
        {isLoadingChart ? (
          <div className="chart-loading" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div className="spinner" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('chartLoading')}</span>
          </div>
        ) : chartData.length > 0 ? (
          <Chart data={convertedChartData} signals={showSignals ? signals : []} />
        ) : (
          <div className="chart-loading" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <BarChart2 size={48} style={{ opacity: 0.15 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{asset.symbol} {t('chartError')}</span>
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <AssetInfoModal
          asset={asset}
          currency={currency}
          rates={rates}
          t={t}
          onClose={() => setShowInfoModal(false)}
          onSummarizeNews={handleSummarizeNews}
        />
      )}

      {/* AI Analysis Modal */}
      {showAnalysisModal && (
        <div className="analysis-modal" onClick={() => setShowAnalysisModal(false)}>
          <div className="analysis-modal-box" onClick={e => e.stopPropagation()}>
            <div className="analysis-modal-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'Space Grotesk, sans-serif' }}>
                <Sparkles size={18} /> {asset.symbol} — AI Teknik Analiz
              </span>
              <button aria-label="Kapat" className="icon-btn" onClick={() => setShowAnalysisModal(false)}><X size={15} /></button>
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
