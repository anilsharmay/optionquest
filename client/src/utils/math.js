/**
 * Black-Scholes formula for European options
 * s: current stock price
 * k: strike price
 * t: time to expiration (in years)
 * r: risk-free interest rate
 * v: volatility (sigma)
 */
export const blackScholes = (s, k, t, r, v, type = 'call') => {
  const d1 = (Math.log(s / k) + (r + v * v / 2) * t) / (v * Math.sqrt(t));
  const d2 = d1 - v * Math.sqrt(t);

  if (type === 'call') {
    return s * cumulativeDistribution(d1) - k * Math.exp(-r * t) * cumulativeDistribution(d2);
  } else {
    return k * Math.exp(-r * t) * cumulativeDistribution(-d2) - s * cumulativeDistribution(-d1);
  }
};

const cumulativeDistribution = (x) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) return 1 - prob;
  return prob;
};

export const calculatePnL = (entryPrice, currentPrice, quantity, type) => {
  const multiplier = 100;
  return (currentPrice - entryPrice) * quantity * multiplier;
};
