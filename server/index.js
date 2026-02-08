const express = require('express');
const cors = require('cors');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// --- Caching Layer ---
const cache = {
  quotes: new Map(),
  options: new Map(),
};

const CACHE_TTL = 60000; // 60 seconds

const getCached = (map, key) => {
  const entry = map.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
};

const setCache = (map, key, data) => {
  map.set(key, { data, timestamp: Date.now() });
};

// Initialize Database
initDb();

// Helper for DB queries with promises
const dbGet = (query, params) => new Promise((resolve, reject) => {
  db.get(query, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbAll = (query, params) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const dbRun = (query, params) => new Promise((resolve, reject) => {
  db.run(query, params, function (err) { err ? reject(err) : resolve(this); });
});

// --- Market Routes ---

app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const cached = getCached(cache.quotes, symbol);
  if (cached) return res.json(cached);

  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    setCache(cache.quotes, symbol, quote);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/options/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const cached = getCached(cache.options, symbol);
  if (cached) return res.json(cached);

  try {
    const options = await yahooFinance.options(symbol);
    if (!options) {
      return res.status(404).json({ error: 'Options not found' });
    }
    setCache(cache.options, symbol, options);
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- User & Wallet Routes ---

app.get('/api/user/:id', async (req, res) => {
  try {
    const row = await dbGet(`
      SELECT u.*, w.total_deposited, w.current_cash 
      FROM users u 
      JOIN wallet w ON u.id = w.user_id 
      WHERE u.id = ?`,
      [req.params.id]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:id/deposit', async (req, res) => {
  const { amount } = req.body;
  const userId = req.params.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    await dbRun(`UPDATE wallet SET total_deposited = total_deposited + ?, current_cash = current_cash + ? WHERE user_id = ?`, [amount, amount, userId]);
    await dbRun(`INSERT INTO transactions (user_id, type, amount) VALUES (?, 'deposit', ?)`, [userId, amount]);
    await dbRun('COMMIT');
    res.json({ message: 'Deposit successful' });
  } catch (err) {
    await dbRun('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// --- Trading Routes ---

app.get('/api/user/:id/positions', async (req, res) => {
  try {
    const positions = await dbAll(`SELECT * FROM positions WHERE user_id = ?`, [req.params.id]);

    // Fetch current prices for tickers and options
    const uniqueTickers = [...new Set(positions.map(p => p.ticker))];
    const stockQuotes = {};
    const optionChains = {};

    if (uniqueTickers.length > 0) {
      // Fetch stock quotes
      const quoteResults = await yahooFinance.quote(uniqueTickers);
      const resultsArray = Array.isArray(quoteResults) ? quoteResults : [quoteResults];
      resultsArray.forEach(q => {
        stockQuotes[q.symbol] = q.regularMarketPrice;
      });

      // Fetch option chains for those that have option positions
      const tickersWithOptions = [...new Set(positions.filter(p => p.type !== 'stock').map(p => p.ticker))];
      for (const ticker of tickersWithOptions) {
        try {
          const chain = await yahooFinance.options(ticker);
          optionChains[ticker] = chain;
        } catch (e) {
          console.error(`Failed to fetch options for ${ticker}`, e);
        }
      }
    }

    const enrichedPositions = positions.map(pos => {
      let currentPrice = pos.entry_price;

      if (pos.type === 'stock') {
        currentPrice = stockQuotes[pos.ticker] || pos.entry_price;
      } else {
        // Find in option chain
        const chain = optionChains[pos.ticker];
        if (chain && chain.options && chain.options[0]) {
          const contracts = pos.type === 'call' ? chain.options[0].calls : chain.options[0].puts;
          const match = contracts.find(c => c.strike === pos.strike); // Simplified match
          if (match) {
            currentPrice = match.lastPrice;
          }
        }
      }

      const multiplier = pos.type === 'stock' ? 1 : 100;
      const currentValue = currentPrice * pos.quantity * multiplier;
      const costBasis = pos.entry_price * pos.quantity * multiplier;

      return {
        ...pos,
        current_price: currentPrice,
        unrealized_pnl: currentValue - costBasis,
        unrealized_pnl_percent: ((currentPrice - pos.entry_price) / pos.entry_price) * 100
      };
    });

    res.json(enrichedPositions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trade/buy', async (req, res) => {
  const { userId, ticker, type, strategy, strike, expiry, entryPrice, quantity } = req.body;

  const numQuantity = Number(quantity);
  const numEntryPrice = Number(entryPrice);
  const numStrike = Number(strike);

  if (isNaN(numQuantity) || numQuantity <= 0) return res.status(400).json({ error: 'Invalid quantity' });
  if (isNaN(numEntryPrice) || numEntryPrice <= 0) return res.status(400).json({ error: 'Invalid price' });

  // --- Security: Validate Price against Live Market (only for options) ---
  if (type !== 'stock') {
    try {
      const optionsParams = {};
      if (expiry) optionsParams.date = expiry;
      const chain = await yahooFinance.options(ticker, optionsParams);

      if (!chain || !chain.options || !chain.options[0]) {
        return res.status(400).json({ error: 'Option chain not found for this expiry' });
      }

      const contracts = type === 'call' ? chain.options[0].calls : chain.options[0].puts;
      const option = contracts.find(c => Math.abs(c.strike - numStrike) < 0.1); // Float safe comparison

      if (!option) {
        console.error(`Option not found: ${ticker} ${type} ${numStrike} ${expiry}`);
        return res.status(400).json({ error: 'Option contract not found in market data' });
      }

      // Verify Price: Allow generous 20% drift for prototype due to data delays
      const referencePrice = option.lastPrice;
      const diffPercent = Math.abs((numEntryPrice - referencePrice) / referencePrice);

      if (referencePrice > 0.10 && diffPercent > 0.30) {
        console.warn(`Price validation failed: User=${numEntryPrice}, Market=${referencePrice}`);
        return res.status(400).json({
          error: `Market price moved. Current market is ~$${referencePrice.toFixed(2)}. Your price: $${numEntryPrice.toFixed(2)}`
        });
      }

    } catch (err) {
      console.error("Trade Validation Error:", err.message);
      return res.status(400).json({ error: `Market data sync failed: ${err.message}` });
    }
  }
  // ---------------------------------------------------

  const totalCost = numEntryPrice * numQuantity * (type === 'stock' ? 1 : 100);

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    const wallet = await dbGet(`SELECT current_cash FROM wallet WHERE user_id = ?`, [userId]);

    if (!wallet || wallet.current_cash < totalCost) {
      await dbRun('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    await dbRun(`UPDATE wallet SET current_cash = current_cash - ? WHERE user_id = ?`, [totalCost, userId]);
    await dbRun(`INSERT INTO positions (user_id, ticker, type, strategy, strike, expiry, entry_price, quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, ticker, type, strategy, strike, expiry, entryPrice, quantity]);
    await dbRun(`INSERT INTO transactions (user_id, type, ticker, amount) VALUES (?, 'buy', ?, ?)`,
      [userId, ticker, totalCost]);

    await dbRun('COMMIT');
    res.json({ message: 'Purchase successful' });
  } catch (err) {
    await dbRun('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trade/sell', async (req, res) => {
  const { positionId, userId, currentPrice } = req.body;

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    const position = await dbGet(`SELECT * FROM positions WHERE id = ? AND user_id = ?`, [positionId, userId]);

    if (!position) {
      await dbRun('ROLLBACK');
      return res.status(404).json({ error: 'Position not found' });
    }

    const priceToUse = currentPrice || position.entry_price; // Fallback to entry if not provided
    const totalCredit = priceToUse * position.quantity * (position.type === 'stock' ? 1 : 100);

    await dbRun(`UPDATE wallet SET current_cash = current_cash + ? WHERE user_id = ?`, [totalCredit, userId]);
    await dbRun(`DELETE FROM positions WHERE id = ?`, [positionId]);
    await dbRun(`INSERT INTO transactions (user_id, type, ticker, amount) VALUES (?, 'sell', ?, ?)`,
      [userId, position.ticker, totalCredit]);

    await dbRun('COMMIT');
    res.json({ message: 'Sale successful' });
  } catch (err) {
    await dbRun('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// --- Academy Routes ---

app.get('/api/user/:id/lessons', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT lesson_id FROM completed_lessons WHERE user_id = ?`, [req.params.id]);
    res.json(rows.map(r => r.lesson_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:id/lessons/complete', async (req, res) => {
  const { lessonId, xpGained } = req.body;
  const userId = req.params.id;

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    await dbRun(`INSERT OR IGNORE INTO completed_lessons (user_id, lesson_id) VALUES (?, ?)`, [userId, lessonId]);
    await dbRun(`UPDATE users SET xp = xp + ?, level = (xp + ?) / 100 + 1 WHERE id = ?`, [xpGained, xpGained, userId]);
    await dbRun('COMMIT');
    res.json({ message: 'Lesson completed' });
  } catch (err) {
    await dbRun('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:id/reset-portfolio', async (req, res) => {
  const userId = req.params.id;

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    // Delete all user's positions
    await dbRun(`DELETE FROM positions WHERE user_id = ?`, [userId]);
    // Reset wallet to initial values
    await dbRun(`UPDATE wallet SET total_deposited = 10000, current_cash = 10000 WHERE user_id = ?`, [userId]);
    // Record the reset as a transaction for history/audit (optional but good practice)
    await dbRun(`INSERT INTO transactions (user_id, type, amount) VALUES (?, 'reset', ?)`, [userId, 0]);
    await dbRun('COMMIT');
    res.json({ message: 'Portfolio reset successful' });
  } catch (err) {
    await dbRun('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
