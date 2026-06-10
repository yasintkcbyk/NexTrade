export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const FALLBACK_MARKET = [
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
  { id: 'shiba-inu', symbol: 'SHIB',     name: 'Shiba Inu',        price: 0.000025, change: 5.20,  high24h: 0.000027, low24h: 0.000023, type: 'crypto' },
  { id: 'litecoin',  symbol: 'LTC',      name: 'Litecoin',         price: 85.50,    change: 1.50,  high24h: 87.00, low24h: 84.00, type: 'crypto' },
  { id: 'the-open-network', symbol: 'TON', name: 'Toncoin',        price: 6.80,     change: -2.30, high24h: 7.10,  low24h: 6.50,  type: 'crypto' },
  { id: 'uniswap',   symbol: 'UNI',      name: 'Uniswap',          price: 10.20,    change: 4.10,  high24h: 10.50, low24h: 9.80,  type: 'crypto' },
  { id: 'pepe',      symbol: 'PEPE',     name: 'Pepe',             price: 0.000015, change: 12.50, high24h: 0.000016, low24h: 0.000012, type: 'crypto' },
  { id: 'near',      symbol: 'NEAR',     name: 'NEAR Protocol',    price: 8.20,     change: 3.40,  high24h: 8.50,  low24h: 7.50,  type: 'crypto' },
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
  { id: 'V',         symbol: 'V',        name: 'Visa Inc.',        price: 275.40,   change: 0.50,  high24h: 278,   low24h: 273,   type: 'stock' },
  { id: 'JPM',       symbol: 'JPM',      name: 'JPMorgan Chase',   price: 195.80,   change: 1.20,  high24h: 198,   low24h: 194,   type: 'stock' },
  { id: 'SBUX',      symbol: 'SBUX',     name: 'Starbucks',        price: 85.20,    change: -0.80, high24h: 87,    low24h: 84,    type: 'stock' },
  { id: 'TCELL.IS',  symbol: 'TCELL',    name: 'Turkcell',         price: 85.60,    change: 2.10,  high24h: 87,    low24h: 84,    type: 'stock' },
  { id: 'BIMAS.IS',  symbol: 'BIMAS',    name: 'BİM',              price: 395.00,   change: 1.50,  high24h: 400,   low24h: 390,   type: 'stock' },
  { id: 'INTC',      symbol: 'INTC',     name: 'Intel',            price: 31.50,    change: 0.20,  high24h: 32,    low24h: 30,    type: 'stock' },
  { id: 'FROTO.IS',  symbol: 'FROTO',    name: 'Ford Otosan',      price: 1080.00,  change: 2.30,  high24h: 1100,  low24h: 1050,  type: 'stock' }
];

export const CURRENCIES = {
  USD: { symbol: '$', label: 'USD', locale: 'en-US' },
  TRY: { symbol: '₺', label: 'TRY', locale: 'tr-TR' },
  GBP: { symbol: '£', label: 'GBP', locale: 'en-GB' },
  KZT: { symbol: '₸', label: 'KZT', locale: 'kk-KZ' },
  RUB: { symbol: '₽', label: 'RUB', locale: 'ru-RU' }
};

export const LANGUAGES = {
  TR: { label: 'Türkçe', flag: '🇹🇷' },
  EN: { label: 'English', flag: '🇬🇧' },
  DE: { label: 'Deutsch', flag: '🇩🇪' },
  RU: { label: 'Русский', flag: '🇷🇺' }
};

