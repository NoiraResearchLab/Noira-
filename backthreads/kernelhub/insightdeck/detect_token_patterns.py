from typing import List, Dict
import numpy as np

def detect_token_patterns(samples: List[Dict]) -> Dict:
    """
    samples: [{ 'price': float, 'liquidity': float, 'timestamp': int }]
    Returns trend detection and signal scoring
    """
    if len(samples) < 3:
        return { "error": "Insufficient data" }

    prices = [s["price"] for s in samples]
    liquidity = [s["liquidity"] for s in samples]

    price_trend = compute_trend(prices)
    liquidity_trend = compute_trend(liquidity)

    signals = []
    if price_trend > 0.5 and liquidity_trend > 0.5:
        signals.append("growth-phase")
    if price_trend < -0.5 and liquidity_trend < -0.5:
        signals.append("decline-phase")
    if abs(price_trend - liquidity_trend) > 0.9:
        signals.append("liquidity-shift")

    return {
        "price_trend_score": round(price_trend, 3),
        "liquidity_trend_score": round(liquidity_trend, 3),
        "detected_signals": signals
    }

def compute_trend(series: List[float]) -> float:
    """Return normalized slope of the trend line"""
    x = np.arange(len(series))
    y = np.array(series)
    slope, _ = np.polyfit(x, y, 1)
    return float(slope / max(abs(y).max(), 1e-5))
