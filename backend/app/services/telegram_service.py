import requests
import os
from dotenv import load_dotenv

# .env dosyasını yükle (Lokal geliştirme ortamı için)
load_dotenv()

# BotFather ve UserInfoBot'tan aldığın bilgileri BURAYA YAPIŞTIR
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

def send_telegram_alert(message: str):
    """
    Telegram botu üzerinden kullanıcıya anlık bildirim (mesaj) gönderir.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return {"error": "Lütfen telegram_service.py dosyasına Bot Token bilginizi girin!"}
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"  # Kalın/İtalik yazılar için
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        return {"error": str(e)}
