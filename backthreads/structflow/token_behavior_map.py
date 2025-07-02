from statistics import mean, stdev
from typing import List, Dict

def build_behavior_map(transfers: List[Dict]) -> Dict[str, float]:
    """
    Analyze token transfer patterns to build a behavior fingerprint.
    Expects each transfer: { 'amount': float, 'timestamp': int, 'sender': str }
    """
    if not transfers:
        return {
            "activity_score": 0.0,
            "volatility_index": 0.0,
            "address_entropy": 0.0
        }

    amounts = [tx["amount"] for tx in transfers]
    senders = set(tx["sender"] for tx in transfers)

    avg_amount = mean(amounts)
    vol_index = stdev(amounts) / avg_amount if len(amounts) > 1 else 0
    entropy = len(senders) / len(transfers)

    return {
        "activity_score": round(len(transfers), 2),
        "volatility_index": round(vol_index, 4),
        "address_entropy": round(entropy, 4)
    }
