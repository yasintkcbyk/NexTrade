import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  TrendingUp, Bell, Newspaper, BarChart2, ChevronUp, ChevronDown,
  Search, Bot, MessageCircle, X, Send, Sparkles, Trash2, Plus,
  Smartphone, Star, LogOut, User, Info, ExternalLink, ChevronLeft,
  ChevronRight, Filter, RefreshCw, Wifi, WifiOff, Menu
} from 'lucide-react';
import Chart from './components/Chart';
import LoginPage from './components/LoginPage';
import AssetDetailModal from './components/AssetDetailModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Sabit piyasa verisi (canlı veri gelemezse fallback)
const FALLBACK_MARKET = [
  { id: 'bitcoin',   symbol: 'BTC',      name: 'Bitcoin',          price: 65430.50, change: 2.34,  high24h: 66000, low24h: 64000, type: 'crypto' },
  { id: 'ethereum',  symbol: 'ETH',      name: 'Ethereum',         price: 3450.75,  change: -1.20, high24h: 3500,  low24h: 3400,  type: 'crypto' },
  { id: 'solana',    symbol: 'SOL',      name: 'Solana',           price: 145.20,   change: 5.67,  high24h: 150,   low24h: 140,   type: 'crypto' },
  { id: 'ripple',    symbol: 'XRP',      name: 'XRP',              price: 0.49,     change: 0.8,   high24h: 0.51,  low24h: 0.48,  type: 'crypto' },
  { id: 'avalanche', symbol: 'AVAX',     name: 'Avalanche',        price: 35.80,    change: -0.50, high24h: 37.00, low24h: 35.00, type: 'crypto' },
  { id: 'dogecoin',  symbol: 'DOGE',     name: 'Dogecoin',         price: 0.12,     change: 12.40, high24h: 0.13,  low24h: 0.10,  type: 'crypto' },
  { id: 'cardano',   symbol: 'ADA',      name: 'Cardano',          price: 0.45,     change: -2.1,  high24h: 0.48,  low24h: 0.44,  type: 'crypto' },
  { id: 'binancecoin', symbol: 'BNB',    name: 'BNB',              price: 600.50,   change: 1.20,  high24h: 610.0, low24h: 590.0, type: 'crypto' },
  { id: 'polkadot',  symbol: 'DOT',      name: 'Polkadot',         price: 8.20,     change: -0.50, high24h: 8.50,  low24h: 8.10,  type: 'crypto' },
  { id: 'chainlink', symbol: 'LINK',     name: 'Chainlink',        price: 17.80,    change: 2.10,  high24h: 18.20, low24h: 17.40, type: 'crypto' },
  { id: 'matic-network', symbol: 'POL',  name: 'Polygon (POL)',    price: 0.42,     change: -1.10, high24h: 0.45,  low24h: 0.40,  type: 'crypto' },
  { id: 'tron',      symbol: 'TRX',      name: 'TRON',             price: 0.115,    change: 0.50,  high24h: 0.12,  low24h: 0.11,  type: 'crypto' },
  { id: 'AAPL',      symbol: 'AAPL',     name: 'Apple Inc.',       price: 175.50,   change: 1.15,  high24h: 178,   low24h: 174,   type: 'stock' },
  { id: 'TSLA',      symbol: 'TSLA',     name: 'Tesla',            price: 195.20,   change: -3.45, high24h: 200,   low24h: 190,   type: 'stock' },
  { id: 'MSFT',      symbol: 'MSFT',     name: 'Microsoft',        price: 420.10,   change: 0.85,  high24h: 425,   low24h: 415,   type: 'stock' },
  { id: 'GOOGL',     symbol: 'GOOGL',    name: 'Alphabet (Google)',price: 177.90,   change: 0.25,  high24h: 180,   low24h: 175,   type: 'stock' },
  { id: 'AMZN',      symbol: 'AMZN',     name: 'Amazon.com',       price: 184.30,   change: -1.5,  high24h: 188,   low24h: 182,   type: 'stock' },
  { id: 'NVDA',      symbol: 'NVDA',     name: 'NVIDIA',           price: 924.70,   change: 3.5,   high24h: 930,   low24h: 900,   type: 'stock' },
  { id: 'THYAO.IS',  symbol: 'THYAO',    name: 'Türk Hava Yolları',price: 305.50,   change: 4.20,  high24h: 310,   low24h: 295,   type: 'stock' },
  { id: 'META',      symbol: 'META',     name: 'Meta Platforms',   price: 495.30,   change: 1.50,  high24h: 500,   low24h: 490,   type: 'stock' },
  { id: 'NFLX',      symbol: 'NFLX',     name: 'Netflix',          price: 605.10,   change: -0.80, high24h: 610,   low24h: 600,   type: 'stock' },
  { id: 'AMD',       symbol: 'AMD',      name: 'AMD',              price: 165.40,   change: 2.50,  high24h: 170,   low24h: 160,   type: 'stock' },
  { id: 'KCHOL.IS',  symbol: 'KCHOL',    name: 'Koç Holding',      price: 215.50,   change: 1.80,  high24h: 220,   low24h: 210,   type: 'stock' },
  { id: 'ASELS.IS',  symbol: 'ASELS',    name: 'Aselsan',          price: 63.40,    change: -1.20, high24h: 65,    low24h: 62,    type: 'stock' },
  { id: 'TUPRS.IS',  symbol: 'TUPRS',    name: 'Tüpraş',           price: 177.20,   change: 0.90,  high24h: 180,   low24h: 175,   type: 'stock' },
];

