from collections import Counter
from math import log2
from statistics import mean, stdev
from typing import Any, Dict, List


def build_behavior_map(transfers: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Analyze token transfer patterns to build a behavior fingerprint.

    Each transfer dict must include:
      - 'amount': numeric value of the transfer
      - 'timestamp': integer or float UNIX timestamp
      - 'sender': string address of the sender

    Returns a dict with:
      - activity_score: total number of transfers
      - volatility_index: stdev(amounts) / mean(amounts) (0 if only one transfer)
      - address_entropy: Shannon entropy of sender distribution (bits)
    """
    # Validate input
    if not isinstance(transfers, list):
        raise TypeError("transfers must be a list of dicts")
    if not transfers:
        return {"activity_score": 0.0, "volatility_index": 0.0, "address_entropy": 0.0}

    # Extract amounts and senders
    amounts = []
    senders = []
    for tx in transfers:
        try:
            amt = float(tx["amount"])
            snd = str(tx["sender"])
        except (KeyError, ValueError):
            raise ValueError("Each transfer must have numeric 'amount' and string 'sender'")
        amounts.append(amt)
        senders.append(snd)

    # Compute activity score
    activity_score = float(len(amounts))

    # Compute volatility index
    if len(amounts) > 1 and mean(amounts) != 0:
        vol_index = stdev(amounts) / mean(amounts)
    else:
        vol_index = 0.0

    # Compute Shannon entropy of sender distribution
    count = Counter(senders)
    total = sum(count.values())
    entropy = 0.0
    for freq in count.values():
        p = freq / total
        entropy -= p * log2(p)
    
    return {
        "activity_score": round(activity_score, 2),
        "volatility_index": round(vol_index, 4),
        "address_entropy": round(entropy, 4),
    }
