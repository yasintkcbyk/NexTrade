import asyncio
from app.services.coingecko_service import get_crypto_data
from app.services.yfinance_service import get_stock_data

CRYPTO_ASSETS = [
    {"id": "bitcoin", "symbol": "BTC", "name": "Bitcoin", "type": "crypto", "high24h": 66000, "low24h": 64000, "change": 2.34},
    {"id": "ethereum", "symbol": "ETH", "name": "Ethereum", "type": "crypto", "high24h": 3500, "low24h": 3400, "change": -1.20},
    {"id": "solana", "symbol": "SOL", "name": "Solana", "type": "crypto", "high24h": 150, "low24h": 140, "change": 5.67},
    {"id": "ripple", "symbol": "XRP", "name": "XRP", "type": "crypto", "high24h": 0.51, "low24h": 0.48, "change": 0.80},
    {"id": "avalanche", "symbol": "AVAX", "name": "Avalanche", "type": "crypto", "high24h": 37.00, "low24h": 35.00, "change": -0.50},
    {"id": "dogecoin", "symbol": "DOGE", "name": "Dogecoin", "type": "crypto", "high24h": 0.13, "low24h": 0.10, "change": 12.40},
    {"id": "cardano", "symbol": "ADA", "name": "Cardano", "type": "crypto", "high24h": 0.48, "low24h": 0.44, "change": -2.10},
    {"id": "binancecoin", "symbol": "BNB", "name": "BNB", "type": "crypto", "high24h": 610.0, "low24h": 590.0, "change": 1.20},
    {"id": "polkadot", "symbol": "DOT", "name": "Polkadot", "type": "crypto", "high24h": 8.50, "low24h": 8.10, "change": -0.50},
    {"id": "chainlink", "symbol": "LINK", "name": "Chainlink", "type": "crypto", "high24h": 18.20, "low24h": 17.40, "change": 2.10},
    {"id": "matic-network", "symbol": "POL", "name": "Polygon (POL)", "type": "crypto", "high24h": 0.45, "low24h": 0.40, "change": -1.10},
    {"id": "tron", "symbol": "TRX", "name": "TRON", "type": "crypto", "high24h": 0.12, "low24h": 0.11, "change": 0.50},
]

STOCK_ASSETS = [
    {"id": "AAPL", "symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "high24h": 178, "low24h": 174, "change": 1.15},
    {"id": "TSLA", "symbol": "TSLA", "name": "Tesla", "type": "stock", "high24h": 200, "low24h": 190, "change": -3.45},
    {"id": "MSFT", "symbol": "MSFT", "name": "Microsoft", "type": "stock", "high24h": 425, "low24h": 415, "change": 0.85},
    {"id": "GOOGL", "symbol": "GOOGL", "name": "Alphabet (Google)", "type": "stock", "high24h": 180, "low24h": 175, "change": 0.25},
    {"id": "AMZN", "symbol": "AMZN", "name": "Amazon.com", "type": "stock", "high24h": 188, "low24h": 182, "change": -1.50},
    {"id": "NVDA", "symbol": "NVDA", "name": "NVIDIA", "type": "stock", "high24h": 930, "low24h": 900, "change": 3.50},
    {"id": "THYAO.IS", "symbol": "THYAO.IS", "name": "Türk Hava Yolları", "type": "stock", "high24h": 310, "low24h": 295, "change": 4.20},
    {"id": "META", "symbol": "META", "name": "Meta Platforms", "type": "stock", "high24h": 500, "low24h": 490, "change": 1.50},
    {"id": "NFLX", "symbol": "NFLX", "name": "Netflix", "type": "stock", "high24h": 610, "low24h": 600, "change": -0.80},
    {"id": "AMD", "symbol": "AMD", "name": "AMD", "type": "stock", "high24h": 170, "low24h": 160, "change": 2.50},
    {"id": "KCHOL.IS", "symbol": "KCHOL.IS", "name": "Koç Holding", "type": "stock", "high24h": 220, "low24h": 210, "change": 1.80},
    {"id": "ASELS.IS", "symbol": "ASELS.IS", "name": "Aselsan", "type": "stock", "high24h": 65, "low24h": 62, "change": -1.20},
    {"id": "TUPRS.IS", "symbol": "TUPRS.IS", "name": "Tüpraş", "type": "stock", "high24h": 180, "low24h": 175, "change": 0.90},
]


def get_market_assets():
    return [*CRYPTO_ASSETS, *STOCK_ASSETS]


def fetch_asset_price(asset: dict):
    asset_data = asset.copy()
    try:
        if asset_data["type"] == "crypto":
            data = get_crypto_data(asset_data["id"])
            if "price_usd" in data:
                asset_data["price"] = round(data["price_usd"], 2)
        else:
            data = get_stock_data(asset_data["symbol"])
            if "current_price" in data:
                asset_data["price"] = round(data["current_price"], 2)
    except Exception:
        pass
    return asset_data


async def get_current_market_data():
    tasks = [asyncio.to_thread(fetch_asset_price, asset) for asset in get_market_assets()]
    return await asyncio.gather(*tasks)
