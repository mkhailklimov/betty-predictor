-- Release 2.2: a log of every step of a Stars purchase (avatar for 50 Stars), so we can see
-- who opened the payment window and did not pay, not only the finished payments.
--
-- ADDITIVE ONLY. premium_purchases stays the record of paid purchases.
-- step: opened (invoice made), checkout (Telegram asked us to confirm), paid,
--       cancelled / failed (reported by the app when the payment window closes).

CREATE TABLE IF NOT EXISTS payment_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT,
  tg_id       TEXT,
  payload     TEXT,
  step        TEXT NOT NULL,
  stars       INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payment_log_payload ON payment_log(payload);
