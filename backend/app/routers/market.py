from fastapi import APIRouter
from app.services.market_service import get_current_market_data

router = APIRouter(prefix="/api/markets", tags=["Markets"])

@router.get("/assets")
async def fetch_market_assets():
    return await get_current_market_data()
