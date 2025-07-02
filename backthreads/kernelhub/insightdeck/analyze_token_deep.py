from typing import Dict, List
from math import sqrt
from collections import Counter

def compute_distribution_metrics(transfers: List[Dict]) -> Dict:
    """
    transfers: list of { amount: float, sender: str }
    """
    if not transfers:
        return {}

    amounts = [t["amount"] for t in transfers]
    senders = [t["sender"] for t in transfers]

    mean_amt = sum(amounts) / len(amounts)
    variance = sum((x - mean_amt) ** 2 for x in amounts) / len(amounts)
    std_dev = sqrt(variance)

    sender_freq = Counter(senders)
    most_active_wallet = sender_freq.most_common(1)[0]

    gini = compute_gini_index(amounts)

    return {
        "mean_amount": round(mean_amt, 4),
        "std_deviation": round(std_dev, 4),
        "gini_coefficient": round(gini, 4),
        "most_active_wallet": most_active_wallet[0],
        "tx_from_top_wallet": most_active_wallet[1]
    }

def compute_gini_index(values: List[float]) -> float:
    """Calculate Gini coefficient of inequality"""
    sorted_vals = sorted(values)
    n = len(values)
    cumulative = 0
    for i, val in enumerate(sorted_vals, 1):
        cumulative += i * val
    total = sum(sorted_vals)
    return (2 * cumulative) / (n * total) - (n + 1) / n
