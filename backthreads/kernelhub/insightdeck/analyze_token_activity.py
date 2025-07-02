from typing import List, Dict
from datetime import datetime
from statistics import mean

def analyze_token_activity(transfers: List[Dict]) -> Dict:
    """
    transfers: list of token transfer records with structure:
      { 'timestamp': int, 'amount': float, 'from': str, 'to': str }
    """
    if not transfers:
        return {
            "total_volume": 0,
            "avg_tx_amount": 0,
            "unique_wallets": 0,
            "activity_window": "0 min",
            "tx_count": 0
        }

    total_volume = sum(t["amount"] for t in transfers)
    avg_tx = mean(t["amount"] for t in transfers)
    wallets = set()
    for tx in transfers:
        wallets.add(tx["from"])
        wallets.add(tx["to"])

    timestamps = [t["timestamp"] for t in transfers]
    start = min(timestamps)
    end = max(timestamps)
    duration_min = round((end - start) / 60, 2) if end > start else 1

    return {
        "total_volume": round(total_volume, 2),
        "avg_tx_amount": round(avg_tx, 4),
        "unique_wallets": len(wallets),
        "activity_window": f"{duration_min} min",
        "tx_count": len(transfers)
    }

def print_activity_summary(activity: Dict) -> None:
    print("\n--- Token Activity Summary ---")
    for k, v in activity.items():
        print(f"{k}: {v}")
