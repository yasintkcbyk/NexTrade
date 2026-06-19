import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TrendingUp, BarChart2, Newspaper, Bell, Calculator, LogOut, Wifi, Search, Wallet, Moon, Sun, Shield } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { CURRENCIES, LANGUAGES } from './utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

import TickerBand from './components/TickerBand';
import AIChat from './components/AIChat';
import LoginPage from './components/LoginPage';

const MarketPage = lazy(() => import('./pages/MarketPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const ConverterPage = lazy(() => import('./pages/ConverterPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const AssetPage = lazy(() => import('./pages/AssetPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function AppLayout() {
  const { user, handleLogout, activeModule, marketData, currency, setCurrency, rates, lang, setLang, t, theme, setTheme, lastUpdated } = useAppContext();
  
  // Navigation State & Selected Asset State for the App Layout level
  // Since we use React Router now, useLocation tells us where we are.
  const location = useLocation();
  const currentPath = location.pathname;

  // Apply theme to document body to ensure modals are styled correctly
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

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

  if (user?.is_admin) {
    navItems.push({ path: '/admin', id: 'admin', icon: <Shield size={17} />, label: 'Admin Paneli' });
  }

  const getPageTitle = () => {
    if (currentPath === '/') return t('marketView');
    if (currentPath === '/portfolio') return t('portfolio');
    if (currentPath === '/news') return t('marketNews');
    if (currentPath === '/alerts') return t('priceAlerts');
    if (currentPath === '/converter') return t('assetConverter');
    if (currentPath === '/admin') return 'Yönetici Paneli';
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
      <main className="main-content">
        <TickerBand marketData={marketData} currency={currency} rates={rates} />

        {/* Global Announcements Banner */}
        {useAppContext().announcements?.map(ann => (
          <div key={ann.id} style={{ 
            background: 'var(--accent-blue)', color: 'white', padding: '10px 20px', 
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Bell size={14} /> <strong>{ann.title}:</strong> {ann.content}
          </div>
        ))}

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
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition-fast)'
              }}
              title={theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              className="mobile-logout-btn"
              onClick={handleLogout}
              title={t('logout')}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--accent-red)',
                width: 32, height: 32, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition-fast)'
              }}
            >
              <LogOut size={15} />
            </button>
            <select
              aria-label="Dil Seçimi"
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
            >
              {Object.keys(LANGUAGES).map(l => (
                <option key={l} value={l}>{LANGUAGES[l].flag} {l}</option>
              ))}
            </select>
            <select
              aria-label="Para Birimi Seçimi"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].symbol} {c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="module-area">
          <Suspense fallback={<div style={{ padding: 20, color: 'var(--text-primary)' }} className="skeleton skeleton-card"></div>}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <PageTransition>
                    <MarketPage 
                      activeTab={activeTab} setActiveTab={setActiveTab} 
                      selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} 
                      setSelectedForDetail={setSelectedForDetail} 
                      selectedForDetail={selectedForDetail}
                    />
                  </PageTransition>
                } />
                <Route path="/portfolio" element={<PageTransition><PortfolioPage /></PageTransition>} />
                <Route path="/news" element={<PageTransition><NewsPage onSummarizeNews={handleSummarizeNews} /></PageTransition>} />
                <Route path="/alerts" element={<PageTransition><AlertsPage /></PageTransition>} />
                <Route path="/converter" element={<PageTransition><ConverterPage /></PageTransition>} />
                <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
                <Route path="/asset/:id" element={<PageTransition><AssetPage /></PageTransition>} />
                <Route path="*" element={<PageTransition><div style={{ padding: 20, color: 'var(--text-primary)' }}>Page Not Found</div></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>

      <AIChat selectedAsset={selectedAsset} />
    </div>
  );
}

export default function App() {
  const { user, handleLogin, handleLogout } = useAppContext();
  const [sessionExpired, setSessionExpired] = React.useState(false);

  // 401 interceptor — oturum süresinin dolduğunu kullanıcıya göster
  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && user) {
          handleLogout();
          setSessionExpired(true);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [user, handleLogout]);

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        {sessionExpired && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)',
            backdropFilter: 'blur(20px)', padding: '12px 24px', borderRadius: 12,
            color: '#f43f5e', fontSize: 13, fontWeight: 600,
            fontFamily: 'Space Grotesk, sans-serif', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            ⚠️ Oturumunuz sona erdi. Lütfen tekrar giriş yapın.
          </div>
        )}
      </>
    );
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}