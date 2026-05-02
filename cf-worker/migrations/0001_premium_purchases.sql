CREATE TABLE IF NOT EXISTS premium_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tg_id TEXT NOT NULL,
  stars_amount INTEGER NOT NULL,
  telegram_payment_charge_id TEXT NOT NULL UNIQUE,
  invoice_payload TEXT,
  purchased_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_premium_purchases_user_id ON premium_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_purchases_tg_id ON premium_purchases(tg_id);