export const TRANSLATIONS = {
  TR: {
    markets: 'Piyasalar', news: 'Haberler', alerts: 'Alarmlar', mainMenu: 'Ana Menü', logout: 'Çıkış Yap', goBack: 'Geri Dön',
    marketView: 'Piyasa Görünümü', marketNews: 'Piyasa Bülteni', priceAlerts: 'Fiyat Alarmları', converter: 'Çevirici', portfolio: 'Portföy',
    assetConverter: 'Varlık Çevirici', from: 'Bundan', to: 'Buna', amount: 'Miktar', result: 'Sonuç',
    search: 'Varlık ara...', crypto: 'Kripto', stock: 'Hisse', metal: 'Değerli Madenler', all: 'Tümü', favorites: 'Favoriler',
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
    generalInfo: 'Genel Bilgi', loadingInfo: 'Varlık bilgileri getiriliyor...', infoFetchFailed: 'Bilgi alınamadı', checkServer: 'Sunucu bağlantısını kontrol edin.', noNewsForAsset: 'için haber bulunamadı',
    time4h: '4S', timeMax: 'TÜMÜ', themeLight: 'Aydınlık Mod', themeDark: 'Karanlık Mod',
    STRONG_BUY: 'Güçlü Al', BUY: 'Al', HOLD: 'Beklet', SELL: 'Sat', STRONG_SELL: 'Güçlü Sat'
  },
  EN: {
    markets: 'Markets', news: 'News', alerts: 'Alerts', mainMenu: 'Main Menu', logout: 'Logout', goBack: 'Go Back',
    marketView: 'Market Overview', marketNews: 'Market News', priceAlerts: 'Price Alerts', converter: 'Converter', portfolio: 'Portfolio',
    assetConverter: 'Asset Converter', from: 'From', to: 'To', amount: 'Amount', result: 'Result',
    search: 'Search assets...', crypto: 'Crypto', stock: 'Stock', metal: 'Precious Metals', all: 'All', favorites: 'Favorites',
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
    generalInfo: 'General Info', loadingInfo: 'Fetching asset information...', infoFetchFailed: 'Failed to fetch info', checkServer: 'Check server connection.', noNewsForAsset: 'No news found for',
    time4h: '4H', timeMax: 'MAX', themeLight: 'Light Mode', themeDark: 'Dark Mode',
    STRONG_BUY: 'Strong Buy', BUY: 'Buy', HOLD: 'Hold', SELL: 'Sell', STRONG_SELL: 'Strong Sell'
  },
  DE: {
    markets: 'Märkte', news: 'Nachrichten', alerts: 'Alarme', mainMenu: 'Hauptmenü', logout: 'Abmelden', goBack: 'Zurück',
    marketView: 'Marktübersicht', marketNews: 'Marktnachrichten', priceAlerts: 'Preisalarme', converter: 'Konverter', portfolio: 'Portfolio',
    assetConverter: 'Anlagenkonverter', from: 'Von', to: 'Nach', amount: 'Menge', result: 'Ergebnis',
    search: 'Suchen...', crypto: 'Krypto', stock: 'Aktien', metal: 'Edelmetalle', all: 'Alle', favorites: 'Favoriten',
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
    generalInfo: 'Allgemeine Infos', loadingInfo: 'Anlageninformationen werden abgerufen...', infoFetchFailed: 'Informationen konnten nicht abgerufen werden', checkServer: 'Überprüfen Sie die Serververbindung.', noNewsForAsset: 'Keine Nachrichten gefunden für',
    time4h: '4S', timeMax: 'MAX', themeLight: 'Heller Modus', themeDark: 'Dunkler Modus',
    STRONG_BUY: 'Starker Kauf', BUY: 'Kaufen', HOLD: 'Halten', SELL: 'Verkaufen', STRONG_SELL: 'Starker Verkauf'
  },
  RU: {
    markets: 'Рынки', news: 'Новости', alerts: 'Оповещения', mainMenu: 'Главное меню', logout: 'Выйти', goBack: 'Вернуться',
    marketView: 'Обзор рынка', marketNews: 'Новости рынка', priceAlerts: 'Оповещения о ценах', converter: 'Конвертер', portfolio: 'Портфель',
    assetConverter: 'Конвертер активов', from: 'Из', to: 'В', amount: 'Сумма', result: 'Результат',
    search: 'Поиск...', crypto: 'Крипто', stock: 'Акции', metal: 'Драгоценные металлы', all: 'Все', favorites: 'Избранное',
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
    generalInfo: 'Общая информация', loadingInfo: 'Получение информации об активе...', infoFetchFailed: 'Не удалось получить информацию', checkServer: 'Проверьте соединение с сервером.', noNewsForAsset: 'Нет новостей для',
    time4h: '4Ч', timeMax: 'МАКС', themeLight: 'Светлая тема', themeDark: 'Темная тема',
    STRONG_BUY: 'Строгая покупка', BUY: 'Покупать', HOLD: 'Держать', SELL: 'Продавать', STRONG_SELL: 'Строгая продажа'
  }
};

export function formatPrice(price, currency = 'USD', rates = { USD: 1 }) {
  if (!price && price !== 0) return '—';
  const rate = rates[currency] || 1;
  const convertedPrice = price * rate;
  const symbol = CURRENCIES[currency]?.symbol || '$';
  
  // Küçük değerler için ondalık hane kontrolü
  let maxFrac = 2;
  if (convertedPrice < 0.0001) maxFrac = 8;
  else if (convertedPrice < 0.01) maxFrac = 6;
  else if (convertedPrice < 1) maxFrac = 4;

  return `${symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: maxFrac })}`;
}