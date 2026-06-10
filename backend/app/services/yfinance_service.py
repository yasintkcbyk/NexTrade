import logging
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
from fastapi import HTTPException
from app.services.analysis_service import get_sma_crossover_signals

logger = logging.getLogger(__name__)

def get_stock_data(symbol: str):
    """
    Yahoo Finance üzerinden hisse verisini çeker.
    Örnek: AAPL (Apple), THYAO.IS (Türk Hava Yolları)
    """
    try:
        ticker = yf.Ticker(symbol)
        # Hafta sonu veya tatil günlerinde 1d boş dönebilir, bu yüzden garanti olması için 5 günlük çekip son veriyi alıyoruz
        hist = ticker.history(period="5d")
        
        if hist.empty:
            raise ValueError("yfinance boş veri döndürdü.")
            
        current_price = hist['Close'].iloc[-1]
        return {
            "symbol": symbol.upper(),
            "current_price": round(current_price, 2),
            "currency": ticker.info.get("currency", "USD")
        }
    except Exception as e:
        logger.error(f"Hisse verisi çekilemedi ({symbol}): {e}")
        raise HTTPException(status_code=404, detail=f"Hisse verisi bulunamadı ({symbol}).")

def get_stock_history(symbol: str, interval: str = '1d'):
    # Kullanıcı dostu zaman aralıklarını yfinance parametrelerine çevir
    interval_map = {
        "1D": {"period": "5d", "interval": "15m"},
        "1W": {"period": "7d", "interval": "1h"},
        "1M": {"period": "1mo", "interval": "1d"},
        "3M": {"period": "3mo", "interval": "1d"},
        "1Y": {"period": "1y", "interval": "1d"},
        "4H": {"period": "1mo", "interval": "1h"},
        "MAX": {"period": "max", "interval": "1wk"},
    }
    params = interval_map.get(interval, {"period": "1mo", "interval": "1d"})

    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=params["period"], interval=params["interval"])
        if hist.empty:
            raise ValueError("yfinance boş veri döndürdü.")
            
        chart_data = []
        for date, row in hist.iterrows():
            chart_data.append({
                "time": int(date.timestamp()),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2)
            })
        return chart_data
    except Exception as e:
        logger.error(f"Hisse geçmişi çekilemedi ({symbol}): {e}")
        return []

def get_stock_signals(symbol: str, interval: str = '1D'):
    try:
        # Tıpkı grafikte olduğu gibi, yfinance üzerinden doğru zaman dilimi verisini al
        chart_data = get_stock_history(symbol, interval)
        if not chart_data:
            return []
            
        import pandas as pd
        df = pd.DataFrame(chart_data)
        df.rename(columns={'close': 'Close', 'open': 'Open', 'high': 'High', 'low': 'Low'}, inplace=True)
        
        # 'time' unix timestamp'ten datetime objesine
        df['time'] = pd.to_datetime(df['time'], unit='s')
        df.set_index('time', inplace=True)
        
        return get_sma_crossover_signals(df)
    except Exception as e:
        logger.error(f"Error fetching signals for {symbol}: {e}")
        return []

def get_stock_news(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.news
        formatted_news = []
        for n in news[:15]:  # Son 15 haberi al
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
        logger.error(f"Error fetching news for {symbol}: {e}")
        return []

def get_general_news():
    """Tüm piyasayı kapsayan genel bülten haberlerini çeker (S&P 500 bazlı)"""
    try:
        ticker = yf.Ticker("^GSPC")
        news = ticker.news
        formatted_news = []
        for n in news[:20]:  # Son 20 genel haberi al
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
        logger.error(f"Error fetching general news: {e}")
        return []