from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    target_price = Column(Float)
    condition = Column(String)  # "greater" (yükselirse) veya "less" (düşerse)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="alerts")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    telegram_chat_id = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    alerts = relationship("Alert", back_populates="owner")
    portfolio_items = relationship("PortfolioItem", back_populates="owner")


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)          # BTC, AAPL, vb.
    asset_name = Column(String)                   # Bitcoin, Apple Inc., vb.
    asset_type = Column(String)                   # "crypto" veya "stock"
    quantity = Column(Float)                      # Miktar (adet)
    buy_price = Column(Float)                     # Alış fiyatı (USD)
    notes = Column(String, nullable=True)         # Opsiyonel not
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="portfolio_items")