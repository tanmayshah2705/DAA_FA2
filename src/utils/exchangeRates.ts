export const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY'];

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
}

// Simulated exchange rates (some intentionally create arbitrage opportunities)
export function generateExchangeRates(currencies: string[]): ExchangeRate[] {
  const rates: ExchangeRate[] = [];
  
  // Base rates (USD as reference)
  const baseRates: { [key: string]: number } = {
    'USD': 1.0,
    'EUR': 0.92,
    'JPY': 149.50,
    'GBP': 0.79,
    'AUD': 1.53,
    'CAD': 1.36,
    'CHF': 0.88,
    'CNY': 7.24
  };

  // Generate bidirectional exchange rates
  for (let i = 0; i < currencies.length; i++) {
    for (let j = 0; j < currencies.length; j++) {
      if (i !== j) {
        const from = currencies[i];
        const to = currencies[j];
        
        // Calculate cross rate
        let rate = baseRates[to] / baseRates[from];
        
        // Add small random variation
        rate *= (0.98 + Math.random() * 0.04);
        
        rates.push({ from, to, rate });
      }
    }
  }

  // Intentionally create an arbitrage opportunity for demonstration
  if (currencies.includes('USD') && currencies.includes('EUR') && currencies.includes('GBP')) {
    const usdEurIndex = rates.findIndex(r => r.from === 'USD' && r.to === 'EUR');
    const eurGbpIndex = rates.findIndex(r => r.from === 'EUR' && r.to === 'GBP');
    const gbpUsdIndex = rates.findIndex(r => r.from === 'GBP' && r.to === 'USD');
    
    if (usdEurIndex >= 0 && eurGbpIndex >= 0 && gbpUsdIndex >= 0) {
      // Create profitable cycle: USD -> EUR -> GBP -> USD
      rates[usdEurIndex].rate = 1.10;  // 1 USD = 1.10 EUR
      rates[eurGbpIndex].rate = 0.91;  // 1 EUR = 0.91 GBP
      rates[gbpUsdIndex].rate = 1.27;  // 1 GBP = 1.27 USD
      // Product: 1.10 * 0.91 * 1.27 ≈ 1.27 > 1 (profit!)
    }
  }

  return rates;
}

export function fetchRealTimeRates(currencies: string[]): Promise<ExchangeRate[]> {
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateExchangeRates(currencies));
    }, 500);
  });
}
