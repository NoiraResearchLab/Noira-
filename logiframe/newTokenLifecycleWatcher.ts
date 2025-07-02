interface TokenBirthEvent {
  mint string
  createdAt number
  initialLiquidity number
  creatorWallet string
}

interface TokenLifecycleFlag {
  mint string
  suspiciousStart boolean
  lowLiquidityLaunch boolean
}

export function watchNewTokenLifecycle(event TokenBirthEvent) TokenLifecycleFlag {
  const now = Date.now()
  const ageMinutes = (now - event.createdAt)  60000

  return {
    mint event.mint,
    suspiciousStart ageMinutes  5 && event.initialLiquidity  500,
    lowLiquidityLaunch event.initialLiquidity  1000
  }
}
