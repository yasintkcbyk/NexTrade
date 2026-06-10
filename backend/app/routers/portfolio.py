from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from app.database import get_db
from app.models import PortfolioItem, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])


# ─── Pydantic Schemas ───────────────────────────────────────────

class AssetType(str, Enum):
    crypto = "crypto"
    stock = "stock"
    metal = "metal"

class PortfolioItemCreate(BaseModel):
    symbol: str
    asset_name: str
    asset_type: AssetType
    quantity: float = Field(gt=0)
    buy_price: float = Field(gt=0)
    notes: Optional[str] = None


class PortfolioItemUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0)
    buy_price: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None


class PortfolioItemOut(BaseModel):
    id: int
    symbol: str
    asset_name: str
    asset_type: str
    quantity: float
    buy_price: float
    notes: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Endpoints ──────────────────────────────────────────────────

@router.get("/", response_model=List[PortfolioItemOut])
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının tüm portföy varlıklarını döndürür."""
    items = db.query(PortfolioItem).filter(PortfolioItem.user_id == current_user.id).all()
    return items


@router.post("/", response_model=PortfolioItemOut, status_code=201)
def add_portfolio_item(
    item: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Portföye yeni bir varlık ekler."""
    db_item = PortfolioItem(
        user_id=current_user.id,
        symbol=item.symbol.upper(),
        asset_name=item.asset_name,
        asset_type=item.asset_type,
        quantity=item.quantity,
        buy_price=item.buy_price,
        notes=item.notes,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{item_id}", response_model=PortfolioItemOut)
def update_portfolio_item(
    item_id: int,
    updates: PortfolioItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Var olan bir portföy kaydını günceller."""
    db_item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.user_id == current_user.id
    ).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Varlık bulunamadı")
    if updates.quantity is not None:
        db_item.quantity = updates.quantity
    if updates.buy_price is not None:
        db_item.buy_price = updates.buy_price
    if updates.notes is not None:
        db_item.notes = updates.notes
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}", status_code=204)
def delete_portfolio_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Portföyden bir varlığı siler."""
    db_item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.user_id == current_user.id
    ).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Varlık bulunamadı")
    db.delete(db_item)
    db.commit()
    return None
