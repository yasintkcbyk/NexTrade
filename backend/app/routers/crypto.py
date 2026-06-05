from fastapi import APIRouter, HTTPException
from app.services.coingecko_service import get_crypto_data, get_crypto_history, get_crypto_signals, get_crypto_news

router = APIRouter(prefix="/api/crypto", tags=["Crypto"])

@router.get("/{coin_id}/history")
def fetch_crypto_history(coin_id: str, interval: str = '1D'):
    data = get_crypto_history(coin_id, interval)
    if isinstance(data, dict) and "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

@router.get("/{coin_id}/signals")
def fetch_crypto_signals(coin_id: str):
    return get_crypto_signals(coin_id)

@router.get("/{coin_id}/news")
def fetch_crypto_news(coin_id: str):
    return get_crypto_news(coin_id)

@router.get("/{coin_id}")
def fetch_crypto(coin_id: str):
    data = get_crypto_data(coin_id)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data