import os
from dotenv import load_dotenv
from groq import Groq
from typing import List, Dict

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_PROMPT = """Sen nextTrade platformunun profesyonel yapay zeka yatırım asistanısın.
Görevin: Kullanıcılara kripto para ve hisse senetleri hakkında net, bilgilendirici ve profesyonel analizler sunmak.

Kuralların:
- Her zaman Türkçe cevap ver.
- Teknik terimleri açıkla ama sade dil kullan.
- Analizlerinde RSI, MACD, destek/direnç, trend gibi teknik analiz kavramlarını kullan.
- Spekülatif iddialarda bulunma, "bu bir yatırım tavsiyesi değildir" uyarısını uygun yerlerde ekle.
- Kısa ve net ol — kullanıcı vakit kaybetmek istemiyor.
- Bağlam olarak piyasa haberleri verilirse bunları analizine dahil et.
- Sayıları formatla: 65.000 $ gibi.
- Emoji kullanabilirsin ama abartma."""


def get_chart_analysis(symbol: str, current_price: float, chart_data: list) -> str:
    """Grafik verilerini yapay zekaya gönderip teknik analiz yorumu alır."""
    if not client:
        return "Yapay zeka asistanı şu an aktif değil (GROQ API Key eksik)."

    try:
        recent_data = chart_data[-10:] if len(chart_data) >= 10 else chart_data
        
        # OHLC verilerinden basit istatistikler çıkar
        closes = [d.get("close", 0) for d in recent_data]
        highs = [d.get("high", 0) for d in recent_data]
        lows = [d.get("low", 0) for d in recent_data]
        
        avg_close = sum(closes) / len(closes) if closes else 0
        recent_high = max(highs) if highs else 0
        recent_low = min(lows) if lows else 0
        trend = "yükseliş" if closes and closes[-1] > closes[0] else "düşüş"
        
        prompt = f"""
{symbol} teknik analizi iste. Güncel fiyat: {current_price:,.2f} $

Son {len(recent_data)} mum verisi özeti:
- Dönem trend: {trend}
- Dönem en yüksek: {recent_high:,.2f} $
- Dönem en düşük: {recent_low:,.2f} $
- Dönem ortalama kapanış: {avg_close:,.2f} $
- İlk kapanış: {closes[0] if closes else 0:,.2f} $
- Son kapanış: {closes[-1] if closes else 0:,.2f} $

Lütfen bu verilere dayanarak:
1. **Trend Analizi**: Genel eğilim ne yönde?
2. **Destek & Direnç**: Kritik fiyat seviyeleri neler?
3. **Risk Değerlendirmesi**: Kısa vadede potansiyel riskler ve fırsatlar neler?
4. **Özet Tavsiye**: Yatırımcı için net, kısa bir değerlendirme (bu bir yatırım tavsiyesi değildir).

Maksimum 4 paragraf olsun.
"""
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=800,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Analiz oluşturulurken bir hata oluştu: {str(e)}"


def get_chatbot_response(user_message: str, history: List[Dict] = None, context_news: str = "") -> str:
    """
    Multi-turn konuşma geçmişi ve isteğe bağlı haber bağlamı ile chatbot yanıtı üretir.
    """
    if not client:
        return "Sistem: Lütfen .env dosyasına GROQ_API_KEY ekleyin."

    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Haber bağlamı varsa sisteme ekle
        if context_news:
            news_context = f"""
Kullanıcının sorusuyla ilgili güncel haberler:
{context_news}

Bu haberleri analizine dahil et.
"""
            messages.append({"role": "system", "content": news_context})
        
        # Konuşma geçmişini ekle (en fazla son 10 mesaj)
        if history:
            for msg in history[-10:]:
                role = "user" if msg.get("sender") == "user" else "assistant"
                messages.append({"role": role, "content": msg.get("text", "")})
        
        messages.append({"role": "user", "content": user_message})
        
        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            max_tokens=600,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Bağlantı hatası: {str(e)}"


def summarize_news(news_title: str, news_content: str = "") -> str:
    """Bir haberi AI ile özetleyip yatırımcı perspektifinden yorumlar."""
    if not client:
        return "AI servisi şu an aktif değil."
    
    try:
        prompt = f"""
Haber başlığı: {news_title}
{f'Haber içeriği: {news_content[:1000]}' if news_content else ''}

Bu haberi yatırımcı perspektifinden değerlendir:
1. Hangi varlıkları etkiler?
2. Piyasa etkisi nasıl olabilir? (pozitif/negatif)
3. Kısa bir öner (bu bir yatırım tavsiyesi değildir).

3-4 cümle yeterli.
"""
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=300,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Özet oluşturulamadı: {str(e)}"