import pandas as pd
import pandas_ta as ta

def get_sma_crossover_signals(history_df: pd.DataFrame):
    """
    SMA ve RSI indikatörlerine göre AL/SAT sinyalleri üretir.
    - SMA(10) > SMA(20) ise AL (Buy)
    - SMA(20) > SMA(10) ise SAT (Sell)
    - RSI < 30 (Aşırı satım'dan çıkış) ise AL
    - RSI > 70 (Aşırı alım'dan çıkış) ise SAT
    """
    if history_df.empty or len(history_df) < 20:
        return []

    # İndikatörleri hesapla
    history_df.ta.sma(length=10, append=True)
    history_df.ta.sma(length=20, append=True)
    history_df.ta.rsi(length=14, append=True)

    history_df['prev_sma_10'] = history_df['SMA_10'].shift(1)
    history_df['prev_sma_20'] = history_df['SMA_20'].shift(1)
    history_df['prev_rsi'] = history_df['RSI_14'].shift(1)

    buy_signals = history_df[(history_df['SMA_10'] > history_df['SMA_20']) & (history_df['prev_sma_10'] <= history_df['prev_sma_20'])]
    sell_signals = history_df[(history_df['SMA_10'] < history_df['SMA_20']) & (history_df['prev_sma_10'] >= history_df['prev_sma_20'])]

    buy_rsi = history_df[(history_df['RSI_14'] > 30) & (history_df['prev_rsi'] <= 30)]
    sell_rsi = history_df[(history_df['RSI_14'] < 70) & (history_df['prev_rsi'] >= 70)]

    signals = []
    for index, row in buy_signals.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "belowBar", "color": "#26a69a", "shape": "arrowUp", "text": "SMA Al"})
    for index, row in sell_signals.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "aboveBar", "color": "#ef5350", "shape": "arrowDown", "text": "SMA Sat"})
    for index, row in buy_rsi.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "belowBar", "color": "#1E88E5", "shape": "arrowUp", "text": "RSI Al"})
    for index, row in sell_rsi.iterrows():
        signals.append({"time": index.strftime('%Y-%m-%d'), "position": "aboveBar", "color": "#FFB300", "shape": "arrowDown", "text": "RSI Sat"})

    return sorted(signals, key=lambda x: x['time'])