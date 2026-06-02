from fastapi import APIRouter
from app.services.telegram_service import send_telegram_alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("/test")
async def test_alert():
    result = send_telegram_alert("🚀 *Yatırım Asistanı* botu başarıyla Telegram'a bağlandı!\n\nArtık fiyat alarmlarını buradan alacaksın.")
    return result
