import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { LineChart, Bell, Newspaper, TrendingUp, ChevronUp, ChevronDown, Search, ArrowRightLeft, Bot, MessageCircle, X, Send, Sparkles } from 'lucide-react'
import Chart from './components/Chart'

// Arayüzü yapılandırmak için örnek piyasa listesi (Liste görünümü için)
const MOCK_MARKET_DATA = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 65430.50, change: 2.34, type: 'crypto' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3450.75, change: -1.20, type: 'crypto' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 145.20, change: 5.67, type: 'crypto' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.49, change: 0.8, type: 'crypto' },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 35.80, change: -0.50, type: 'crypto' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change: 12.40, type: 'crypto' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.45, change: -2.1, type: 'crypto' },
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.15, type: 'stock' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla', price: 195.20, change: -3.45, type: 'stock' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft', price: 420.10, change: 0.85, type: 'stock' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet (Google)', price: 177.9, change: 0.25, type: 'stock' },
  { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com', price: 184.3, change: -1.5, type: 'stock' },
  { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA', price: 924.7, change: 3.5, type: 'stock' },
  { id: 'THYAO.IS', symbol: 'THYAO', name: 'Türk Hava Yolları', price: 305.50, change: 4.20, type: 'stock' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 65430.50, change: 2.34, high24h: 66000, low24h: 64000, type: 'crypto' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3450.75, change: -1.20, high24h: 3500, low24h: 3400, type: 'crypto' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 145.20, change: 5.67, high24h: 150, low24h: 140, type: 'crypto' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.49, change: 0.8, high24h: 0.51, low24h: 0.48, type: 'crypto' },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 35.80, change: -0.50, high24h: 37.00, low24h: 35.00, type: 'crypto' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change: 12.40, high24h: 0.13, low24h: 0.10, type: 'crypto' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.45, change: -2.1, high24h: 0.48, low24h: 0.44, type: 'crypto' },
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.15, high24h: 178, low24h: 174, type: 'stock' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla', price: 195.20, change: -3.45, high24h: 200, low24h: 190, type: 'stock' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft', price: 420.10, change: 0.85, high24h: 425, low24h: 415, type: 'stock' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet (Google)', price: 177.9, change: 0.25, high24h: 180, low24h: 175, type: 'stock' },
  { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com', price: 184.3, change: -1.5, high24h: 188, low24h: 182, type: 'stock' },
  { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA', price: 924.7, change: 3.5, high24h: 930, low24h: 900, type: 'stock' },
  { id: 'THYAO.IS', symbol: 'THYAO', name: 'Türk Hava Yolları', price: 305.50, change: 4.20, high24h: 310, low24h: 295, type: 'stock' },
];

function App() {
  const [activeModule, setActiveModule] = useState('markets') // markets, news, alerts
  const [activeTab, setActiveTab] = useState('crypto')
  const [searchQuery, setSearchQuery] = useState('')
  const [marketData, setMarketData] = useState(MOCK_MARKET_DATA) // Backend'den alınacak canlı liste
  
  // Sıralama (Sorting) State'i: Başlangıçta değişime göre çoktan aza (desc) sıralı
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' })
  
  // Seçili Varlık ve Grafik State'i
  const [selectedAsset, setSelectedAsset] = useState(MOCK_MARKET_DATA[0])
  const [chartData, setChartData] = useState([])
  const [signals, setSignals] = useState([])
  const [newsData, setNewsData] = useState([])
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [timeframe, setTimeframe] = useState('1D');
  const [showSignals, setShowSignals] = useState(false);

  // Yapay Zeka (AI) State'leri
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: 'Merhaba! Ben nextTrade yapay zeka asistanıyım. Piyasa hakkında bana istediğinizi sorabilirsiniz.' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // Canlı Piyasa Listesini ve Veri Akışını Çekme (Arka Planda Periyodik Olarak)
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const [cryptoRes, stockRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/markets/crypto`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/markets/stocks`).catch(() => ({ data: [] }))
        ]);
        
        const combined = [...(cryptoRes.data || []), ...(stockRes.data || [])];
        if (combined.length > 0) {
          setMarketData(combined);
        }
      } catch (error) {
        console.error("Piyasa listesi çekilirken hata:", error);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000); // Her 10 saniyede bir canlı günceller
    return () => clearInterval(interval);
  }, []);

  // Listeden Varlık Seçildiğinde veya Sekme Değiştiğinde API İstekleri
  useEffect(() => {
    setIsLoadingChart(true);
    setChartData([]);
    setSignals([]); 
    setNewsData([]);
    
    const endpoint = selectedAsset.type === 'crypto' 
      ? `${API_BASE_URL}/api/crypto/${selectedAsset.id}/history`
      : `${API_BASE_URL}/api/stocks/${selectedAsset.id}/history`;

    axios.get(endpoint, { params: { interval: timeframe } })
      .then(res => setChartData(res.data))
      .catch(err => console.error("Grafik çekme hatası:", err))
      .finally(() => setIsLoadingChart(false));
      
    // Sinyalleri göster butonu aktifse, sinyalleri de çek
    if (showSignals) {
      const signalsEndpoint = selectedAsset.type === 'crypto'
        ? `${API_BASE_URL}/api/crypto/${selectedAsset.id}/signals`
        : `${API_BASE_URL}/api/stocks/${selectedAsset.id}/signals`;
      
      axios.get(signalsEndpoint)
        .then(res => setSignals(res.data))
        .catch(err => console.error("Sinyal çekme hatası:", err));
    }
  }, [selectedAsset, timeframe, showSignals]);

  // Genel Haberler Sekmesi
  useEffect(() => {
    if (activeModule === 'news') {
      setIsLoadingNews(true);
      axios.get(`${API_BASE_URL}/api/stocks/market/news`)
        .then(res => setNewsData(res.data))
        .catch(err => console.error("Haber çekme hatası:", err))
        .finally(() => setIsLoadingNews(false));
    }
  }, [activeModule]);

  // Yapay Zeka Chat Mesaj Gönderme
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, { message: userMsg });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Üzgünüm, şu an bağlantı kuramıyorum. API anahtarını kontrol edin.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Yapay Zeka Grafik Yorumlatma
  const handleAnalyzeChart = async () => {
    setShowAnalysisModal(true);
    setAiAnalysis(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/analyze-chart`, {
        symbol: selectedAsset.symbol,
        current_price: selectedAsset.price,
        chart_data: chartData
      });
      setAiAnalysis(res.data.analysis);
    } catch (error) {
      setAiAnalysis('Analiz alınırken bir hata oluştu. API anahtarınızı kontrol edin.');
    }
  };

  // Tablo Verisini Filtreleme ve Sıralama (Akıllı Tablo Mantığı)
  const filteredAndSortedData = useMemo(() => {
    let filtered = marketData.filter(item => 
      item.type === activeTab &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [activeTab, searchQuery, sortConfig]);

  // Sütun Başlığına Tıklanınca Sıralama Yönünü Değiştir
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* SOL MODÜL MENÜSÜ (Sidebar) */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-blue-500">
          <LineChart className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-wider">nextTrade</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveModule('markets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeModule === 'markets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'}`}>
            <TrendingUp className="w-5 h-5" /> Piyasalar
          </button>
          <button onClick={() => setActiveModule('news')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeModule === 'news' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'}`}>
            <Newspaper className="w-5 h-5" /> Haberler
          </button>
          <button onClick={() => setActiveModule('alerts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeModule === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'}`}>
            <Bell className="w-5 h-5" /> Alarmlar
          </button>
        </nav>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ÜST BAR (Arama ve Başlık) */}
        <header className="h-20 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between px-8">
          <h1 className="text-2xl font-semibold capitalize">{activeModule === 'markets' ? 'Piyasa Görünümü' : activeModule}</h1>
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Varlık ara..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* MODÜL EKRANLARI */}
        <div className="flex-1 overflow-auto p-8 flex gap-8">
          {activeModule === 'markets' && (
            <>
              {/* SOL SÜTUN: PİYASA LİSTESİ */}
              <div className="w-[500px] flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl shrink-0">
                {/* Varlık Sekmeleri */}
                <div className="flex border-b border-slate-700">
                  <button className={`flex-1 py-4 font-medium transition ${activeTab === 'crypto' ? 'bg-slate-700 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-700/50'}`} onClick={() => { setActiveTab('crypto'); setSelectedAsset(MOCK_MARKET_DATA[0]); }}>Kripto</button>
                  <button className={`flex-1 py-4 font-medium transition ${activeTab === 'stock' ? 'bg-slate-700 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-700/50'}`} onClick={() => { setActiveTab('stock'); setSelectedAsset(MOCK_MARKET_DATA[5]); }}>Hisse</button>
                </div>
                
                {/* Tablo Başlıkları (Sıralama) */}
                <div className="grid grid-cols-5 gap-2 p-4 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                  <div className="col-span-1 cursor-pointer flex items-center gap-1 hover:text-slate-200" onClick={() => handleSort('name')}>Varlık {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                  <div className="col-span-1 cursor-pointer flex items-center justify-end gap-1 hover:text-slate-200" onClick={() => handleSort('price')}>Fiyat {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                  <div className="col-span-1 cursor-pointer flex items-center justify-end gap-1 hover:text-slate-200" onClick={() => handleSort('high24h')}>Yüksek {sortConfig.key === 'high24h' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                  <div className="col-span-1 cursor-pointer flex items-center justify-end gap-1 hover:text-slate-200" onClick={() => handleSort('low24h')}>Düşük {sortConfig.key === 'low24h' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                  <div className="col-span-1 cursor-pointer flex items-center justify-end gap-1 hover:text-slate-200" onClick={() => handleSort('change')}>Değişim {sortConfig.key === 'change' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                </div>

                {/* Tablo İçeriği */}
                <div className="flex-1 overflow-y-auto">
                  {filteredAndSortedData.map(asset => (
                    <div key={asset.id} onClick={() => setSelectedAsset(asset)} className={`grid grid-cols-5 gap-2 px-4 py-3 border-b border-slate-700/50 cursor-pointer transition hover:bg-slate-700/50 ${selectedAsset.id === asset.id ? 'bg-slate-700 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}>
                      <div className="flex flex-col col-span-1 overflow-hidden"><span className="font-bold">{asset.symbol}</span><span className="text-xs text-slate-400 truncate">{asset.name}</span></div>
                      <div className="col-span-1 text-right font-medium flex items-center justify-end">${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</div>
                      <div className="col-span-1 text-right font-medium flex items-center justify-end text-slate-300">${asset.high24h?.toLocaleString() || '-'}</div>
                      <div className="col-span-1 text-right font-medium flex items-center justify-end text-slate-300">${asset.low24h?.toLocaleString() || '-'}</div>
                      <div className={`col-span-1 text-right font-bold flex items-center justify-end ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{asset.change >= 0 ? '+' : ''}{asset.change}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAĞ SÜTUN: DETAY VE GRAFİK */}
              <div className="flex-1 flex flex-col bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative min-w-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">{selectedAsset.name} <span className="text-slate-400 text-xl font-medium">({selectedAsset.symbol})</span></h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-2xl font-bold">${selectedAsset.price.toLocaleString()}</span>
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${selectedAsset.change >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>{selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}%</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" /> Al / Sat
                  </button>
                </div>
                
                {/* Zaman Aralığı ve Analiz Butonları */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
                    {['1D', '1W', '1M', '1Y'].map(tf => (
                      <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                        {tf}
                      </button>
                    ))}
                  </div>
                <button onClick={handleAnalyzeChart} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 font-medium">
                  <Sparkles className="w-4 h-4" /> AI Yorumla
                </button>
                  <button onClick={() => setShowSignals(!showSignals)} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${showSignals ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 hover:bg-slate-600'}`}>
                    <Bot className="w-4 h-4" /> Analiz Sinyalleri
                  </button>
                </div>

                <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 p-4 relative">
                  {isLoadingChart ? (<div className="absolute inset-0 flex items-center justify-center text-slate-400">Grafik yükleniyor...</div>) : chartData.length > 0 ? (<Chart data={chartData} signals={showSignals ? signals : []} />) : (<div className="absolute inset-0 flex items-center justify-center text-slate-400">Veri bulunamadı.</div>)}
                </div>
              </div>
            </>
          )}

          {/* HABERLER MODÜLÜ (Bağımsız Tam Ekran) */}
          {activeModule === 'news' && (
            <div className="w-full flex flex-col bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl overflow-y-auto">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Newspaper className="w-8 h-8 text-blue-500" /> Küresel Piyasa Bülteni</h2>
              {isLoadingNews ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-lg">Haberler yükleniyor...</div>
              ) : newsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {newsData.map((news, idx) => (
                    <a key={idx} href={news.link} target="_blank" rel="noreferrer" className="flex flex-col justify-between bg-slate-900 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition group">
                      <div>
                        <div className="text-sm text-blue-400 font-bold tracking-wider mb-3 uppercase">{news.publisher} • {new Date(news.timestamp * 1000).toLocaleDateString('tr-TR')}</div>
                        <h3 className="text-xl font-medium text-slate-200 group-hover:text-blue-400 transition leading-snug">{news.title}</h3>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-lg">Şu an için güncel haber bulunamadı.</div>
              )}
            </div>
          )}

          {activeModule === 'alerts' && (<div className="w-full flex items-center justify-center text-slate-400 text-xl">Alarmlar modülü yakında eklenecek...</div>)}
        </div>

        {/* YAPAY ZEKA GRAFİK ANALİZ MODALI */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-xl font-bold flex items-center gap-2 text-purple-400"><Sparkles className="w-6 h-6" /> {selectedAsset.symbol} Yapay Zeka Analizi</h3>
                <button onClick={() => setShowAnalysisModal(false)} className="text-slate-400 hover:text-white transition"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] text-slate-300 leading-relaxed whitespace-pre-wrap">
                {aiAnalysis ? aiAnalysis : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-70">
                    <Sparkles className="w-10 h-10 text-purple-400 animate-pulse mb-4" />
                    <p>Gemini AI grafiği inceliyor, lütfen bekleyin...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* YAPAY ZEKA CHATBOT PENCERESİ */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isChatOpen && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-hidden">
              <div className="bg-blue-600 p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 text-white font-bold"><Bot className="w-6 h-6" /> Yatırım Asistanı</div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start"><div className="px-4 py-2 rounded-2xl bg-slate-700 text-slate-400 text-sm rounded-bl-none animate-pulse">Yazıyor...</div></div>
                )}
              </div>
              
              <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Bana bir şey sorun..." className="flex-1 bg-slate-900 text-sm border border-slate-700 rounded-full px-4 py-2.5 focus:outline-none focus:border-blue-500 transition" />
                <button onClick={handleSendMessage} disabled={isChatLoading || !chatInput.trim()} className="bg-blue-600 p-2.5 rounded-full text-white hover:bg-blue-500 transition disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          )}
          
          {/* Chatbot Açma Butonu */}
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center">
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </button>
        </div>

      </main>
    </div>
  )
}

export default App  