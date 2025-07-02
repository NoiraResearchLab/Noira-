import requests

def solana_get_holder_count(mint: str) -> int:
    url = "https://public-api.solscan.io/token/holders"
    params = {
        "token": mint,
        "limit": 1,
        "offset": 0
    }

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        data = res.json()
        return data.get("total", 0)
    except Exception as e:
        print(f"[error] Holder count fetch failed: {e}")
        return 0
