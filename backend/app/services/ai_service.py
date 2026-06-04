import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Ortam değişkenlerinden API anahtarını alıyoruz
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_chart_analysis(symbol: str, current_price: float, chart_data: list):
    """Grafik verilerini yapay zekaya gönderip teknik analiz yorumu alır."""
    if not GEMINI_API_KEY:
        return "Yapay zeka asistanı şu an aktif değil (API Key eksik)."
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Sadece son 5 günün verisini gönderelim ki yapay zeka boğulmasın
        recent_data = chart_data[-5:] if len(chart_data) >= 5 else chart_data
        
        prompt = f"""
        Sen profesyonel bir finansal analist ve kripto/hisse senedi uzmanısın.
        Kullanıcı {symbol} varlığına bakıyor. Güncel fiyatı: {current_price}$.
        İşte son günlerin (Açılış, Yüksek, Düşük, Kapanış) verileri: {recent_data}
        
        Lütfen bu verilere bakarak:
        1. Kısa bir trend analizi yap (Yükseliş mi, düşüş mü?).
        2. Destek ve direnç noktaları hakkında bir tahmin yürüt.
        3. Yatırımcı için kısa, net ve profesyonel bir tavsiye ver (Yatırım tavsiyesi değildir uyarısı ekleyerek).
        Maksimum 3-4 paragraf olsun ve okuması kolay olsun.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Analiz oluşturulurken bir hata oluştu: {str(e)}"

def get_chatbot_response(user_message: str):
    """Kullanıcının serbest yazdığı sorulara yatırım asistanı olarak cevap verir."""
    if not GEMINI_API_KEY:
        return "Sistem: Lütfen .env dosyasına GEMINI_API_KEY ekleyin."
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Sen nextTrade isimli uygulamanın yapay zeka yatırım asistanısın. Kullanıcıya yardım et. Soru: {user_message}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Bağlantı hatası: {str(e)}"