from fastapi import APIRouter, HTTPException
from app.services.asset_info_service import get_coin_detail, get_stock_detail

router = APIRouter(prefix="/api/asset", tags=["Varlık Detayı"])

@router.get("/crypto/{coin_id}/info")
def get_crypto_info(coin_id: str):
    """
    Kripto para hakkında detaylı bilgi: kurucu, piyasa sıralaması, arz, ATH, whitepaper vs.
    Örnek: /api/asset/crypto/bitcoin/info
    """
    return get_coin_detail(coin_id)

@router.get("/stock/{symbol}/info")
def get_stock_info(symbol: str):
    """
    Hisse senedi hakkında detaylı bilgi: şirket açıklaması, sektör, P/E, temettü vs.
    Örnek: /api/asset/stock/AAPL/info
    """
    return get_stock_detail(symbol)
