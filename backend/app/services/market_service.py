import asyncio
import time
import logging
import requests
import yfinance as yf
from app.utils.constants import COIN_MAP

logger = logging.getLogger(__name__)

MARKET_CACHE = {
    "data": None,
    "timestamp": 0
}

CRYPTO_ASSETS = [
    # Top Layer 1s & Majors
    {"id": "bitcoin", "symbol": "BTC", "name": "Bitcoin", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ethereum", "symbol": "ETH", "name": "Ethereum", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "solana", "symbol": "SOL", "name": "Solana", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ripple", "symbol": "XRP", "name": "XRP", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "avalanche-2", "symbol": "AVAX", "name": "Avalanche", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "cardano", "symbol": "ADA", "name": "Cardano", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "binancecoin", "symbol": "BNB", "name": "BNB", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "polkadot", "symbol": "DOT", "name": "Polkadot", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "tron", "symbol": "TRX", "name": "TRON", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "litecoin", "symbol": "LTC", "name": "Litecoin", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "near", "symbol": "NEAR", "name": "NEAR Protocol", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "aptos", "symbol": "APT", "name": "Aptos", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "sui", "symbol": "SUI", "name": "Sui", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "sei-network", "symbol": "SEI", "name": "Sei", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "cosmos", "symbol": "ATOM", "name": "Cosmos", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "stellar", "symbol": "XLM", "name": "Stellar", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "monero", "symbol": "XMR", "name": "Monero", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "bitcoin-cash", "symbol": "BCH", "name": "Bitcoin Cash", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "hedera-hashgraph", "symbol": "HBAR", "name": "Hedera", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "vechain", "symbol": "VET", "name": "VeChain", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    
    # Layer 2 & Scalability
    {"id": "matic-network", "symbol": "POL", "name": "Polygon (POL)", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "arbitrum", "symbol": "ARB", "name": "Arbitrum", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "optimism", "symbol": "OP", "name": "Optimism", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "immutable-x", "symbol": "IMX", "name": "Immutable X", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "mantle", "symbol": "MNT", "name": "Mantle", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    
    # DeFi & Infrastructure
    {"id": "chainlink", "symbol": "LINK", "name": "Chainlink", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "uniswap", "symbol": "UNI", "name": "Uniswap", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "the-graph", "symbol": "GRT", "name": "The Graph", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "aave", "symbol": "AAVE", "name": "Aave", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "maker", "symbol": "MKR", "name": "Maker", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "lido-dao", "symbol": "LDO", "name": "Lido DAO", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "injective-protocol", "symbol": "INJ", "name": "Injective", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "render-token", "symbol": "RNDR", "name": "Render", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "fetch-ai", "symbol": "FET", "name": "Fetch.ai", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "filecoin", "symbol": "FIL", "name": "Filecoin", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "internet-computer", "symbol": "ICP", "name": "Internet Computer", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "the-open-network", "symbol": "TON", "name": "Toncoin", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "celestia", "symbol": "TIA", "name": "Celestia", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    
    # Meme & GameFi
    {"id": "dogecoin", "symbol": "DOGE", "name": "Dogecoin", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "shiba-inu", "symbol": "SHIB", "name": "Shiba Inu", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "pepe", "symbol": "PEPE", "name": "Pepe", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "floki", "symbol": "FLOKI", "name": "Floki", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "bonk", "symbol": "BONK", "name": "Bonk", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "the-sandbox", "symbol": "SAND", "name": "The Sandbox", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "decentraland", "symbol": "MANA", "name": "Decentraland", "type": "crypto", "high24h": 0, "low24h": 0, "change": 0},
]

STOCK_ASSETS = [
    # US Tech
    {"id": "AAPL", "symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "TSLA", "symbol": "TSLA", "name": "Tesla", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "MSFT", "symbol": "MSFT", "name": "Microsoft", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "GOOGL", "symbol": "GOOGL", "name": "Alphabet (Google)", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "AMZN", "symbol": "AMZN", "name": "Amazon.com", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "NVDA", "symbol": "NVDA", "name": "NVIDIA", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "META", "symbol": "META", "name": "Meta Platforms", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "NFLX", "symbol": "NFLX", "name": "Netflix", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "AMD", "symbol": "AMD", "name": "AMD", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "INTC", "symbol": "INTC", "name": "Intel", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "CRM", "symbol": "CRM", "name": "Salesforce", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ADBE", "symbol": "ADBE", "name": "Adobe", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ORCL", "symbol": "ORCL", "name": "Oracle", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "CSCO", "symbol": "CSCO", "name": "Cisco", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "QCOM", "symbol": "QCOM", "name": "Qualcomm", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "IBM", "symbol": "IBM", "name": "IBM", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "AVGO", "symbol": "AVGO", "name": "Broadcom", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "TXN", "symbol": "TXN", "name": "Texas Instruments", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "MU", "symbol": "MU", "name": "Micron Tech", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PLTR", "symbol": "PLTR", "name": "Palantir", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "SNOW", "symbol": "SNOW", "name": "Snowflake", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ARM", "symbol": "ARM", "name": "Arm Holdings", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},

    # US Finance / Brands / Health
    {"id": "V", "symbol": "V", "name": "Visa Inc.", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "JPM", "symbol": "JPM", "name": "JPMorgan Chase", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "SBUX", "symbol": "SBUX", "name": "Starbucks", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "NKE", "symbol": "NKE", "name": "Nike", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "DIS", "symbol": "DIS", "name": "Walt Disney", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "MA", "symbol": "MA", "name": "Mastercard", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "BAC", "symbol": "BAC", "name": "Bank of America", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "WFC", "symbol": "WFC", "name": "Wells Fargo", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "C", "symbol": "C", "name": "Citigroup", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "GS", "symbol": "GS", "name": "Goldman Sachs", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "MS", "symbol": "MS", "name": "Morgan Stanley", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "KO", "symbol": "KO", "name": "Coca-Cola", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PEP", "symbol": "PEP", "name": "PepsiCo", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "WMT", "symbol": "WMT", "name": "Walmart", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PG", "symbol": "PG", "name": "Procter & Gamble", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "HD", "symbol": "HD", "name": "Home Depot", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "JNJ", "symbol": "JNJ", "name": "Johnson & Johnson", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PFE", "symbol": "PFE", "name": "Pfizer", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "UNH", "symbol": "UNH", "name": "UnitedHealth", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "MRK", "symbol": "MRK", "name": "Merck & Co", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "MCD", "symbol": "MCD", "name": "McDonald's", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},

    # BIST 30 (Turkey)
    {"id": "THYAO.IS", "symbol": "THYAO.IS", "name": "Türk Hava Yolları", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "KCHOL.IS", "symbol": "KCHOL.IS", "name": "Koç Holding", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ASELS.IS", "symbol": "ASELS.IS", "name": "Aselsan", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "TUPRS.IS", "symbol": "TUPRS.IS", "name": "Tüpraş", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "BIMAS.IS", "symbol": "BIMAS.IS", "name": "BİM", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "TCELL.IS", "symbol": "TCELL.IS", "name": "Turkcell", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "FROTO.IS", "symbol": "FROTO.IS", "name": "Ford Otosan", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "EREGL.IS", "symbol": "EREGL.IS", "name": "Erdemir", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "GARAN.IS", "symbol": "GARAN.IS", "name": "Garanti BBVA", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "AKBNK.IS", "symbol": "AKBNK.IS", "name": "Akbank", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "YKBNK.IS", "symbol": "YKBNK.IS", "name": "Yapı Kredi", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ISCTR.IS", "symbol": "ISCTR.IS", "name": "İş Bankası (C)", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "SISE.IS", "symbol": "SISE.IS", "name": "Şişecam", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "SAHOL.IS", "symbol": "SAHOL.IS", "name": "Sabancı Holding", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ENKAI.IS", "symbol": "ENKAI.IS", "name": "Enka İnşaat", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "KRDMD.IS", "symbol": "KRDMD.IS", "name": "Kardemir (D)", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PETKM.IS", "symbol": "PETKM.IS", "name": "Petkim", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "TAVHL.IS", "symbol": "TAVHL.IS", "name": "TAV Havalimanları", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "TTKOM.IS", "symbol": "TTKOM.IS", "name": "Türk Telekom", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "VAKBN.IS", "symbol": "VAKBN.IS", "name": "Vakıfbank", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "HALKB.IS", "symbol": "HALKB.IS", "name": "Halkbank", "type": "stock", "high24h": 0, "low24h": 0, "change": 0},
]

METAL_ASSETS = [
    # Precious Metals
    {"id": "GC=F", "symbol": "GC=F", "name": "Altın (Ons)", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "SI=F", "symbol": "SI=F", "name": "Gümüş (Ons)", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PL=F", "symbol": "PL=F", "name": "Platin (Ons)", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "PA=F", "symbol": "PA=F", "name": "Paladyum (Ons)", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    # Base Metals
    {"id": "HG=F", "symbol": "HG=F", "name": "Bakır (Libre)", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ALI=F", "symbol": "ALI=F", "name": "Alüminyum", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    # Energy
    {"id": "CL=F", "symbol": "CL=F", "name": "Ham Petrol (WTI)", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "BZ=F", "symbol": "BZ=F", "name": "Brent Petrol", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "NG=F", "symbol": "NG=F", "name": "Doğalgaz", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    # Agriculture
    {"id": "ZC=F", "symbol": "ZC=F", "name": "Mısır", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "ZW=F", "symbol": "ZW=F", "name": "Buğday", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "SB=F", "symbol": "SB=F", "name": "Şeker", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "CT=F", "symbol": "CT=F", "name": "Pamuk", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
    {"id": "KC=F", "symbol": "KC=F", "name": "Kahve", "type": "metal", "high24h": 0, "low24h": 0, "change": 0},
]

def get_market_assets():
    return [*CRYPTO_ASSETS, *STOCK_ASSETS, *METAL_ASSETS]

async def get_current_market_data():
    if MARKET_CACHE["data"] and time.time() - MARKET_CACHE["timestamp"] < 30:
        return MARKET_CACHE["data"]

    try_to_usd_rate = 1.0
    try:
        # BtcTurk üzerinden güncel USDT/TRY kurunu çek
        res = requests.get("https://api.btcturk.com/api/v2/ticker?pairSymbol=USDTTRY", timeout=3)
        if res.status_code == 200:
            data = res.json()
            if data.get("success") and data.get("data"):
                usdt_try = float(data["data"][0]["last"])
                if usdt_try > 0:
                    try_to_usd_rate = 1.0 / usdt_try
    except Exception as e:
        logger.error(f"Kur çekilirken hata: {e}")
        try_to_usd_rate = 1.0 / 32.5

    all_assets = get_market_assets()
    result_map = {a["id"]: a.copy() for a in all_assets}

    # BATCH CRYPTO FETCH (BtcTurk + Binance Tüm Çiftler)
    try:
        ticker_dict = {}
        binance_dict = {}
        
        # BtcTurk Fetch
        btc_res = requests.get("https://api.btcturk.com/api/v2/ticker", timeout=5)
        if btc_res.status_code == 200:
            btc_data = btc_res.json()
            if btc_data.get("success") and btc_data.get("data"):
                ticker_dict = {item["pair"]: item for item in btc_data["data"]}
                
        # Binance Fetch (Fallback)
        bin_res = requests.get("https://api.binance.com/api/v3/ticker/24hr", timeout=5)
        if bin_res.status_code == 200:
            bin_data = bin_res.json()
            binance_dict = {item["symbol"]: item for item in bin_data}
                
        for asset in CRYPTO_ASSETS:
            cid = asset["id"]
            symbol = COIN_MAP.get(cid.lower(), cid.upper())
            
            pair_usdt = f"{symbol}USDT"
            pair_try = f"{symbol}TRY"
            
            price = 0
            change = 0
            high = 0
            low = 0
            
            if pair_usdt in ticker_dict:
                t = ticker_dict[pair_usdt]
                price = float(t["last"])
                change = float(t.get("dailyPercent", 0))
                high = float(t.get("high", 0))
                low = float(t.get("low", 0))
            elif pair_try in ticker_dict:
                t = ticker_dict[pair_try]
                price = float(t["last"]) * try_to_usd_rate
                change = float(t.get("dailyPercent", 0))
                high = float(t.get("high", 0)) * try_to_usd_rate
                low = float(t.get("low", 0)) * try_to_usd_rate
            elif pair_usdt in binance_dict:
                t = binance_dict[pair_usdt]
                price = float(t["lastPrice"])
                change = float(t.get("priceChangePercent", 0))
                high = float(t.get("highPrice", 0))
                low = float(t.get("lowPrice", 0))
            
            if price > 0:
                result_map[cid]["price"] = round(price, 8 if price < 0.01 else 2)
                result_map[cid]["change"] = round(change, 2)
                result_map[cid]["high24h"] = round(high, 8 if high < 0.01 else 2)
                result_map[cid]["low24h"] = round(low, 8 if low < 0.01 else 2)
    except Exception as e:
        logger.error(f"Toplu Kripto hatası: {e}")

    # BATCH STOCK & METAL FETCH (yfinance)
    yf_symbols = [a["symbol"] for a in STOCK_ASSETS + METAL_ASSETS]
    try:
        def fetch_yf():
            import warnings
            warnings.simplefilter('ignore')
            return yf.download(yf_symbols, period="2d", progress=False)

        yf_data = await asyncio.to_thread(fetch_yf)
        
        if not yf_data.empty:
            for asset in STOCK_ASSETS + METAL_ASSETS:
                cid = asset["id"]
                sym = asset["symbol"]
                
                try:
                    # Yfinance MultiIndex column handling
                    close_col = ('Close', sym) if ('Close', sym) in yf_data.columns else 'Close'
                    
                    # Ensure we have data for this symbol
                    if close_col in yf_data.columns or sym in yf_data:
                        # Extract the specific series for the symbol if it's MultiIndex, else whole df
                        series = yf_data[close_col] if isinstance(close_col, tuple) else yf_data
                        
                        import math
                        def safe_float(val):
                            try:
                                f = float(val)
                                return 0.0 if math.isnan(f) else f
                            except:
                                return 0.0

                        # Boş (NaN) değerleri temizleyip sadece gerçek verileri alıyoruz
                        clean_series = series.dropna()

                        if len(clean_series) >= 2:
                            last_price = safe_float(clean_series.iloc[-1])
                            prev_price = safe_float(clean_series.iloc[-2])
                            
                            high_col = ('High', sym) if ('High', sym) in yf_data.columns else 'High'
                            low_col = ('Low', sym) if ('Low', sym) in yf_data.columns else 'Low'
                            
                            # Yüksek ve Düşük fiyatlar için de aynı temizliği yapıyoruz
                            high_series = yf_data[high_col].dropna() if high_col in yf_data.columns else clean_series
                            low_series = yf_data[low_col].dropna() if low_col in yf_data.columns else clean_series

                            high = safe_float(high_series.iloc[-1]) if len(high_series) > 0 else last_price
                            low = safe_float(low_series.iloc[-1]) if len(low_series) > 0 else last_price
                            
                            if sym.endswith(".IS") and try_to_usd_rate > 0:
                                last_price *= try_to_usd_rate
                                prev_price *= try_to_usd_rate
                                high *= try_to_usd_rate
                                low *= try_to_usd_rate
                            
                            change = ((last_price - prev_price) / prev_price) * 100 if prev_price > 0 else 0
                            
                            result_map[cid]["price"] = round(last_price, 2)
                            result_map[cid]["change"] = round(change, 2)
                            result_map[cid]["high24h"] = round(high, 2)
                            result_map[cid]["low24h"] = round(low, 2)
                        elif len(clean_series) == 1:
                            last_price = safe_float(clean_series.iloc[-1])
                            if sym.endswith(".IS") and try_to_usd_rate > 0:
                                last_price *= try_to_usd_rate
                            result_map[cid]["price"] = round(last_price, 2)
                except Exception as inner_e:
                    pass
    except Exception as e:
        logger.error(f"Toplu Hisse/Maden hatası: {e}")

    final_result = list(result_map.values())
    MARKET_CACHE["data"] = final_result
    MARKET_CACHE["timestamp"] = time.time()
    
    return final_result
