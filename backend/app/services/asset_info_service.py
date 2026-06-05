import requests
import yfinance as yf
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# CoinGecko'da kullanılan ID'ler ile bizim internal ID'lerimizin haritası
COINGECKO_ID_MAP = {
    "bitcoin": "bitcoin",
    "ethereum": "ethereum",
    "solana": "solana",
    "ripple": "ripple",
    "cardano": "cardano",
    "avalanche-2": "avalanche",
    "dogecoin": "dogecoin",
    "binancecoin": "binancecoin",
    "polkadot": "polkadot",
    "chainlink": "chainlink",
}

def get_coin_detail(coin_id: str) -> dict:
    """
    CoinGecko API'sinden kripto para hakkında detaylı bilgi çeker.
    Kurucu, piyasa değeri, dolaşımdaki arz, ATH, açıklama, sosyal linkler vs.
    """
    try:
        session = requests.Session()
        session.verify = False
        session.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "false"
        }
        response = session.get(url, params=params, timeout=15)
        
        if response.status_code != 200:
            return _get_fallback_coin_info(coin_id)
        
        data = response.json()
        market_data = data.get("market_data", {})
        
        return {
            "id": coin_id,
            "name": data.get("name", ""),
            "symbol": data.get("symbol", "").upper(),
            "description": data.get("description", {}).get("en", "")[:500] if data.get("description") else "",
            "image": data.get("image", {}).get("large", ""),
            "genesis_date": data.get("genesis_date", ""),
            "hashing_algorithm": data.get("hashing_algorithm", ""),
            "homepage": data.get("links", {}).get("homepage", [""])[0] if data.get("links") else "",
            "whitepaper": data.get("links", {}).get("whitepaper", "") if data.get("links") else "",
            "github": (data.get("links", {}).get("repos_url", {}).get("github", [""])[0]) if data.get("links") else "",
            "reddit": data.get("links", {}).get("subreddit_url", "") if data.get("links") else "",
            "twitter": data.get("links", {}).get("twitter_screen_name", "") if data.get("links") else "",
            "market_cap_rank": data.get("market_cap_rank", 0),
            "market_cap_usd": market_data.get("market_cap", {}).get("usd", 0),
            "total_volume_usd": market_data.get("total_volume", {}).get("usd", 0),
            "circulating_supply": market_data.get("circulating_supply", 0),
            "total_supply": market_data.get("total_supply", 0),
            "max_supply": market_data.get("max_supply", 0),
            "ath_usd": market_data.get("ath", {}).get("usd", 0),
            "ath_date": market_data.get("ath_date", {}).get("usd", ""),
            "atl_usd": market_data.get("atl", {}).get("usd", 0),
            "price_change_7d": market_data.get("price_change_percentage_7d", 0),
            "price_change_30d": market_data.get("price_change_percentage_30d", 0),
            "categories": data.get("categories", [])[:3],
            "source": "coingecko"
        }
    except Exception as e:
        print(f"CoinGecko detay çekilemedi ({coin_id}): {e}")
        return _get_fallback_coin_info(coin_id)


