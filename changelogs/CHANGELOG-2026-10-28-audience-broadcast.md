# 28 Oct 2026 — audience push: bot invites, catalog status

## Numbers (27 Oct)
321 users, only 27 via Telegram (the rest are browser guests who can't win Stars). Weekly players: wk41 20 → wk42 4 → wk43 5 → wk44 5. Channel: 7 subscribers.

## Plan agreed with the owner
1. Guest → Telegram conversion prompt after the first pick — **to build**.
2. Weekly bot invites to Telegram players — **built today** (below).
3. Referral bonus — postponed.
4. Video clip for Liverpool–Chelsea — owner makes it today.
5. Friends' / group leagues — doubtful, parked to think about.
6. Catalogs — FindMini **listed**; tApps still waiting.

## Bot invites
- `POST /api/admin/notify` takes an optional `"button"`: a label for one inline button that opens the Mini App (`web_app` → https://app.bettyscores.com).
- `betty-admin.sh notify <tg_id> msg.txt ["label"]` and new `betty-admin.sh broadcast ids.txt msg.txt ["label"]` (one tg_id per line, 0.2 s apart).
- Worker deployed, version 3931d684.
- Test invite for Liverpool vs Chelsea (League Cup, Wed 28 Oct 20:00 UTC) sent to MikeKlimov (message 57), button "⚽ Make my pick".
- Broadcast list: 24 Telegram users (all except test_123, the bettyscores account and the owner). Sent only after the owner approves the test.

## Catalogs
- FindMini.app: listed — https://findmini.app/bettyscores_bot/ (Stars, Prediction Markets, Fitness and Sports).
- tApps Center: no reply yet from @tapps_center_moderation; owner to check @app_moderation_bot.
