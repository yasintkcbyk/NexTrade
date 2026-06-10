import asyncio
from app.services.coingecko_service import get_crypto_data
from app.services.yfinance_service import get_stock_data
from app.services.telegram_service import send_telegram_alert
from app.database import SessionLocal
from app.models import Alert
import logging
from sqlalchemy.orm import joinedload
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
    logger = logging.getLogger(__name__)
    while True:
        db = SessionLocal()
        try:
            alerts = db.query(Alert).options(joinedload(Alert.owner)).filter(Alert.is_triggered == False).all()
            
            if not alerts:
                db.close()
                await asyncio.sleep(60)
                continue
                
            unique_symbols = list({alert.symbol for alert in alerts})
            
            tasks = [asyncio.to_thread(fetch_price_sync, symbol) for symbol in unique_symbols]
            results = await asyncio.gather(*tasks)
            prices = dict(zip(unique_symbols, results))

            for alert in alerts:
                current_price = prices.get(alert.symbol)
                chat_id = alert.owner.telegram_chat_id if alert.owner else None
                
                if current_price is not None and chat_id:
                    if alert.condition == "greater" and current_price >= alert.target_price:
                        await asyncio.to_thread(send_telegram_alert, f"🚨 *FİYAT ALARMI*\n\n{alert.symbol.upper()} hedefe ulaştı!\nGüncel Fiyat: *${current_price}*", chat_id)
                        alert.is_triggered = True
                        db.commit()
                        
                    elif alert.condition == "less" and current_price <= alert.target_price:
                        await asyncio.to_thread(send_telegram_alert, f"🚨 *FİYAT ALARMI*\n\n{alert.symbol.upper()} düştü!\nGüncel Fiyat: *${current_price}*", chat_id)
                        alert.is_triggered = True
                        db.commit()
        except Exception as e:
            logger.error(f"Alarm kontrolü sırasında hata oluştu: {e}")
        finally:
            db.close()

        await asyncio.sleep(60)