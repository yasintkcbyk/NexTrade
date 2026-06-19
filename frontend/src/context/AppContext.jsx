import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [theme, setTheme] = useState(() => localStorage.getItem('nt_theme') || 'dark');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] || key, [lang]);

  useEffect(() => {
    localStorage.setItem('nt_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('nt_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('nt_theme', theme);
  }, [theme]);

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

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/public/announcements`);
      if (res.data) setAnnouncements(res.data);
    } catch (e) {
      console.error('Announcements fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchMarket();
    fetchAnnouncements();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, [fetchMarket, fetchAnnouncements]);

  const toggleFavorite = useCallback((e, symbol) => {
    if (e) e.stopPropagation();
    setFavorites(prev => prev.includes(symbol) ? prev.filter(f => f !== symbol) : [...prev, symbol]);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  }, []);

  // Axios interceptor for handling 401 Unauthorized errors globally and attaching tokens
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('nt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("401 Unauthorized intercepted. Logging out...");
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [handleLogout]);

  const value = useMemo(() => ({
    user, setUser, handleLogin, handleLogout,
    marketData, marketLoading,
    favorites, toggleFavorite,
    currency, setCurrency, rates,
    lang, setLang, t,
    theme, setTheme,
    lastUpdated,
    announcements, fetchAnnouncements,
    API_BASE_URL
  }), [
    user, handleLogout,
    marketData, marketLoading,
    favorites, toggleFavorite,
    currency, rates,
    lang, t,
    theme,
    lastUpdated, announcements
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
