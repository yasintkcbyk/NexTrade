import sys
sys.path.insert(0, '.')
from app.database import engine, Base
import app.models
Base.metadata.create_all(bind=engine)
print("Tablolar olusturuldu/guncellendi")

import sqlite3
conn = sqlite3.connect('yatirim.db')
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Mevcut tablolar:", [t[0] for t in tables])
cols = conn.execute("PRAGMA table_info(portfolio_items)").fetchall()
print("portfolio_items sutunlari:", cols)
conn.close()
