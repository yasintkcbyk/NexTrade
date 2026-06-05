import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ExternalLink, Globe, Share2, Code2, TrendingUp, TrendingDown, Info, BarChart2, Newspaper, Sparkles, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function formatNumber(num) {
  if (!num || num === 0) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3)  return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toLocaleString()}`;
}

function formatSupply(num) {
  if (!num || num === 0) return '—';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
}

function CryptoInfo({ info }) {
  return (
    <div className="animate-fadeIn">
      {/* Description */}
      {info.description && (
        <div className="description-box" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 8 }}>Hakkında</div>
          {info.description}
        </div>
      )}

      {/* Key Stats */}
      <div className="info-grid">
        <div className="info-card">
          <div className="info-label">Piyasa Sırası</div>
          <div className="info-value accent">#{info.market_cap_rank || '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Piyasa Değeri</div>
          <div className="info-value mono">{formatNumber(info.market_cap_usd)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">İşlem Hacmi (24s)</div>
          <div className="info-value mono">{formatNumber(info.total_volume_usd)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Tüm Zamanların En Yükseği</div>
          <div className="info-value mono" style={{ color: 'var(--accent-green)' }}>
            ${info.ath_usd ? info.ath_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '—'}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">Dolaşımdaki Arz</div>
          <div className="info-value mono">{formatSupply(info.circulating_supply)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Maksimum Arz</div>
          <div className="info-value mono">{info.max_supply ? formatSupply(info.max_supply) : '∞ Sınırsız'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">7 Günlük Değişim</div>
          <div className={`info-value ${(info.price_change_7d || 0) >= 0 ? 'positive' : 'negative'}`}>
            {(info.price_change_7d || 0) >= 0 ? '+' : ''}{(info.price_change_7d || 0).toFixed(2)}%
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">30 Günlük Değişim</div>
          <div className={`info-value ${(info.price_change_30d || 0) >= 0 ? 'positive' : 'negative'}`}>
            {(info.price_change_30d || 0) >= 0 ? '+' : ''}{(info.price_change_30d || 0).toFixed(2)}%
          </div>
        </div>
        {info.genesis_date && (
          <div className="info-card">
            <div className="info-label">İlk Blok Tarihi</div>
            <div className="info-value">{new Date(info.genesis_date).toLocaleDateString('tr-TR')}</div>
          </div>
        )}
        {info.hashing_algorithm && (
          <div className="info-card">
            <div className="info-label">Konsensüs Mekanizması</div>
            <div className="info-value" style={{ fontSize: 12 }}>{info.hashing_algorithm}</div>
          </div>
        )}
      </div>

      {/* Categories */}
      {info.categories && info.categories.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="info-label" style={{ marginBottom: 8 }}>Kategoriler</div>
          <div className="tag-list">
            {info.categories.map((cat, i) => <span key={i} className="tag">{cat}</span>)}
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {info.homepage && (
          <a href={info.homepage} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.2)', borderRadius: 'var(--radius-full)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent-blue)', textDecoration: 'none', transition: 'var(--transition-fast)' }}>
            <Globe size={12} /> Website
          </a>
        )}
        {info.whitepaper && (
          <a href={info.whitepaper} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 'var(--radius-full)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent-purple)', textDecoration: 'none' }}>
            <ExternalLink size={12} /> Whitepaper
          </a>
        )}
        {info.twitter && (
          <a href={`https://twitter.com/${info.twitter}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius-full)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent-cyan)', textDecoration: 'none' }}>
            <Share2 size={12} /> @{info.twitter}
          </a>
        )}
        {info.github && (
          <a href={info.github} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <Code2 size={12} /> GitHub
          </a>
        )}
      </div>

      {info.source === 'static_fallback' && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={12} style={{ color: 'var(--accent-amber)' }} />
          Canlı veri alınamadı, statik bilgiler gösteriliyor.
        </div>
      )}
    </div>
  );
}

