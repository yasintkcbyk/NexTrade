import logging
from fastapi import FastAPI

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.routers import stocks, crypto, alerts, ai, market, auth, asset_info, portfolio

from app.services.alert_checker import check_prices_periodically
from app.database import engine, Base
import app.models

# Veritabanı tablolarını fiziksel olarak (sqlite dosyasına) oluşturur
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="nextTrade — AI Yatırım Asistanı API",
    description="Kripto ve hisse senedi piyasaları için profesyonel yapay zeka destekli yatırım asistanı.",
    version="2.0.0"
)

# İzin verilen frontend adresleri
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nex-trade-gamma.vercel.app",
]

# Frontend (React) ile iletişim için CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Yönlendirmeleri
app.include_router(auth.router)
app.include_router(stocks.router)
app.include_router(crypto.router)
app.include_router(alerts.router)
app.include_router(ai.router)
app.include_router(market.router)
app.include_router(asset_info.router)
app.include_router(portfolio.router)



@app.on_event("startup")
async def startup_event():
    """Sunucu başladığında arka planda fiyat takip döngüsünü başlat."""
    asyncio.create_task(check_prices_periodically())


@app.get("/")
def read_root():
    return {
        "message": "nextTrade AI Yatırım Asistanı API v2.0 — Başarıyla Çalışıyor!",
        "docs": "/docs",
        "status": "operational"
    }