-- v2.0 — web identity (§5.3 of docs/RELEASE-2.0.md)
--
-- ADDITIVE ONLY. New nullable columns on `users`; no drops, no renames.
-- A rolled-back v1 Worker ignores these columns.

-- How the user authenticated: miniapp (initData), widget (Login Widget), guest.
ALTER TABLE users ADD COLUMN auth_source TEXT;

-- Server-issued opaque token for guest sessions. Unique so a token collision
-- (however unlikely with crypto.randomUUID) is caught rather than silently
-- merging two guests.
ALTER TABLE users ADD COLUMN guest_token TEXT;

-- When a guest logs in with Telegram, their predictions move to the real
-- account and merged_into is set to the real user's id. The guest row stays
-- as a tombstone; rebuildMarts must exclude merged_into IS NOT NULL.
ALTER TABLE users ADD COLUMN merged_into TEXT;

-- Attribution: the ?ref= or utm_source value captured on first load.
ALTER TABLE users ADD COLUMN ref_source TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_guest_token ON users (guest_token)
  WHERE guest_token IS NOT NULL;
