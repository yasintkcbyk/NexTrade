from fastapi import APIRouter, HTTPException
from app.services.yfinance_service import get_stock_data, get_stock_history, get_stock_signals, get_stock_news, get_general_news

router = APIRouter(prefix="/api/stocks", tags=["Stocks"])

@router.get("/market/news")
async def fetch_general_news():
    return get_general_news()

@router.get("/{symbol}/history")
async def fetch_stock_history(symbol: str, interval: str = '1D'):
    data = get_stock_history(symbol, interval)
    if isinstance(data, dict) and "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

@router.get("/{symbol}/signals")
async def fetch_stock_signals(symbol: str):
    data = get_stock_signals(symbol)
    return data

@router.get("/{symbol}/news")
async def fetch_stock_news(symbol: str):
    return get_stock_news(symbol)

@router.get("/{symbol}")
async def fetch_stock(symbol: str):
    data = get_stock_data(symbol)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data