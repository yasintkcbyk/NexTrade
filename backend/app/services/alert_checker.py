import asyncio
from app.services.coingecko_service import get_crypto_data
from app.services.yfinance_service import get_stock_data
from app.services.telegram_service import send_telegram_alert
from app.database import SessionLocal
from app.models import Alert
from app.services.market_service import CRYPTO_ASSETS

def fetch_price_sync(symbol: str):
    """Fiyatı senkron olarak çeker, ayrı thread'de çalıştırılmak üzere ayrıldı."""
    crypto_symbols = [c["symbol"].upper() for c in CRYPTO_ASSETS]
    if symbol.upper() in crypto_symbols:
        data = get_crypto_data(symbol)
        return data.get("price_usd") if "error" not in data else None
    else:
        data = get_stock_data(symbol)
        return data.get("current_price") if data else None

async def check_prices_periodically():
    """
    Arka planda sürekli çalışarak fiyatları kontrol eder.
    """
    while True:
        db = SessionLocal()
        try:
            alerts = db.query(Alert).all()
            
            # Aynı sembol için birden fazla alarm varsa, fiyatı internetten sadece 1 kez çek (Hız Optimizasyonu)
            unique_symbols = {alert.symbol for alert in alerts}
            prices = {}
            
            for symbol in unique_symbols:
                # Ağ isteklerini ana döngüyü kilitlemeden paralel thread'lerde yap
                price = await asyncio.to_thread(fetch_price_sync, symbol)
                if price is not None:
                    prices[symbol] = price

            for alert in alerts:
                current_price = prices.get(alert.symbol)
                if current_price is not None:
                    if alert.condition == "greater" and current_price >= alert.target_price:
                        await asyncio.to_thread(send_telegram_alert, f"🚨 *FİYAT ALARMI*\n\n{alert.symbol.upper()} hedefe ulaştı!\nGüncel Fiyat: *${current_price}*")
                        db.delete(alert) # Alarm bir kere çalınca veritabanından silinir
                        db.commit()
                        
                    elif alert.condition == "less" and current_price <= alert.target_price:
                        await asyncio.to_thread(send_telegram_alert, f"🚨 *FİYAT ALARMI*\n\n{alert.symbol.upper()} düştü!\nGüncel Fiyat: *${current_price}*")
                        db.delete(alert)
                        db.commit()
        except Exception as e:
            print(f"Alarm kontrolü sırasında hata oluştu: {e}")
        finally:
            db.close()

        # Her 60 saniyede bir fiyatları kontrol et (Test için istersen 10 saniye yapabilirsin)
        await asyncio.sleep(60)