const CURRENCIES = {
  USD: { symbol: '$', label: 'USD', locale: 'en-US' },
  TRY: { symbol: '₺', label: 'TRY', locale: 'tr-TR' },
  GBP: { symbol: '£', label: 'GBP', locale: 'en-GB' },
  KZT: { symbol: '₸', label: 'KZT', locale: 'kk-KZ' },
  RUB: { symbol: '₽', label: 'RUB', locale: 'ru-RU' }
};

const LANGUAGES = {
  TR: { label: 'Türkçe', flag: '🇹🇷' },
  EN: { label: 'English', flag: '🇬🇧' },
  DE: { label: 'Deutsch', flag: '🇩🇪' },
  RU: { label: 'Русский', flag: '🇷🇺' }
};

const TRANSLATIONS = {
  TR: {
    markets: 'Piyasalar', news: 'Haberler', alerts: 'Alarmlar', mainMenu: 'Ana Menü', logout: 'Çıkış Yap',
    marketView: 'Piyasa Görünümü', marketNews: 'Piyasa Bülteni', priceAlerts: 'Fiyat Alarmları',
    search: 'Varlık ara...', crypto: 'Kripto', stock: 'Hisse', all: 'Tümü', favorites: 'Favoriler',
    asset: 'Varlık', price: 'Fiyat', high: 'Yük.', low: 'Düş.', change: '%24s', loading: 'Yükleniyor...', noResult: 'Sonuç bulunamadı',
    detail: 'Detay', high24h: '24s Y', low24h: '24s D', buySellSignals: 'Al/Sat Sinyalleri', aiAnalyze: 'AI Yorumla',
    chartLoading: 'Grafik verileri çekiliyor...', chartError: 'grafiği yüklenemedi', backendError: 'Backend sunucunun çalıştığından emin olun',
    aiAnalyzing: 'AI grafiği analiz ediyor, lütfen bekleyin...', globalMarketNews: 'Küresel Piyasa Bülteni', searchNews: 'Haberlerde ara...',
    macro: 'Makro', refresh: 'Yenile', noNews: 'Haber bulunamadı', tryDifferentCategory: 'Farklı bir kategori veya arama terimi deneyin.',
    source: 'Kaynak', newsCount: 'haber', setPriceAlert: 'Fiyat Alarmı Kur', telegramConnected: 'Bağlı ✓', telegramNotConnected: 'Bağlı Değil',
    alertsAutoForwarded: 'Alarmlar otomatik iletilecek', checkEnv: "Backend .env'yi kontrol edin", condition: 'Koşul', priceGoesUp: 'Fiyat yukarı geçerse',
    priceGoesDown: 'Fiyat aşağı düşerse', targetPrice: 'Hedef Fiyat', saveAlert: 'Alarmı Kaydet', telegramTestMsg: 'Telegram Test Mesajı',
    activeAlerts: 'Aktif Alarmlar', noAlertsYet: 'Henüz alarm kurulmadı', useLeftPanelToSetAlert: 'Sol paneli kullanarak yeni bir fiyat alarmı kurun.',
    ifRises: 'Yükselirse', ifFalls: 'Düşerse', current: 'güncel', aiAssistant: 'AI Yatırım Asistanı', askSomething: 'Bir şey sorun...',
    aiGreeting: '👋 Merhaba! Ben nextTrade AI yatırım asistanıyım.\n\nKripto ve hisse senetleri hakkında soru sorabilir, analiz isteyebilir veya piyasa hakkında konuşabiliriz.',
    aiSuggestions: ['Bitcoin ne olacak?', 'Portföy önerisi ver', 'RSI nedir?', 'Altcoin sezonu başlıyor mu?', 'Güvenli liman nedir?', 'NVDA hissesi analiz et'],
    about: 'Hakkında', marketRank: 'Piyasa Sırası', marketCap: 'Piyasa Değeri', volume24h: 'İşlem Hacmi (24s)', ath: 'Tüm Zamanların En Yükseği',
    circulatingSupply: 'Dolaşımdaki Arz', maxSupply: 'Maksimum Arz', infinite: '∞ Sınırsız', change7d: '7 Günlük Değişim', change30d: '30 Günlük Değişim',
    genesisDate: 'İlk Blok Tarihi', consensus: 'Konsensüs Mekanizması', categories: 'Kategoriler', staticDataWarning: 'Canlı veri alınamadı, statik bilgiler gösteriliyor.',
    sector: 'Sektör', industry: 'Endüstri', peRatio: 'F/K Oranı (PE)', eps: 'Hisse Başı Kâr (EPS)', dividendYield: 'Temettü Verimi',
    high52w: '52 Haftalık En Yüksek', low52w: '52 Haftalık En Düşük', employees: 'Çalışan Sayısı', beta: 'Beta', revenue: 'Gelir', profitMargin: 'Kâr Marjı',
    generalInfo: 'Genel Bilgi', loadingInfo: 'Varlık bilgileri getiriliyor...', infoFetchFailed: 'Bilgi alınamadı', checkServer: 'Sunucu bağlantısını kontrol edin.', noNewsForAsset: 'için haber bulunamadı'
  },
  EN: {
    markets: 'Markets', news: 'News', alerts: 'Alerts', mainMenu: 'Main Menu', logout: 'Logout',
    marketView: 'Market Overview', marketNews: 'Market News', priceAlerts: 'Price Alerts',
    search: 'Search assets...', crypto: 'Crypto', stock: 'Stock', all: 'All', favorites: 'Favorites',
    asset: 'Asset', price: 'Price', high: 'High', low: 'Low', change: '24h%', loading: 'Loading...', noResult: 'No results found',
    detail: 'Details', high24h: '24h H', low24h: '24h L', buySellSignals: 'Buy/Sell Signals', aiAnalyze: 'AI Analyze',
    chartLoading: 'Loading chart data...', chartError: 'chart could not be loaded', backendError: 'Ensure backend server is running',
    aiAnalyzing: 'AI is analyzing the chart, please wait...', globalMarketNews: 'Global Market News', searchNews: 'Search news...',
    macro: 'Macro', refresh: 'Refresh', noNews: 'No news found', tryDifferentCategory: 'Try a different category or search term.',
    source: 'Source', newsCount: 'news', setPriceAlert: 'Set Price Alert', telegramConnected: 'Connected ✓', telegramNotConnected: 'Not Connected',
    alertsAutoForwarded: 'Alerts will be auto-forwarded', checkEnv: "Check backend .env", condition: 'Condition', priceGoesUp: 'If price goes up',
    priceGoesDown: 'If price goes down', targetPrice: 'Target Price', saveAlert: 'Save Alert', telegramTestMsg: 'Telegram Test Msg',
    activeAlerts: 'Active Alerts', noAlertsYet: 'No alerts set yet', useLeftPanelToSetAlert: 'Use the left panel to set a new price alert.',
    ifRises: 'If Rises', ifFalls: 'If Falls', current: 'current', aiAssistant: 'AI Investment Assistant', askSomething: 'Ask something...',
    aiGreeting: '👋 Hello! I am the nextTrade AI investment assistant.\n\nYou can ask about crypto and stocks, request analysis, or talk about the market.',
    aiSuggestions: ['What will happen to Bitcoin?', 'Give portfolio advice', 'What is RSI?', 'Is altcoin season starting?', 'What is a safe haven?', 'Analyze NVDA stock'],
    about: 'About', marketRank: 'Market Rank', marketCap: 'Market Cap', volume24h: 'Volume (24h)', ath: 'All Time High',
    circulatingSupply: 'Circulating Supply', maxSupply: 'Max Supply', infinite: '∞ Infinite', change7d: '7-Day Change', change30d: '30-Day Change',
    genesisDate: 'Genesis Date', consensus: 'Consensus Mechanism', categories: 'Categories', staticDataWarning: 'Live data unavailable, showing static info.',
    sector: 'Sector', industry: 'Industry', peRatio: 'P/E Ratio', eps: 'Earnings Per Share (EPS)', dividendYield: 'Dividend Yield',
    high52w: '52-Week High', low52w: '52-Week Low', employees: 'Employees', beta: 'Beta', revenue: 'Revenue', profitMargin: 'Profit Margin',
    generalInfo: 'General Info', loadingInfo: 'Fetching asset information...', infoFetchFailed: 'Failed to fetch info', checkServer: 'Check server connection.', noNewsForAsset: 'No news found for'
  },
  DE: {
    markets: 'Märkte', news: 'Nachrichten', alerts: 'Alarme', mainMenu: 'Hauptmenü', logout: 'Abmelden',
    marketView: 'Marktübersicht', marketNews: 'Marktnachrichten', priceAlerts: 'Preisalarme',
    search: 'Suchen...', crypto: 'Krypto', stock: 'Aktien', all: 'Alle', favorites: 'Favoriten',
    asset: 'Anlage', price: 'Preis', high: 'Hoch', low: 'Tief', change: '24h%', loading: 'Wird geladen...', noResult: 'Keine Ergebnisse',
    detail: 'Details', high24h: '24h H', low24h: '24h T', buySellSignals: 'Kauf/Verkauf Signale', aiAnalyze: 'KI Analyse',
    chartLoading: 'Diagrammdaten werden geladen...', chartError: 'Diagramm konnte nicht geladen werden', backendError: 'Stellen Sie sicher, dass der Backend-Server läuft',
    aiAnalyzing: 'KI analysiert das Diagramm, bitte warten...', globalMarketNews: 'Globale Marktnachrichten', searchNews: 'Nachrichten suchen...',
    macro: 'Makro', refresh: 'Aktualisieren', noNews: 'Keine Nachrichten gefunden', tryDifferentCategory: 'Versuchen Sie eine andere Kategorie oder einen anderen Suchbegriff.',
    source: 'Quelle', newsCount: 'Nachrichten', setPriceAlert: 'Preisalarm einstellen', telegramConnected: 'Verbunden ✓', telegramNotConnected: 'Nicht verbunden',
    alertsAutoForwarded: 'Alarme werden automatisch weitergeleitet', checkEnv: "Überprüfen Sie das Backend .env", condition: 'Bedingung', priceGoesUp: 'Wenn der Preis steigt',
    priceGoesDown: 'Wenn der Preis fällt', targetPrice: 'Zielpreis', saveAlert: 'Alarm speichern', telegramTestMsg: 'Telegramm-Testnachricht',
    activeAlerts: 'Aktive Alarme', noAlertsYet: 'Noch keine Alarme eingestellt', useLeftPanelToSetAlert: 'Verwenden Sie das linke Feld, um einen neuen Preisalarm einzustellen.',
    ifRises: 'Wenn steigt', ifFalls: 'Wenn fällt', current: 'aktuell', aiAssistant: 'KI-Anlageassistent', askSomething: 'Fragen Sie etwas...',
    aiGreeting: '👋 Hallo! Ich bin der nextTrade KI-Anlageassistent.\n\nSie können nach Krypto und Aktien fragen, Analysen anfordern oder über den Markt sprechen.',
    aiSuggestions: ['Was passiert mit Bitcoin?', 'Gib Portfolio-Beratung', 'Was ist RSI?', 'Beginnt die Altcoin-Saison?', 'Was ist ein sicherer Hafen?', 'Analysiere NVDA Aktie'],
    about: 'Über', marketRank: 'Marktrang', marketCap: 'Marktkapitalisierung', volume24h: 'Volumen (24h)', ath: 'Allzeithoch',
    circulatingSupply: 'Zirkulierende Versorgung', maxSupply: 'Maximale Versorgung', infinite: '∞ Unendlich', change7d: '7-Tage-Veränderung', change30d: '30-Tage-Veränderung',
    genesisDate: 'Genesis-Datum', consensus: 'Konsensmechanismus', categories: 'Kategorien', staticDataWarning: 'Live-Daten nicht verfügbar, zeige statische Infos.',
    sector: 'Sektor', industry: 'Industrie', peRatio: 'KGV (PE)', eps: 'Gewinn pro Aktie (EPS)', dividendYield: 'Dividendenrendite',
    high52w: '52-Wochen-Hoch', low52w: '52-Wochen-Tief', employees: 'Mitarbeiter', beta: 'Beta', revenue: 'Einnahmen', profitMargin: 'Gewinnmarge',
    generalInfo: 'Allgemeine Infos', loadingInfo: 'Anlageninformationen werden abgerufen...', infoFetchFailed: 'Informationen konnten nicht abgerufen werden', checkServer: 'Überprüfen Sie die Serververbindung.', noNewsForAsset: 'Keine Nachrichten gefunden für'
  },
  RU: {
    markets: 'Рынки', news: 'Новости', alerts: 'Оповещения', mainMenu: 'Главное меню', logout: 'Выйти',
    marketView: 'Обзор рынка', marketNews: 'Новости рынка', priceAlerts: 'Оповещения о ценах',
    search: 'Поиск...', crypto: 'Крипто', stock: 'Акции', all: 'Все', favorites: 'Избранное',
    asset: 'Актив', price: 'Цена', high: 'Макс.', low: 'Мин.', change: '24ч%', loading: 'Загрузка...', noResult: 'Ничего не найдено',
    detail: 'Детали', high24h: '24ч Макс', low24h: '24ч Мин', buySellSignals: 'Сигналы', aiAnalyze: 'AI Анализ',
    chartLoading: 'Загрузка данных графика...', chartError: 'График не удалось загрузить', backendError: 'Убедитесь, что сервер работает',
    aiAnalyzing: 'ИИ анализирует график, пожалуйста, подождите...', globalMarketNews: 'Глобальные новости рынка', searchNews: 'Поиск новостей...',
    macro: 'Макро', refresh: 'Обновить', noNews: 'Новости не найдены', tryDifferentCategory: 'Попробуйте другую категорию или поисковый запрос.',
    source: 'Источник', newsCount: 'новостей', setPriceAlert: 'Установить оповещение', telegramConnected: 'Подключено ✓', telegramNotConnected: 'Не подключено',
    alertsAutoForwarded: 'Оповещения будут пересылаться', checkEnv: "Проверьте .env", condition: 'Условие', priceGoesUp: 'Если цена вырастет',
    priceGoesDown: 'Если цена упадет', targetPrice: 'Целевая цена', saveAlert: 'Сохранить', telegramTestMsg: 'Тестовое сообщение',
    activeAlerts: 'Активные оповещения', noAlertsYet: 'Оповещения еще не установлены', useLeftPanelToSetAlert: 'Используйте левую панель для установки оповещения.',
    ifRises: 'Если вырастет', ifFalls: 'Если упадет', current: 'текущая', aiAssistant: 'ИИ инвестиционный помощник', askSomething: 'Спросите что-нибудь...',
    aiGreeting: '👋 Здравствуйте! Я ИИ-помощник nextTrade.\n\nВы можете спрашивать о крипте и акциях, запрашивать анализ или обсуждать рынок.',
    aiSuggestions: ['Что будет с Bitcoin?', 'Дай совет по портфелю', 'Что такое RSI?', 'Начинается ли сезон альткоинов?', 'Что такое тихая гавань?', 'Анализ акции NVDA'],
    about: 'О проекте', marketRank: 'Рыночный ранг', marketCap: 'Рыночная капитализация', volume24h: 'Объем (24ч)', ath: 'Исторический максимум',
    circulatingSupply: 'Циркулирующее предложение', maxSupply: 'Максимальное предложение', infinite: '∞ Бесконечно', change7d: 'Изменение за 7 дней', change30d: 'Изменение за 30 дней',
    genesisDate: 'Дата создания', consensus: 'Механизм консенсуса', categories: 'Категории', staticDataWarning: 'Данные в реальном времени недоступны, показана статическая информация.',
    sector: 'Сектор', industry: 'Отрасль', peRatio: 'Отношение P/E', eps: 'Прибыль на акцию (EPS)', dividendYield: 'Дивидендная доходность',
    high52w: '52-недельный максимум', low52w: '52-недельный минимум', employees: 'Сотрудники', beta: 'Бета', revenue: 'Доход', profitMargin: 'Маржа прибыли',
    generalInfo: 'Общая информация', loadingInfo: 'Получение информации об активе...', infoFetchFailed: 'Не удалось получить информацию', checkServer: 'Проверьте соединение с сервером.', noNewsForAsset: 'Нет новостей для'
  }
};

