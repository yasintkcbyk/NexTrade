from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.ai_service import get_chart_analysis, get_chatbot_response, summarize_news, analyze_portfolio

router = APIRouter(prefix="/api/ai", tags=["Yapay Zeka"])


class ChartAnalysisRequest(BaseModel):
    symbol: str
    current_price: float
    chart_data: list
    currency: str = "USD"
    currency_symbol: str = "$"


class ChatMessageRequest(BaseModel):
    message: str
    history: Optional[List[Dict]] = []
    context_news: Optional[str] = ""


class NewsRequest(BaseModel):
    title: str
    content: Optional[str] = ""


class PortfolioAnalysisRequest(BaseModel):
    portfolio: List[Dict]
    market_prices: Dict[str, float]
    currency: str = "USD"
    currency_symbol: str = "$"


@router.post("/analyze-chart")
def analyze_chart(data: ChartAnalysisRequest, current_user = Depends(get_current_user)):
    """Frontend'den gelen grafik verisini yapay zekaya yorumlatır."""
    analysis = get_chart_analysis(
        data.symbol,
        data.current_price,
        data.chart_data,
        data.currency,
        data.currency_symbol
    )
    return {"analysis": analysis}


@router.post("/chat")
def chat_with_bot(req: ChatMessageRequest, current_user = Depends(get_current_user)):
    """
    Multi-turn konuşma desteği ile yatırım asistanı chatbot.
    Konuşma geçmişi ve isteğe bağlı haber bağlamı kabul eder.
    """
    response = get_chatbot_response(req.message, req.history, req.context_news)
    return {"reply": response}


@router.post("/summarize-news")
def summarize_news_item(req: NewsRequest, current_user = Depends(get_current_user)):
    """Bir haberi yatırımcı perspektifinden özetler."""
    summary = summarize_news(req.title, req.content)
    return {"summary": summary}


@router.post("/analyze-portfolio")
def analyze_portfolio_route(req: PortfolioAnalysisRequest, current_user = Depends(get_current_user)):
    """Kullanıcının portföyünü AI ile analiz eder."""
    analysis = analyze_portfolio(
        req.portfolio,
        req.market_prices,
        req.currency,
        req.currency_symbol
    )
    return {"analysis": analysis}