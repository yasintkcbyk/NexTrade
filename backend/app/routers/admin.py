from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, PortfolioItem, Alert, Announcement
from app.routers.auth import get_current_user

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

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


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
    return new_announcement

@router.get("/public/announcements", response_model=List[AnnouncementResponse])
def get_active_announcements(db: Session = Depends(get_db)):
    """Aktif duyuruları getirir (Tüm kullanıcılara açıktır)."""
    return db.query(Announcement).filter(Announcement.is_active == True).order_by(Announcement.created_at.desc()).all()
