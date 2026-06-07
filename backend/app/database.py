import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Render'da DATABASE_URL env variable PostgreSQL bağlantısını sağlar.
# Lokal geliştirmede yoksa SQLite'a fallback yapar.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./yatirim.db")

# Render'ın verdiği PostgreSQL URL'i "postgres://" ile başlıyor olabilir;
# SQLAlchemy 1.4+ sadece "postgresql://" kabul eder.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite için özel connect_args gerekli, PostgreSQL için değil
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()