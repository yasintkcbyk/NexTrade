from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.telegram_service import send_telegram_alert
from app.database import SessionLocal
from app.models import Alert, User
from app.routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

# Veritabanı bağlantısı (Her istekte açılıp kapanır)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AlertCreate(BaseModel):
    symbol: str
    target_price: float
    condition: str

@router.get("/")
def get_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.user_id == current_user.id).all()

@router.post("/")
def create_alert(alert: AlertCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_alert = Alert(
        symbol=alert.symbol, 
        target_price=alert.target_price, 
        condition=alert.condition,
        user_id=current_user.id
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/{alert_id}")
def delete_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alarm bulunamadı veya yetkiniz yok")
    db.delete(db_alert)
    db.commit()
    return {"message": "Alarm silindi"}

@router.get("/test")
def test_alert():
    result = send_telegram_alert("🚀 *Yatırım Asistanı* botu başarıyla Telegram'a bağlandı!\n\nArtık fiyat alarmlarını buradan alacaksın.")
    return result
