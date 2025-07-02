import requests

def fetch_token_metadata(mint_address: str) -> dict:
    url = f"https://public-api.solscan.io/token/meta?tokenAddress={mint_address}"
    headers = { "accept": "application/json" }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        return {
            "mint": mint_address,
            "name": data.get("name"),
            "symbol": data.get("symbol"),
            "decimals": data.get("decimals"),
            "icon": data.get("icon")
        }
    except Exception as e:
        print(f"[error] Failed to fetch token metadata: {e}")
        return {}
