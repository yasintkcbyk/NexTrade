import logging
from fastapi import FastAPI

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.routers import stocks, crypto, alerts, ai, market, auth, asset_info, portfolio, admin

from app.services.alert_checker import check_prices_periodically
from app.database import engine, Base, SessionLocal
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
    "http://localhost",
    "capacitor://localhost",
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
app.include_router(admin.router)



@app.on_event("startup")
async def startup_event():
    """Sunucu başladığında arka planda fiyat takip döngüsünü başlat."""
    
    # Varsayılan admin hesabını kontrol et ve oluştur (Canlı sunucu migration dahil)
    db = SessionLocal()
    from app.models import User
    from app.utils.auth_utils import get_password_hash
    import sqlalchemy

    # Canlı sunucuda tablo önceden varsa 'is_admin' kolonu eksik olabilir. Onu yakalayıp ekliyoruz.
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
    except Exception as e:
        # Postgres (ProgrammingError) veya SQLite (OperationalError) fırlatabilir.
        err_str = str(e).lower()
        if "no such column" in err_str or "is_admin" in err_str or "does not exist" in err_str:
            # Veritabanını rollback yap ve tabloyu alter et
            db.rollback()
            try:
                db.execute(sqlalchemy.text('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE'))
                db.commit()
                admin_user = db.query(User).filter(User.username == "admin").first()
            except Exception as inner_e:
                logging.error(f"Migration failed: {inner_e}")
                db.rollback()
                admin_user = None
        else:
            db.rollback()
            admin_user = None

    if not admin_user:
        hashed_pw = get_password_hash("admin")
        new_admin = User(
            username="admin",
            email="admin@nexttrade.com",
            hashed_password=hashed_pw,
            full_name="System Administrator",
            is_admin=True
        )
        try:
            db.add(new_admin)
            db.commit()
        except Exception as e:
            db.rollback()
            logging.error(f"Failed to create admin: {e}")
    else:
        # Eğer admin hesabı varsa ama is_admin False olarak kaldıysa düzelt (Örn. migration sonrası)
        if not getattr(admin_user, "is_admin", False):
            admin_user.is_admin = True
            db.commit()
            
    db.close()

    # Arka plan işlemlerini migration bittikten SONRA başlat
    asyncio.create_task(check_prices_periodically())


@app.get("/")
def read_root():
    return {
        "message": "nextTrade AI Yatırım Asistanı API v2.0 — Başarıyla Çalışıyor!",
        "docs": "/docs",
        "status": "operational"
    }