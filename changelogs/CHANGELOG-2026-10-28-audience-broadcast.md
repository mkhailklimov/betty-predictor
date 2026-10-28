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

## Liverpool–Chelsea invite sent (28 Oct, ~07:00 UTC)
- First test arrived with "?" instead of emoji/dash: the JSON body went through the Windows command line in the ANSI codepage. Fixed: the script now sends non-ASCII as `\uXXXX` escapes. Text rewritten without emoji anyway.
- `notify` also takes a 4th arg, a picture URL (sent with `sendPhoto`, text as caption), and accepts `@channel` as target (button becomes a t.me link there, since `web_app` buttons only work in private chats). Worker version 0d6dd14a.
- Second test (with LIV_CHE.png, button "Make my pick") approved by the owner, then broadcast to 24 Telegram users: **18 delivered, 6 have blocked the bot** (500886298, 6034210172, 1699233542, 864596273, 7707147409, 7174602152) — drop them from future lists.
- Bot is now an admin of @bettyscores_channel (owner, 28 Oct). Channel posts are always shown to the owner before sending.

## First channel post (drafted, approved, NOT yet sent)
- Text in `deploy/channel-post-2026-10-28-cup-night.txt`: cup night Liverpool–Chelsea + FindMini listing + 100/50 Stars. Picture LIV_CHE.png, button "Play Betty" (t.me/bettyscores_bot/app).
- Owner: no emoji, looks more professional. Keep bot and channel texts emoji-free.
- Sending was blocked by the permission check; send with
  `bash scripts/betty-admin.sh notify @bettyscores_channel deploy/channel-post-2026-10-28-cup-night.txt "Play Betty" "https://app.bettyscores.com/stickers/LIV_CHE.png"`
  (must go out before 20:00 UTC to make sense).

## Next
- Owner today: week 45 stickers (5/10 raw in frontend/public/stickers so far) + Liverpool–Chelsea video.
- Me: clean + wire week 45 stickers before Sun 1 Nov; build the guest → Telegram prompt (plan item 1).
- Git push needs the owner to sign in to GitHub once (`git push origin HEAD:main` in a terminal); commits since 27 Oct are local only.
