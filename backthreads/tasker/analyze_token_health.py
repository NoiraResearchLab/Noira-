def analyze_token_health(liquidity: float, holders: int, tx_count: int) -> str:
    if liquidity < 1000:
        return "⚠️ Low Liquidity"
    if holders < 50:
        return "⚠️ Low Holder Count"
    if tx_count < 10:
        return "⚠️ Inactive Token"

    return "✅ Healthy"
