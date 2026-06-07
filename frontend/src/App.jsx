import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TrendingUp, BarChart2, Newspaper, Bell, Calculator, LogOut, Wifi, Search, Wallet } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { CURRENCIES, LANGUAGES } from './utils/constants';

import TickerBand from './components/TickerBand';
import AIChat from './components/AIChat';
import AssetDetailModal from './components/AssetDetailModal';
import LoginPage from './components/LoginPage';

import MarketPage from './pages/MarketPage';
import NewsPage from './pages/NewsPage';
import AlertsPage from './pages/AlertsPage';
import ConverterPage from './pages/ConverterPage';
import PortfolioPage from './pages/PortfolioPage';

function AppLayout() {
  const { user, handleLogout, activeModule, marketData, currency, setCurrency, rates, lang, setLang, t, lastUpdated } = useAppContext();
  
  // Navigation State & Selected Asset State for the App Layout level
  // Since we use React Router now, useLocation tells us where we are.
  const location = useLocation();
  const currentPath = location.pathname;

  // We keep some global states here because MarketPage and AIChat share selectedAsset
  const [activeTab, setActiveTab] = useState('crypto');
  const [selectedAsset, setSelectedAsset] = useState(() => marketData.find(m => m.type === 'crypto') || marketData[0]);
  const [selectedForDetail, setSelectedForDetail] = useState(null);

  const handleSummarizeNews = (newsTitle) => {
    window.dispatchEvent(new CustomEvent('nt-summarize-news', { detail: { title: newsTitle } }));
  };

  const navItems = [
    { path: '/', id: 'markets', icon: <BarChart2 size={17} />, label: t('markets') },
    { path: '/portfolio', id: 'portfolio', icon: <Wallet size={17} />, label: t('portfolio') },
    { path: '/news', id: 'news', icon: <Newspaper size={17} />, label: t('news') },
    { path: '/alerts', id: 'alerts', icon: <Bell size={17} />, label: t('alerts') },
    { path: '/converter', id: 'converter', icon: <Calculator size={17} />, label: t('converter') },
  ];

  const getPageTitle = () => {
    if (currentPath === '/') return t('marketView');
    if (currentPath === '/portfolio') return t('portfolio');
    if (currentPath === '/news') return t('marketNews');
    if (currentPath === '/alerts') return t('priceAlerts');
    if (currentPath === '/converter') return t('assetConverter');
    return '';
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TrendingUp size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">nextTrade</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{t('mainMenu')}</div>
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-btn ${currentPath === item.path ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'alerts' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(68,136,255,0.15)', padding: '1px 6px', borderRadius: 'var(--radius-full)', color: 'var(--accent-blue)' }}>Telegram</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.full_name || user.username}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{user.username}
            </div>
          </div>
          <button onClick={handleLogout} title={t('logout')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, display: 'flex', alignItems: 'center', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <TickerBand marketData={marketData} currency={currency} rates={rates} />

        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="topbar-title">
              {getPageTitle()}
            </span>
            {lastUpdated && currentPath === '/' && (
              <span style={{ fontSize: 10.5, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Wifi size={10} style={{ color: 'var(--accent-green)' }} />
                {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
            >
              {Object.keys(LANGUAGES).map(l => (
                <option key={l} value={l}>{LANGUAGES[l].flag} {l}</option>
              ))}
            </select>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].symbol} {c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="module-area">
          <Routes>
            <Route path="/" element={
              <MarketPage 
                activeTab={activeTab} setActiveTab={setActiveTab} 
                selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} 
                setSelectedForDetail={setSelectedForDetail} 
              />
            } />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/news" element={<NewsPage onSummarizeNews={handleSummarizeNews} />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/converter" element={<ConverterPage />} />
          </Routes>
        </div>
      </div>

      {selectedForDetail && (
        <AssetDetailModal
          asset={selectedForDetail}
          onClose={() => setSelectedForDetail(null)}
          onSummarizeNews={(title) => {
            setSelectedForDetail(null);
            handleSummarizeNews(title);
          }}
          currency={currency}
          rates={rates}
          t={t}
        />
      )}

      <AIChat selectedAsset={selectedAsset} />
    </div>
  );
}

export default function App() {
  const { user, handleLogin } = useAppContext();

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}