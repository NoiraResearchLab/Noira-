from typing import List, Dict
from collections import Counter
from statistics import mean

def summarize_asset_path(transfers: List[Dict]) -> Dict:
    """
    transfers: list of dicts like { 'from': str, 'to': str, 'amount': float, 'time': str }
    """
    if not transfers:
        return {
            "total_moves": 0,
            "unique_hops": 0,
            "mean_transfer_amount": 0,
            "most_visited_address": None
        }

    addresses = []
    amounts = []

    for tx in transfers:
        addresses.extend([tx["from"], tx["to"]])
        amounts.append(tx["amount"])

    address_freq = Counter(addresses)
    most_common = address_freq.most_common(1)[0]

    return {
        "total_moves": len(transfers),
        "unique_hops": len(set(addresses)),
        "mean_transfer_amount": round(mean(amounts), 4),
        "most_visited_address": most_common[0]
    }

def print_path_summary(summary: Dict):
    print("\n--- Asset Path Summary ---")
    for key, val in summary.items():
        print(f"{key}: {val}")
