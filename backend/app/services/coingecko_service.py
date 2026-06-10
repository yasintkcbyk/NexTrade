import logging
import requests
from datetime import datetime, timedelta
import yfinance as yf
from fastapi import HTTPException
from app.services.analysis_service import get_sma_crossover_signals
from app.utils.constants import COIN_MAP

logger = logging.getLogger(__name__)
def get_crypto_data(coin_id: str):
    """
    Güvenli İnternet filtresine takılmamak için Türkiye'nin yasal ve resmi
    borsası BtcTurk API'sini kullanır.
    Örnek coin_id: bitcoin, btc, ethereum, eth
    """
    symbol = COIN_MAP.get(coin_id.lower(), coin_id.upper())
    
    session = requests.Session()
    session.trust_env = False
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    try:
        # BtcTurk üzerinden USDT (Dolar) fiyatını çekiyoruz
        url_usd = f"https://api.btcturk.com/api/v2/ticker?pairSymbol={symbol}USDT"
        res_usd = session.get(url_usd)
        if res_usd.status_code == 200:
            data_usd = res_usd.json()
            
            if data_usd.get("success") and data_usd.get("data"):
                price_usd = float(data_usd["data"][0]["last"])
                
                price_try = 0
                try:
                    # BtcTurk üzerinden doğrudan TRY (Türk Lirası) fiyatını çekiyoruz
                    url_try = f"https://api.btcturk.com/api/v2/ticker?pairSymbol={symbol}TRY"
                    res_try = session.get(url_try)
                    if res_try.status_code == 200:
                        data_try = res_try.json()
                        if data_try.get("success") and data_try.get("data"):
                            price_try = float(data_try["data"][0]["last"])
                except Exception:
                    pass
                    
                return {
                    "symbol": symbol,
                    "price_usd": round(price_usd, 2),
                    "price_try": round(price_try, 2)
                }
    except Exception as e:
        logger.error(f"Error fetching data from BtcTurk for {symbol}: {e}")

    # BtcTurk'te desteklenmeyen coinler (BNB vb.) için yfinance Fallback (Yedek) Planı
    try:
        ticker = yf.Ticker(f"{symbol}-USD")
        hist = ticker.history(period="1d")
        if not hist.empty:
            price_usd = float(hist['Close'].iloc[-1])
            return {
                "symbol": symbol,
                "price_usd": round(price_usd, 2),
                "price_try": 0
            }
    except Exception as e:
        logger.error(f"Error fetching data from yfinance for {symbol}: {e}")

    raise HTTPException(status_code=404, detail=f"Kripto para bulunamadı ({symbol}).")

def get_crypto_history(coin_id: str, interval: str = '1D'):
    """
    Binance API üzerinden geçmiş mum (kline) verilerini çeker.
    yfinance'in aksine kripto paralar için 7/24 kesintisiz, çok daha hızlı ve 
    gerçek 4 Saatlik (4h) gibi teknik analiz mumlarını doğrudan sağlar.
    """
    # Frontend'den gelen buton değerlerini Binance mum (interval) formatına çeviriyoruz.
    interval_map = {
        "1D": {"interval": "15m", "limit": 96},       # Son 1 Gün (15 dakikalık mumlar)
        "1W": {"interval": "1h", "limit": 168},       # Son 1 Hafta (1 saatlik mumlar)
        "1M": {"interval": "4h", "limit": 180},       # Son 1 Ay (4 saatlik mumlar)
        "3M": {"interval": "12h", "limit": 180},      # Son 3 Ay (12 saatlik mumlar)
        "1Y": {"interval": "1d", "limit": 365},       # Son 1 Yıl (Günlük mumlar)
        "4H": {"interval": "4h", "limit": 300},       # GERÇEK 4 Saatlik Mumlar (Geriye dönük 300 mum)
        "MAX": {"interval": "1w", "limit": 1000},     # Haftalık mumlar (Maksimum geçmiş)
    }
    params = interval_map.get(interval, {"interval": "1d", "limit": 300})

    # Coin ID'yi Binance formatına (örn: BTCUSDT) çeviriyoruz
    base_symbol = COIN_MAP.get(coin_id.lower(), coin_id.upper())
    symbol = f"{base_symbol}USDT"
    
    try:
        url = "https://api.binance.com/api/v3/klines"
        response = requests.get(url, params={
            "symbol": symbol,
            "interval": params["interval"],
            "limit": params["limit"]
        }, timeout=10)
        
        if response.status_code != 200:
            raise ValueError(f"Binance API hatası: {response.text}")
            
        klines = response.json()
        if not klines:
            raise ValueError(f"Binance boş veri döndürdü ({symbol}).")
            
        chart_data = []
        for k in klines:
            # Binance klines format:
            # [0] Open time, [1] Open, [2] High, [3] Low, [4] Close, [5] Volume
            chart_data.append({
                "time": int(k[0] / 1000), # Saniyeye çeviriyoruz
                "open": float(k[1]),
                "high": float(k[2]),
                "low": float(k[3]),
                "close": float(k[4]),
                "volume": float(k[5])
            })
        return chart_data
    except Exception as e:
        logger.error(f"Binance geçmişi çekilemedi ({coin_id}): {e}")
        return []

def get_crypto_signals(coin_id: str, interval: str = '1D'):
    try:
        # Tıpkı grafikte olduğu gibi, Binance üzerinden doğru zaman dilimi verisini al
        chart_data = get_crypto_history(coin_id, interval)
        if not chart_data:
            return []
            
        import pandas as pd
        df = pd.DataFrame(chart_data)
        # Sütun isimlerini yfinance formatına (veya analysis_service'in beklediği formata) uyduralım
        # analysis_service 'Close' veya direkt df kullanıyor mu? Sütunlar: open, high, low, close
        # pandas_ta sütun isimlerinin büyük harfle olmasını sevmiyor olabilir ama varsayılan df'i kabul eder.
        df.rename(columns={'close': 'Close', 'open': 'Open', 'high': 'High', 'low': 'Low'}, inplace=True)
        
        # 'time' unix timestamp'ten datetime objesine
        df['time'] = pd.to_datetime(df['time'], unit='s')
        df.set_index('time', inplace=True)
        
        return get_sma_crossover_signals(df)
    except Exception as e:
        logger.error(f"Error fetching signals for {coin_id}: {e}")
        return []

def get_crypto_news(coin_id: str):
    base_symbol = COIN_MAP.get(coin_id.lower(), coin_id.upper())
    symbol = f"{base_symbol}-USD"
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.news
        formatted_news = []
        for n in news[:15]:
            content = n.get("content", {}) if isinstance(n.get("content"), dict) else {}
            
            title = n.get("title") or content.get("title", "")
            publisher = n.get("publisher") or content.get("provider", {}).get("displayName", "")
            link = n.get("link") or content.get("canonicalUrl", {}).get("url", "")
            timestamp = n.get("providerPublishTime") or content.get("pubDate", 0)
            formatted_news.append({
                "title": title,
                "publisher": publisher,
                "link": link,
                "timestamp": timestamp
            })
        return formatted_news
    except Exception as e:
        logger.error(f"Error fetching news for {coin_id}: {e}")
        return []