import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FALLBACK_MARKET, CURRENCIES, LANGUAGES, TRANSLATIONS, API_BASE_URL } from '../utils/constants';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nt_user')); } catch { return null; }
  });

  const [marketData, setMarketData] = useState(FALLBACK_MARKET);
  const [marketLoading, setMarketLoading] = useState(true);
  
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nextTrade_favorites')) || []; } catch { return []; }
  });
  
  const [currency, setCurrency] = useState(() => localStorage.getItem('nt_currency') || 'USD');
  const [rates, setRates] = useState({ USD: 1, TRY: 32.5, GBP: 0.79, KZT: 445.0, RUB: 92.5 });
  const [lang, setLang] = useState(() => localStorage.getItem('nt_lang') || 'TR');
  const [lastUpdated, setLastUpdated] = useState(null);

  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] || key, [lang]);

  useEffect(() => {
    localStorage.setItem('nt_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('nt_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('nextTrade_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD')
      .then(res => {
        if (res.data && res.data.rates) setRates(prev => ({ ...prev, ...res.data.rates }));
      }).catch(console.error);
  }, []);

  const fetchMarket = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/markets/assets`);
      if (Array.isArray(res.data) && res.data.length) {
        setMarketData(res.data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Market fetch error:', e);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, [fetchMarket]);

  const toggleFavorite = useCallback((e, symbol) => {
    if (e) e.stopPropagation();
    setFavorites(prev => prev.includes(symbol) ? prev.filter(f => f !== symbol) : [...prev, symbol]);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  };

  const value = {
    user, setUser, handleLogin, handleLogout,
    marketData, marketLoading,
    favorites, toggleFavorite,
    currency, setCurrency, rates,
    lang, setLang, t,
    lastUpdated,
    API_BASE_URL
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
