import asyncio
from app.services.coingecko_service import get_crypto_data
from app.services.telegram_service import send_telegram_alert

# Şimdilik hafızada tuttuğumuz alarmlar (İleride React ekranından eklenecek ve Veritabanına kaydedilecek)
ACTIVE_ALERTS = [
    {"symbol": "bitcoin", "target": 70000, "condition": "greater"}, # Eğer 70.000 üstündeyse uyar
]

async def check_prices_periodically():
    """
    Arka planda sürekli çalışarak fiyatları kontrol eder.
    """
    while True:
        # Silme işlemi de yapacağımız için listenin kopyası ([:]) üzerinden dönüyoruz
        for alert in ACTIVE_ALERTS[:]: 
            data = get_crypto_data(alert["symbol"])
            
            if "error" not in data:
                current_price = data["price_usd"]
                
                if alert["condition"] == "greater" and current_price >= alert["target"]:
                    send_telegram_alert(f"🚨 *FİYAT ALARMI*\n\n{alert['symbol'].upper()} hedefe ulaştı!\nGüncel Fiyat: *${current_price}*")
                    ACTIVE_ALERTS.remove(alert) # Alarm bir kere çalınca listeden çıkar
                    
                elif alert["condition"] == "less" and current_price <= alert["target"]:
                    send_telegram_alert(f"🚨 *FİYAT ALARMI*\n\n{alert['symbol'].upper()} düştü!\nGüncel Fiyat: *${current_price}*")
                    ACTIVE_ALERTS.remove(alert)

        # Her 60 saniyede bir fiyatları kontrol et (Test için istersen 10 saniye yapabilirsin)
        await asyncio.sleep(60)