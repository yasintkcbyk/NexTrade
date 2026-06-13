import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Newspaper, Search, RefreshCw, Sparkles, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function NewsPage({ onSummarizeNews }) {
  const { t, API_BASE_URL } = useAppContext();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [searchNews, setSearchNews] = useState('');
  const PER_PAGE = 9;

  const categories = [
    { id: 'all',     label: `🌐 ${t('all')}` },
    { id: 'crypto',  label: `₿ ${t('crypto')}` },
    { id: 'stock',   label: `📈 ${t('stock')}` },
    { id: 'macro',   label: `🏦 ${t('macro')}` },
  ];

  useEffect(() => {
    setLoading(true);
    setPage(1);
    axios.get(`${API_BASE_URL}/api/stocks/market/news`)
      .then(r => setNewsData(r.data || []))
      .catch(() => setNewsData([]))
      .finally(() => setLoading(false));
  }, [API_BASE_URL]);

  const filteredNews = useMemo(() => {
    return newsData.filter(n => {
      const matchSearch = !searchNews || n.title.toLowerCase().includes(searchNews.toLowerCase());
      const matchCategory = category === 'all' || n.category === category;
      return matchSearch && matchCategory;
    });
  }, [newsData, searchNews, category]);

  const totalPages = Math.ceil(filteredNews.length / PER_PAGE);
  const pageNews = filteredNews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="news-module">
      <div className="news-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Newspaper size={20} style={{ color: 'var(--accent-blue)' }} /> {t('globalMarketNews')}
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder={t('searchNews')}
                value={searchNews}
                onChange={e => { setSearchNews(e.target.value); setPage(1); }}
                style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: 12, background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', color: 'var(--text-primary)', outline: 'none', width: 180 }}
              />
            </div>
            <button onClick={() => { setLoading(true); axios.get(`${API_BASE_URL}/api/stocks/market/news`).then(r => setNewsData(r.data || [])).finally(() => setLoading(false)); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'rgba(68,136,255,0.08)', border: '1px solid rgba(68,136,255,0.15)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--accent-blue)', cursor: 'pointer' }}>
              <RefreshCw size={12} /> {t('refresh')}
            </button>
          </div>
        </div>
        <div className="news-filters">
          {categories.map(c => (
            <button key={c.id} className={`filter-chip ${category === c.id ? 'active' : ''}`} onClick={() => { setCategory(c.id); setPage(1); }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)', flexDirection: 'column' }}>
          <div className="spinner" /> {t('loading')}
        </div>
      ) : pageNews.length === 0 ? (
        <div className="empty-state" style={{ flex: 1 }}>
          <Newspaper size={48} className="empty-state-icon" />
          <div className="empty-state-title">{t('noNews')}</div>
          <div className="empty-state-desc">{t('tryDifferentCategory')}</div>
        </div>
      ) : (
        <>
          <div className="news-grid">
            {pageNews.map((news, idx) => (
              <div key={idx} className="news-card" onClick={() => window.open(news.link, '_blank')}>
                <div>
                  <div className="news-source-line">
                    <span className="news-source">{news.publisher || t('source')}</span>
                    <span className="news-date">
                      {news.timestamp ? (typeof news.timestamp === 'number' ? new Date(news.timestamp * 1000).toLocaleDateString('tr-TR') : new Date(news.timestamp).toLocaleDateString('tr-TR')) : ''}
                    </span>
                  </div>
                  <div className="news-title">{news.title}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <button aria-label="Yapay Zeka ile Özetle" className="news-ai-btn" onClick={e => { e.stopPropagation(); onSummarizeNews && onSummarizeNews(news.title); }}>
                    <Sparkles size={10} /> {t('aiAnalyze')}
                  </button>
                  <ExternalLink size={12} style={{ color: 'var(--text-dim)' }} />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="news-pagination">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                );
              })}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={14} />
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>{filteredNews.length} {t('newsCount')}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
