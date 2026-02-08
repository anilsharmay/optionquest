const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'optionquest.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT DEFAULT 'Trader1',
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'classroom'
    )`);

    // Wallet table
    db.run(`CREATE TABLE IF NOT EXISTS wallet (
      user_id INTEGER PRIMARY KEY,
      total_deposited REAL DEFAULT 10000,
      current_cash REAL DEFAULT 10000,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Positions table
    db.run(`CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      ticker TEXT,
      type TEXT, -- 'call' or 'put' or 'stock'
      strategy TEXT, -- 'long' or 'covered_call'
      strike REAL,
      expiry TEXT,
      entry_price REAL,
      quantity INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT, -- 'deposit', 'buy', 'sell'
      ticker TEXT,
      amount REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Indices for performance
    db.run('CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');

    // Lessons table
    db.run(`CREATE TABLE IF NOT EXISTS completed_lessons (
      user_id INTEGER,
      lesson_id TEXT,
      PRIMARY KEY(user_id, lesson_id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Insert a default user if not exists
    db.get("SELECT count(*) as count FROM users", (err, row) => {
      if (row.count === 0) {
        db.run("INSERT INTO users (username) VALUES ('Trader1')", function (err) {
          if (!err) {
            const userId = this.lastID;
            db.run("INSERT INTO wallet (user_id) VALUES (?)", [userId]);
          }
        });
      }
    });
  });
};

module.exports = { db, initDb };
