from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import get_chart_analysis, get_chatbot_response

router = APIRouter(prefix="/api/ai", tags=["Yapay Zeka"])

class ChartAnalysisRequest(BaseModel):
    symbol: str
    current_price: float
    chart_data: list

class ChatMessageRequest(BaseModel):
    message: str

@router.post("/analyze-chart")
def analyze_chart(data: ChartAnalysisRequest):
    # Frontend'den gelen grafik verisini yapay zekaya yorumlatır
    analysis = get_chart_analysis(data.symbol, data.current_price, data.chart_data)
    return {"analysis": analysis}

@router.post("/chat")
def chat_with_bot(req: ChatMessageRequest):
    response = get_chatbot_response(req.message)
    return {"reply": response}