function formatPrice(price, currency = 'USD', rates = { USD: 1 }) {
  if (!price && price !== 0) return '—';
  const rate = rates[currency] || 1;
  const converted = price * rate;
  if (converted >= 1000) return converted.toLocaleString(CURRENCIES[currency].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (converted >= 1)    return converted.toFixed(2);
  return converted.toFixed(6);
}

// ============================================================
// TICKER BAND
// ============================================================
function TickerBand({ marketData, currency, rates }) {
  const items = [...marketData, ...marketData]; // infinite loop için çift
  return (
    <div className="ticker-container" style={{ height: 36 }}>
      <div className="ticker-track">
        {items.map((asset, i) => (
          <div key={`${asset.id}-${i}`} className="ticker-item">
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}>{asset.symbol}</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>
              {CURRENCIES[currency].symbol}{formatPrice(asset.price, currency, rates)}
            </span>
            <span style={{ color: (asset.change || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 10.5, fontWeight: 700 }}>
              {(asset.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(asset.change || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MARKET MODULE
// ============================================================
function MarketModule({ marketData, marketLoading, activeTab, setActiveTab, selectedAsset, setSelectedAsset, favorites, toggleFavorite, searchQuery, setSelectedForDetail, currency, rates, t }) {
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' });
  const [subTab, setSubTab] = useState('all'); // all | favorites
  const [chartData, setChartData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [showSignals, setShowSignals] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Filtreleme ve sıralama
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

  // Grafik verisi çek
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
  }, [selectedAsset, timeframe, showSignals]);

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
      {/* LEFT: Asset List */}
      <div className="market-list-panel">
        {/* Crypto / Stock tabs */}
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

        {/* Sub-tabs: All / Favorites */}
        <div className="market-subtabs">
          <button className={`sub-tab ${subTab === 'all' ? 'active' : ''}`} onClick={() => setSubTab('all')}>{t('all')}</button>
          <button className={`sub-tab ${subTab === 'favorites' ? 'active' : ''}`} onClick={() => setSubTab('favorites')}>
            ⭐ {t('favorites')} {favorites.length > 0 && <span style={{ marginLeft: 3, opacity: 0.7 }}>({favorites.length})</span>}
          </button>
        </div>

        {/* Table header */}
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

        {/* Asset rows */}
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

      {/* RIGHT: Chart Panel */}
      <div className="chart-panel">
        {/* Chart Header */}
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

        {/* Actions */}
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

        {/* Chart Area */}
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

      {/* AI Analysis Modal */}
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

// ============================================================
// NEWS MODULE
// ============================================================
function NewsModule({ onSummarizeNews, t }) {
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
  }, []);

  const filteredNews = useMemo(() => {
    return newsData.filter(n => {
      const matchSearch = !searchNews || n.title.toLowerCase().includes(searchNews.toLowerCase());
      return matchSearch;
    });
  }, [newsData, searchNews]);

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
                  <button className="news-ai-btn" onClick={e => { e.stopPropagation(); onSummarizeNews && onSummarizeNews(news.title); }}>
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

// ============================================================
// ALERTS MODULE
// ============================================================
function AlertsModule({ marketData, currency, rates, t, user, setUser }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [form, setForm] = useState({ symbol: 'BTC', target_price: '', condition: 'greater' });
  const [chatIdInput, setChatIdInput] = useState(user?.telegram_chat_id || '');
  const [isEditingChatId, setIsEditingChatId] = useState(false);

  const currentPrice = marketData.find(m => m.symbol.toUpperCase() === form.symbol.toUpperCase())?.price;

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('nt_token')}` }
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API_BASE_URL}/api/alerts/`, getAuthHeaders()); setAlerts(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const checkTelegram = async () => {
    if (!user?.telegram_chat_id) {
      setTelegramStatus('error');
      return;
    }
    try {
      const r = await axios.get(`${API_BASE_URL}/api/alerts/test`, getAuthHeaders());
      setTelegramStatus(r.data?.success ? 'connected' : 'error');
    } catch { setTelegramStatus('error'); }
  };

  const handleSaveChatId = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/me/telegram`, { telegram_chat_id: chatIdInput }, getAuthHeaders());
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('nt_user', JSON.stringify(updatedUser));
      setIsEditingChatId(false);
      setTelegramStatus('connected');
    } catch (e) {
      alert("Chat ID kaydedilemedi.");
    }
  };

  useEffect(() => { fetchAlerts(); checkTelegram(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.target_price) return;
    const rate = rates[currency] || 1;
    try {
      await axios.post(`${API_BASE_URL}/api/alerts/`, {
        symbol: form.symbol,
        target_price: parseFloat(form.target_price) / rate,
        condition: form.condition
      }, getAuthHeaders());
      setForm(prev => ({ ...prev, target_price: '' }));
      fetchAlerts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API_BASE_URL}/api/alerts/${id}`, getAuthHeaders()); fetchAlerts(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="alerts-module">
      {/* Left: Form */}
      <div className="alerts-form-panel">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bell size={18} style={{ color: 'var(--accent-blue)' }} /> {t('setPriceAlert')}
          </h2>

          {/* Telegram Status */}
          <div className={`telegram-status ${user?.telegram_chat_id && !isEditingChatId ? '' : ''}`}
            style={{ background: user?.telegram_chat_id ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)', borderColor: user?.telegram_chat_id ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className={`status-dot ${user?.telegram_chat_id ? 'connected' : 'disconnected'}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: user?.telegram_chat_id ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  Telegram {user?.telegram_chat_id ? t('telegramConnected') : t('telegramNotConnected')}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 1 }}>
                  {user?.telegram_chat_id ? 'Chat ID: ' + user.telegram_chat_id : 'Chat ID gerekli'}
                </div>
              </div>
              {user?.telegram_chat_id && !isEditingChatId && (
                <button onClick={() => setIsEditingChatId(true)} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>Düzenle</button>
              )}
            </div>

            {(!user?.telegram_chat_id || isEditingChatId) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>ID'nizi öğrenmek için Telegram'da <strong>@userinfobot</strong>'a yazın.</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={chatIdInput} onChange={e => setChatIdInput(e.target.value)} placeholder="Örn: 123456789" style={{ flex: 1, padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                  <button type="button" onClick={handleSaveChatId} style={{ padding: '6px 12px', fontSize: 12, background: 'var(--accent-blue)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Kaydet</button>
                </div>
                {user?.telegram_chat_id && isEditingChatId && (
                  <button type="button" onClick={() => { setIsEditingChatId(false); setChatIdInput(user.telegram_chat_id); }} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'flex-start' }}>İptal</button>
                )}
              </div>
            )}
            
            {user?.telegram_chat_id && !isEditingChatId && (
              <button onClick={checkTelegram} type="button" style={{ marginTop: 4, padding: '4px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'flex-start' }}>Test Mesajı Gönder</button>
            )}
          </div>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Varlık</label>
            <select
              className="form-select"
              value={form.symbol}
              onChange={e => {
                const sym = e.target.value;
                const asset = marketData.find(m => m.symbol === sym);
                const rate = rates[currency] || 1;
                setForm({ ...form, symbol: sym, target_price: asset ? (asset.price * rate).toFixed(asset.price * rate < 1 ? 6 : 2) : '' });
              }}
            >
              {marketData.map(a => (
                <option key={a.id} value={a.symbol}>{a.name} ({a.symbol})</option>
              ))}
            </select>
            {currentPrice && (
              <span style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                {t('current')}: {CURRENCIES[currency].symbol}{formatPrice(currentPrice, currency, rates)}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t('condition')}</label>
            <select className="form-select" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
              <option value="greater">📈 {t('priceGoesUp')}</option>
              <option value="less">📉 {t('priceGoesDown')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('targetPrice')} ({CURRENCIES[currency].symbol})</label>
            <input
              className="form-input"
              type="number"
              step="any"
              placeholder="Örn: 70000"
              value={form.target_price}
              onChange={e => setForm({ ...form, target_price: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            <Plus size={15} /> {t('saveAlert')}
          </button>
        </form>

        {/* Telegram Test */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={async () => {
              try {
                await axios.get(`${API_BASE_URL}/api/alerts/test`);
                setTelegramStatus('connected');
                alert('✅ Telegram\'a test mesajı gönderildi!');
              } catch { alert('❌ Telegram bağlantısı kurulamadı.'); }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '10px 14px', background: 'rgba(68,136,255,0.08)', border: '1px solid rgba(68,136,255,0.15)', borderRadius: 'var(--radius-md)', fontSize: 12.5, fontWeight: 600, color: 'var(--accent-blue)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
          >
            <Smartphone size={14} /> {t('telegramTestMsg')}
          </button>
        </div>
      </div>

      {/* Right: Alerts List */}
      <div className="alerts-list-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            {t('activeAlerts')}
            {alerts.length > 0 && <span style={{ marginLeft: 8, fontSize: 12, background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.2)', borderRadius: 'var(--radius-full)', padding: '2px 8px', color: 'var(--accent-blue)' }}>{alerts.length}</span>}
          </h3>
          <button onClick={fetchAlerts} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: 11.5, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={12} /> {t('refresh')}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div className="spinner" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-state-icon" />
            <div className="empty-state-title">{t('noAlertsYet')}</div>
            <div className="empty-state-desc">{t('useLeftPanelToSetAlert')}</div>
          </div>
        ) : (
          alerts.map(alert => {
            const assetData = marketData.find(m => m.symbol.toUpperCase() === alert.symbol.toUpperCase());
            const current = assetData?.price || 0;
            const progress = alert.condition === 'greater'
              ? Math.min(100, (current / alert.target_price) * 100)
              : Math.min(100, (alert.target_price / current) * 100);

            return (
              <div key={alert.id} className="alert-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  <div className="alert-icon-box">{alert.symbol.slice(0, 3)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>{alert.symbol}</span>
                      <span className={`badge ${alert.condition === 'greater' ? 'green' : 'red'}`}>
                        {alert.condition === 'greater' ? `▲ ${t('ifRises')}` : `▼ ${t('ifFalls')}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                        {CURRENCIES[currency].symbol}{formatPrice(alert.target_price, currency, rates)}
                      </span>
                      {current > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                          ({t('current')}: {CURRENCIES[currency].symbol}{formatPrice(current, currency, rates)})
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    {current > 0 && (
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(progress, 100)}%`,
                          background: alert.condition === 'greater' ? 'var(--gradient-green)' : 'var(--gradient-red)',
                          borderRadius: 2,
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(alert.id)}
                  style={{ display: 'flex', alignItems: 'center', padding: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', cursor: 'pointer', transition: 'var(--transition-fast)', marginLeft: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}>
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// AI CHAT
// ============================================================
function AIChat({ selectedAsset, currency, rates, t }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: 'GREETING_MSG'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: msg,
        history: messages.slice(-10),
        context_news: selectedAsset ? `Kullanıcı şu an ${selectedAsset.name} (${selectedAsset.symbol}) bakıyor. Fiyat: ${CURRENCIES[currency].symbol}${formatPrice(selectedAsset.price, currency, rates)}, 24s değişim: ${selectedAsset.change}%` : ''
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Şu an bağlantı kurulamıyor. Backend\'i kontrol edin.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-fab">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <Bot size={16} />
              {t('aiAssistant')}
              <div className="chat-online-dot" />
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)}><X size={14} /></button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                <div className={`chat-bubble ${msg.sender}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text === 'GREETING_MSG' ? t('aiGreeting') : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="chat-bubble ai" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ animation: 'blink 1s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  <span style={{ animation: 'blink 1s 0.3s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  <span style={{ animation: 'blink 1s 0.6s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="chat-suggestions">
            {(t('aiSuggestions') || []).map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder={t('askSomething')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="chat-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
      <button className="chat-toggle-btn" onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  // Auth
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nt_user')); } catch { return null; }
  });

  // App state
  const [activeModule, setActiveModule] = useState('markets');
  const [activeTab, setActiveTab] = useState('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState(FALLBACK_MARKET);
  const [marketLoading, setMarketLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(FALLBACK_MARKET[0]);
  const [selectedForDetail, setSelectedForDetail] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nextTrade_favorites')) || []; } catch { return []; }
  });
  const [currency, setCurrency] = useState(() => localStorage.getItem('nt_currency') || 'USD');
  const [rates, setRates] = useState({ USD: 1, TRY: 32.5, GBP: 0.79, KZT: 445.0, RUB: 92.5 });
  const [lang, setLang] = useState(() => localStorage.getItem('nt_lang') || 'TR');
  const [lastUpdated, setLastUpdated] = useState(null);

  const t = (key) => TRANSLATIONS[lang]?.[key] || key;

  useEffect(() => {
    localStorage.setItem('nt_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('nt_lang', lang);
  }, [lang]);

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD')
      .then(res => {
        if (res.data && res.data.rates) setRates(prev => ({ ...prev, ...res.data.rates }));
      }).catch(console.error);
  }, []);

  // Favorileri kaydet
  useEffect(() => {
    localStorage.setItem('nextTrade_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((e, symbol) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(symbol) ? prev.filter(f => f !== symbol) : [...prev, symbol]);
  }, []);

  // Piyasa verisini çek (30 saniyede bir yenile)
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

  // Seçili asset'i market data güncellendiğinde de güncelle
  useEffect(() => {
    if (!selectedAsset) return;
    const updated = marketData.find(a => a.id === selectedAsset.id);
    if (updated) setSelectedAsset(updated);
  }, [marketData]);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  };

  const handleSummarizeNews = (newsTitle) => {
    // Haberi AI chat'e gönder
    setActiveModule('markets'); // chat açık kalabilir
    // Chat bileşenine mesaj ilet — en kolay yol: custom event
    window.dispatchEvent(new CustomEvent('nt-summarize-news', { detail: { title: newsTitle } }));
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'markets', icon: <BarChart2 size={17} />, label: t('markets') },
    { id: 'news',    icon: <Newspaper size={17} />, label: t('news') },
    { id: 'alerts',  icon: <Bell size={17} />,      label: t('alerts') },
  ];

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TrendingUp size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">nextTrade</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">{t('mainMenu')}</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'alerts' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(68,136,255,0.15)', padding: '1px 6px', borderRadius: 'var(--radius-full)', color: 'var(--accent-blue)' }}>Telegram</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Card */}
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
        {/* Ticker Band */}
        <TickerBand marketData={marketData} currency={currency} rates={rates} />

        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="topbar-title">
              {activeModule === 'markets' ? t('marketView') :
               activeModule === 'news'    ? t('marketNews')  : t('priceAlerts')}
            </span>
            {lastUpdated && activeModule === 'markets' && (
              <span style={{ fontSize: 10.5, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Wifi size={10} style={{ color: 'var(--accent-green)' }} />
                {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {activeModule === 'markets' && (
              <div className="search-bar">
                <Search size={13} className="search-icon" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            )}
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

        {/* Module Area */}
        <div className="module-area">
          {activeModule === 'markets' && (
            <MarketModule
              marketData={marketData}
              marketLoading={marketLoading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              searchQuery={searchQuery}
              setSelectedForDetail={setSelectedForDetail}
              currency={currency}
              rates={rates}
              t={t}
            />
          )}
          {activeModule === 'news' && (
            <NewsModule onSummarizeNews={handleSummarizeNews} t={t} />
          )}
          {activeModule === 'alerts' && (
            <AlertsModule marketData={marketData} currency={currency} rates={rates} t={t} user={user} setUser={setUser} />
          )}
        </div>
      </div>

      {/* Asset Detail Drawer */}
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

      {/* AI Chat FAB */}
      <AIChat selectedAsset={selectedAsset} currency={currency} rates={rates} t={t} />
    </div>
  );
}