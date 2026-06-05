import requests
import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
DEFAULT_TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


def send_telegram_alert(message: str, chat_id: str = None) -> dict:
    """Telegram botu üzerinden kullanıcıya anlık bildirim (mesaj) gönderir."""
    target_chat_id = chat_id or DEFAULT_TELEGRAM_CHAT_ID
    
    if not TELEGRAM_BOT_TOKEN or not target_chat_id:
        return {"error": "Telegram yapılandırması eksik (Token veya Chat ID yok)."}

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return {"success": True, "message_id": response.json().get("result", {}).get("message_id")}
    except requests.RequestException as e:
        return {"error": str(e)}


def send_price_alert(symbol: str, condition: str, target_price: float, current_price: float, chat_id: str = None) -> dict:
    """
    Fiyat alarmı tetiklendiğinde zengin biçimli Telegram mesajı gönderir.
    """
    direction = "📈 YÜKSELDİ" if condition == "greater" else "📉 DÜŞTÜ"
    change_pct = abs((current_price - target_price) / target_price * 100)
    
    message = (
        f"🔔 *nextTrade Fiyat Alarmı*\n\n"
        f"*{symbol}* hedef fiyatına ulaştı!\n\n"
        f"━━━━━━━━━━━━━━━\n"
        f"📌 Durum: *{direction}*\n"
        f"🎯 Hedef Fiyat: *${target_price:,.4f}*\n"
        f"💰 Güncel Fiyat: *${current_price:,.4f}*\n"
        f"📊 Sapma: *{change_pct:.2f}%*\n"
        f"━━━━━━━━━━━━━━━\n"
        f"_nextTrade — AI Yatırım Asistanı_"
    )
    
    return send_telegram_alert(message, chat_id)


def check_telegram_connection() -> dict:
    """Telegram bot bağlantısını test eder."""
    if not TELEGRAM_BOT_TOKEN:
        return {"connected": False, "error": "Token eksik"}
    
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            bot_info = response.json().get("result", {})
            return {
                "connected": True,
                "bot_name": bot_info.get("first_name", ""),
                "bot_username": bot_info.get("username", "")
            }
        return {"connected": False, "error": "Bot doğrulaması başarısız"}
    except Exception as e:
        return {"connected": False, "error": str(e)}
