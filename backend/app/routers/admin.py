from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import asyncio

from app.database import get_db
from app.models import User, PortfolioItem, Alert, Announcement
from app.routers.auth import get_current_user
from app.services.telegram_service import send_telegram_alert

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Bağımlılık: Sadece Adminlerin erişimi için
def get_admin_user(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "is_admin", False) is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yönetici yetkisi gereklidir."
        )
    return current_user


# Pydantic Schemas for Announcements
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    send_to_telegram: Optional[bool] = False

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


@router.get("/stats")
def get_system_stats(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Sistem istatistiklerini getirir."""
    total_users = db.query(User).count()
    total_portfolio_items = db.query(PortfolioItem).count()
    total_alerts = db.query(Alert).count()
    
    return {
        "total_users": total_users,
        "total_portfolio_items": total_portfolio_items,
        "total_alerts": total_alerts
    }

@router.get("/users")
def get_all_users(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Kayıtlı tüm kullanıcıları listeler."""
    users = db.query(User).all()
    # Basit bir response oluşturuyoruz
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "is_active": u.is_active,
            "is_admin": getattr(u, "is_admin", False),
            "created_at": u.created_at
        })
    return result

@router.put("/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Kullanıcı yetkisini veya durumunu günceller."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.is_admin is not None:
        user.is_admin = data.is_admin
        
    db.commit()
    return {"success": True, "message": "Kullanıcı güncellendi"}

@router.get("/announcements", response_model=List[AnnouncementResponse])
def get_all_announcements(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Tüm duyuruları (aktif ve inaktif) admin için getirir."""
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()

@router.post("/announcements", response_model=AnnouncementResponse)
def create_announcement(data: AnnouncementCreate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Sisteme yeni bir duyuru ekler."""
    new_announcement = Announcement(
        title=data.title,
        content=data.content,
        is_active=True
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    
    # Telegram Gönderimi
    if data.send_to_telegram:
        # Chat ID'si olan tüm aktif kullanıcıları bul
        users_with_tg = db.query(User).filter(User.telegram_chat_id != None, User.is_active == True).all()
        message = f"📢 *YENİ DUYURU: {data.title}*\n\n{data.content}\n\n_nextTrade Yönetimi_"
        
        # Asenkron bir görev olarak gönderimleri başlat ki API isteği gecikmesin
        def send_bulk_messages():
            for u in users_with_tg:
                if u.telegram_chat_id:
                    send_telegram_alert(message, chat_id=u.telegram_chat_id)
        
        asyncio.create_task(asyncio.to_thread(send_bulk_messages))
        
    return new_announcement

@router.delete("/announcements/{ann_id}")
def delete_announcement(ann_id: int, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Mevcut bir duyuruyu sistemden tamamen siler."""
    announcement = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
        
    db.delete(announcement)
    db.commit()
    return {"success": True, "message": "Duyuru silindi"}

@router.get("/public/announcements", response_model=List[AnnouncementResponse])
def get_active_announcements(db: Session = Depends(get_db)):
    """Aktif duyuruları getirir (Tüm kullanıcılara açıktır)."""
    return db.query(Announcement).filter(Announcement.is_active == True).order_by(Announcement.created_at.desc()).all()