function StockInfo({ info }) {
  return (
    <div className="animate-fadeIn">
      {info.description && (
        <div className="description-box" style={{ marginBottom: 16 }}>{info.description}</div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <div className="info-label">Sektör</div>
          <div className="info-value" style={{ fontSize: 13 }}>{info.sector || '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Endüstri</div>
          <div className="info-value" style={{ fontSize: 12 }}>{info.industry || '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Piyasa Değeri</div>
          <div className="info-value mono">{formatNumber(info.market_cap_usd)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">F/K Oranı (PE)</div>
          <div className="info-value mono">{info.pe_ratio ? info.pe_ratio.toFixed(2) : '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Hisse Başı Kâr (EPS)</div>
          <div className="info-value mono">${info.eps ? info.eps.toFixed(2) : '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Temettü Verimi</div>
          <div className="info-value" style={{ color: 'var(--accent-green)' }}>
            {info.dividend_yield ? `%${info.dividend_yield.toFixed(2)}` : '—'}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">52 Haftalık En Yüksek</div>
          <div className="info-value mono" style={{ color: 'var(--accent-green)' }}>
            ${info['52w_high'] ? info['52w_high'].toLocaleString() : '—'}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">52 Haftalık En Düşük</div>
          <div className="info-value mono" style={{ color: 'var(--accent-red)' }}>
            ${info['52w_low'] ? info['52w_low'].toLocaleString() : '—'}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">Çalışan Sayısı</div>
          <div className="info-value mono">{info.employees ? info.employees.toLocaleString() : '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Beta</div>
          <div className="info-value mono">{info.beta ? info.beta.toFixed(2) : '—'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Gelir</div>
          <div className="info-value mono">{formatNumber(info.revenue)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Kâr Marjı</div>
          <div className="info-value" style={{ color: (info.profit_margin || 0) > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {info.profit_margin ? `%${info.profit_margin.toFixed(2)}` : '—'}
          </div>
        </div>
      </div>

      {info.website && (
        <div style={{ marginTop: 16 }}>
          <a href={info.website} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.2)', borderRadius: 'var(--radius-full)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent-blue)', textDecoration: 'none' }}>
            <Globe size={12} /> {info.website}
          </a>
        </div>
      )}
    </div>
  );
}

export default function AssetDetailModal({ asset, onClose, onNavigateToChart, onSummarizeNews }) {
  const [activeTab, setActiveTab] = useState('info');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assetNews, setAssetNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setInfo(null);
    setActiveTab('info');

    const fetchInfo = async () => {
      setLoading(true);
      try {
        const endpoint = asset.type === 'crypto'
          ? `${API_BASE_URL}/api/asset/crypto/${asset.id}/info`
          : `${API_BASE_URL}/api/asset/stock/${asset.id}/info`;
        const res = await axios.get(endpoint);
        setInfo(res.data);
      } catch (err) {
        console.error('Varlık bilgisi alınamadı:', err);
        setInfo({ error: true });
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [asset]);

  useEffect(() => {
    if (activeTab !== 'news' || !asset) return;
    setNewsLoading(true);
    const endpoint = asset.type === 'crypto'
      ? `${API_BASE_URL}/api/crypto/${asset.id}/news`
      : `${API_BASE_URL}/api/stocks/${asset.id}/news`;
    axios.get(endpoint)
      .then(r => setAssetNews(r.data || []))
      .catch(() => setAssetNews([]))
      .finally(() => setNewsLoading(false));
  }, [activeTab, asset]);

  if (!asset) return null;

  const isCrypto = asset.type === 'crypto';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(68,136,255,0.3), rgba(168,85,247,0.3))',
              border: '1px solid rgba(68,136,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: 'var(--accent-blue)',
              fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0
            }}>
              {asset.symbol.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>{asset.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{asset.symbol}</span>
                <span className={`badge ${isCrypto ? 'purple' : 'blue'}`}>{isCrypto ? 'Kripto' : 'Hisse'}</span>
                <span className={`badge ${(asset.change || 0) >= 0 ? 'green' : 'red'}`}>
                  {(asset.change || 0) >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {(asset.change || 0) >= 0 ? '+' : ''}{(asset.change || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                ${(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
            </div>
            <button className="icon-btn" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          {[
            { id: 'info', label: 'Genel Bilgi', icon: <Info size={13} /> },
            { id: 'news', label: 'Haberler', icon: <Newspaper size={13} /> },
          ].map(tab => (
            <button key={tab.id} className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="detail-content">
          {activeTab === 'info' && (
            loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 14, color: 'var(--text-muted)' }}>
                <div className="spinner" />
                <p style={{ fontSize: 13 }}>Varlık bilgileri getiriliyor...</p>
              </div>
            ) : info && !info.error ? (
              isCrypto ? <CryptoInfo info={info} /> : <StockInfo info={info} />
            ) : (
              <div className="empty-state">
                <AlertCircle size={40} className="empty-state-icon" />
                <div className="empty-state-title">Bilgi alınamadı</div>
                <div className="empty-state-desc">Sunucu bağlantısını kontrol edin.</div>
              </div>
            )
          )}

          {activeTab === 'news' && (
            newsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div className="spinner" />
              </div>
            ) : assetNews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {assetNews.map((news, i) => (
                  <div key={i} style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                    <div style={{ fontSize: 10.5, color: 'var(--accent-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{news.publisher}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{news.timestamp ? new Date(news.timestamp * 1000).toLocaleDateString('tr-TR') : ''}</span>
                    </div>
                    <a href={news.link} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.45, display: 'block', marginBottom: 8 }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent-cyan)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>
                      {news.title}
                    </a>
                    <button className="news-ai-btn" onClick={() => onSummarizeNews && onSummarizeNews(news.title)}>
                      <Sparkles size={10} /> AI Yorumla
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Newspaper size={40} className="empty-state-icon" />
                <div className="empty-state-title">{asset.symbol} için haber bulunamadı</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
