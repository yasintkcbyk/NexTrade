from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.routers import stocks, crypto, alerts
from app.services.alert_checker import check_prices_periodically

app = FastAPI(title="Yatırım Asistanı API")

# Frontend (React) ile iletişim için CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme aşamasında herkese açık bırakıyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Yönlendirmelerini ekliyoruz
app.include_router(stocks.router)
app.include_router(crypto.router)
app.include_router(alerts.router)

@app.on_event("startup")
async def startup_event():
    # Sunucu başladığında arka planda fiyat takip döngüsünü başlat
    asyncio.create_task(check_prices_periodically())

@app.get("/")
def read_root():
    return {"message": "Yatırım Asistanı API Başarıyla Çalışıyor!"}