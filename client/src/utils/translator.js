const translations = {
  premium: {
    technical: 'Premium',
    friendly: 'Cost of Bet',
    description: 'The price you pay to buy the option contract.'
  },
  strike: {
    technical: 'Strike Price',
    friendly: 'Target Price',
    description: 'The price the stock must reach for your contract to be "In the Money".'
  },
  expiration: {
    technical: 'Expiration',
    friendly: 'Deadline',
    description: 'The date when the contract becomes void.'
  },
  theta: {
    technical: 'Theta',
    friendly: 'Time Decay',
    description: 'How much value the option loses every day just from time passing.'
  },
  delta: {
    technical: 'Delta',
    friendly: 'Price Sensitivity',
    description: 'How much the option price moves for every $1 move in the stock.'
  },
  iv: {
    technical: 'Implied Volatility',
    friendly: 'Market Nervousness',
    description: 'How much the market expects the stock to swing.'
  },
  call: {
    technical: 'Call Option',
    friendly: 'UP-Bet',
    description: 'A bet that the stock price will go up.'
  },
  put: {
    technical: 'Put Option',
    friendly: 'DOWN-Bet',
    description: 'A bet that the stock price will go down.'
  }
};

export const translate = (key, plainEnglishEnabled) => {
  const item = translations[key.toLowerCase()];
  if (!item) return key;
  return plainEnglishEnabled ? item.friendly : item.technical;
};

export const getTooltip = (key) => {
  return translations[key.toLowerCase()]?.description || '';
};
