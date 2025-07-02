import requests

def get_liquidity_info(mint: str) -> dict:
    endpoint = f"https://api.dexscreener.com/latest/dex/tokens/{mint}"

    try:
        res = requests.get(endpoint)
        res.raise_for_status()
        data = res.json()

        pair = data.get("pairs", [])[0] if data.get("pairs") else None
        if not pair:
            return {}

        return {
            "symbol": pair["baseToken"]["symbol"],
            "price_usd": float(pair["priceUsd"]),
            "liquidity_usd": float(pair["liquidity"]["usd"]),
            "volume_24h": float(pair["volume"]["h24"]),
            "pair_address": pair["pairAddress"]
        }
    except Exception as e:
        print(f"[error] Liquidity info fetch failed: {e}")
        return {}