def get_stock_detail(symbol: str) -> dict:
    """
    yfinance üzerinden hisse senedi hakkında detaylı bilgi çeker.
    Şirket açıklaması, sektör, çalışan sayısı, piyasa değeri, temettü vs.
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        if not info or "shortName" not in info:
            return _get_fallback_stock_info(symbol)
        
        return {
            "id": symbol,
            "name": info.get("longName") or info.get("shortName", symbol),
            "symbol": symbol.upper(),
            "description": (info.get("longBusinessSummary", ""))[:600] if info.get("longBusinessSummary") else "",
            "image": f"https://logo.clearbit.com/{info.get('website', '').replace('https://', '').replace('http://', '').split('/')[0]}",
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "country": info.get("country", ""),
            "city": info.get("city", ""),
            "employees": info.get("fullTimeEmployees", 0),
            "website": info.get("website", ""),
            "market_cap_usd": info.get("marketCap", 0),
            "enterprise_value": info.get("enterpriseValue", 0),
            "pe_ratio": info.get("trailingPE", 0),
            "forward_pe": info.get("forwardPE", 0),
            "pb_ratio": info.get("priceToBook", 0),
            "dividend_yield": round((info.get("dividendYield", 0) or 0) * 100, 2),
            "eps": info.get("trailingEps", 0),
            "revenue": info.get("totalRevenue", 0),
            "profit_margin": round((info.get("profitMargins", 0) or 0) * 100, 2),
            "52w_high": info.get("fiftyTwoWeekHigh", 0),
            "52w_low": info.get("fiftyTwoWeekLow", 0),
            "avg_volume": info.get("averageVolume", 0),
            "beta": info.get("beta", 0),
            "source": "yfinance"
        }
    except Exception as e:
        print(f"Hisse detay çekilemedi ({symbol}): {e}")
        return _get_fallback_stock_info(symbol)


def _get_fallback_coin_info(coin_id: str) -> dict:
    """CoinGecko erişilemezse statik verilerle dol"""
    STATIC_COIN_INFO = {
        "bitcoin": {
            "name": "Bitcoin", "symbol": "BTC",
            "description": "Bitcoin, 2008 yılında Satoshi Nakamoto tarafından icat edilen, merkezi olmayan ilk dijital para birimidir. Blockchain teknolojisini kullanan Bitcoin, aracısız para transferine olanak sağlar.",
            "genesis_date": "2009-01-03", "hashing_algorithm": "SHA-256",
            "market_cap_rank": 1, "max_supply": 21000000,
            "homepage": "https://bitcoin.org", "whitepaper": "https://bitcoin.org/bitcoin.pdf",
            "twitter": "Bitcoin", "categories": ["Cryptocurrency", "Layer 1", "Proof of Work"],
            "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
        },
        "ethereum": {
            "name": "Ethereum", "symbol": "ETH",
            "description": "Ethereum, Vitalik Buterin tarafından 2015'te geliştirilen, akıllı sözleşmeler ve merkeziyetsiz uygulamalar (DApps) için platform sağlayan blok zinciridir.",
            "genesis_date": "2015-07-30", "hashing_algorithm": "Ethash (now PoS)",
            "market_cap_rank": 2, "max_supply": None,
            "homepage": "https://ethereum.org", "whitepaper": "https://ethereum.org/en/whitepaper/",
            "twitter": "ethereum", "categories": ["Smart Contract Platform", "Layer 1", "DeFi"],
            "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
        },
        "solana": {
            "name": "Solana", "symbol": "SOL",
            "description": "Solana, Anatoly Yakovenko tarafından 2020'de kurulan, yüksek hız ve düşük işlem maliyetiyle öne çıkan akıllı sözleşme platformudur.",
            "genesis_date": "2020-03-16", "hashing_algorithm": "Proof of History (PoH)",
            "market_cap_rank": 5, "max_supply": None,
            "homepage": "https://solana.com", "whitepaper": "https://solana.com/solana-whitepaper.pdf",
            "twitter": "solana", "categories": ["Smart Contract Platform", "Layer 1", "DeFi"],
            "image": "https://assets.coingecko.com/coins/images/4128/large/solana.png"
        },
    }
    info = STATIC_COIN_INFO.get(coin_id, {"name": coin_id.capitalize(), "symbol": coin_id.upper(), "description": ""})
    info["id"] = coin_id
    info.setdefault("market_cap_rank", 0)
    info.setdefault("circulating_supply", 0)
    info.setdefault("total_supply", 0)
    info.setdefault("market_cap_usd", 0)
    info.setdefault("ath_usd", 0)
    info.setdefault("ath_date", "")
    info.setdefault("price_change_7d", 0)
    info.setdefault("price_change_30d", 0)
    info.setdefault("categories", [])
    info.setdefault("genesis_date", "")
    info.setdefault("hashing_algorithm", "")
    info.setdefault("homepage", "")
    info.setdefault("whitepaper", "")
    info.setdefault("twitter", "")
    info.setdefault("image", "")
    info["source"] = "static_fallback"
    return info


def _get_fallback_stock_info(symbol: str) -> dict:
    return {
        "id": symbol, "name": symbol, "symbol": symbol.upper(),
        "description": "Hisse senedi detayları şu an alınamıyor.", "sector": "", "industry": "",
        "country": "", "employees": 0, "website": "", "market_cap_usd": 0,
        "pe_ratio": 0, "dividend_yield": 0, "eps": 0, "52w_high": 0, "52w_low": 0,
        "image": "", "source": "static_fallback"
    }
