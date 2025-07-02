from fastapi import FastAPI, Query
from typing import Optional
from get_liquidity_info import get_liquidity_info
from solana_get_holders import solana_get_holder_count
from analyze_token_health import analyze_token_health

app = FastAPI()

@app.get("/token/summary")
async def token_summary(mint: str = Query(..., description="Token mint address")):
    liquidity_data = get_liquidity_info(mint)
    if not liquidity_data:
        return {"error": "Token data not found."}

    holders = solana_get_holder_count(mint)
    tx_count = int(liquidity_data.get("volume_24h", 0) // liquidity_data.get("price_usd", 1))

    health = analyze_token_health(
        liquidity=liquidity_data.get("liquidity_usd", 0),
        holders=holders,
        tx_count=tx_count
    )

    return {
        "mint": mint,
        "symbol": liquidity_data.get("symbol"),
        "price_usd": liquidity_data.get("price_usd"),
        "liquidity_usd": liquidity_data.get("liquidity_usd"),
        "volume_24h": liquidity_data.get("volume_24h"),
        "holders": holders,
        "tx_estimate": tx_count,
        "health": health
    }
