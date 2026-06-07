from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.ai_service import get_chart_analysis, get_chatbot_response, summarize_news, analyze_portfolio

router = APIRouter(prefix="/api/ai", tags=["Yapay Zeka"])


class ChartAnalysisRequest(BaseModel):
    symbol: str
    current_price: float
    chart_data: list


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


@router.post("/analyze-chart")
def analyze_chart(data: ChartAnalysisRequest):
    """Frontend'den gelen grafik verisini yapay zekaya yorumlatır."""
    analysis = get_chart_analysis(data.symbol, data.current_price, data.chart_data)
    return {"analysis": analysis}


@router.post("/chat")
def chat_with_bot(req: ChatMessageRequest):
    """
    Multi-turn konuşma desteği ile yatırım asistanı chatbot.
    Konuşma geçmişi ve isteğe bağlı haber bağlamı kabul eder.
    """
    response = get_chatbot_response(req.message, req.history, req.context_news)
    return {"reply": response}


@router.post("/summarize-news")
def summarize_news_item(req: NewsRequest):
    """Bir haberi yatırımcı perspektifinden özetler."""
    summary = summarize_news(req.title, req.content)
    return {"summary": summary}


@router.post("/analyze-portfolio")
def analyze_portfolio_route(req: PortfolioAnalysisRequest):
    """Kullanıcının portföyünü AI ile analiz eder."""
    analysis = analyze_portfolio(req.portfolio, req.market_prices)
    return {"analysis": analysis}