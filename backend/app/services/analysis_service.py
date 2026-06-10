import pandas as pd
import pandas_ta as ta

def get_sma_crossover_signals(history_df: pd.DataFrame):
    """
    Daha profesyonel ve güvenilir (Daha az hatalı sinyal veren) MACD ve EMA indikatörlerine göre AL/SAT sinyalleri üretir.
    - EMA(20) > EMA(50) (Kısa vadeli trend yukarı) ise AL
    - EMA(20) < EMA(50) (Kısa vadeli trend aşağı) ise SAT
    - MACD Histogram > 0 (Momentum pozitife döndü) ise AL
    - MACD Histogram < 0 (Momentum negatife döndü) ise SAT
    """
    if history_df.empty or len(history_df) < 50:
        return []

    # İndikatörleri hesapla
    history_df.ta.ema(length=20, append=True)
    history_df.ta.ema(length=50, append=True)
    history_df.ta.macd(fast=12, slow=26, signal=9, append=True)

    # MACD sütun isimleri: MACD_12_26_9, MACDh_12_26_9 (Histogram), MACDs_12_26_9 (Signal)
    macd_hist_col = 'MACDh_12_26_9'
    
    if 'EMA_20' not in history_df.columns or macd_hist_col not in history_df.columns:
        return []

    history_df['prev_ema_20'] = history_df['EMA_20'].shift(1)
    history_df['prev_ema_50'] = history_df['EMA_50'].shift(1)
    history_df['prev_macd_hist'] = history_df[macd_hist_col].shift(1)

    buy_ema = history_df[(history_df['EMA_20'] > history_df['EMA_50']) & (history_df['prev_ema_20'] <= history_df['prev_ema_50'])]
    sell_ema = history_df[(history_df['EMA_20'] < history_df['EMA_50']) & (history_df['prev_ema_20'] >= history_df['prev_ema_50'])]

    buy_macd = history_df[(history_df[macd_hist_col] > 0) & (history_df['prev_macd_hist'] <= 0)]
    sell_macd = history_df[(history_df[macd_hist_col] < 0) & (history_df['prev_macd_hist'] >= 0)]

    signals = []
    for index, row in buy_ema.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "belowBar", "color": "#26a69a", "shape": "arrowUp", "text": "Trend Al (EMA)"})
    for index, row in sell_ema.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "aboveBar", "color": "#ef5350", "shape": "arrowDown", "text": "Trend Sat (EMA)"})
    for index, row in buy_macd.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "belowBar", "color": "#1E88E5", "shape": "arrowUp", "text": "Momentum Al (MACD)"})
    for index, row in sell_macd.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "aboveBar", "color": "#FFB300", "shape": "arrowDown", "text": "Momentum Sat (MACD)"})

    return sorted(signals, key=lambda x: x['time'])