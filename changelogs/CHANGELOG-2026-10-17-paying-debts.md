# CHANGELOG 2026-10-17 — Paying the owed Stars

## Paid / sent

| Prize | Player | Stars | Status |
|---|---|---|---|
| 2026_34 rank 1 | KiernanOades (7707147409) | 100 | ✅ sent and **marked paid** (D1 paid_at 2026-10-17 19:24 UTC). Kiernan replied, amazed. |
| 2026_41 rank 1 + bonus_2 | Mishanna45 (1017885628) | 300 | ⏳ **100 sent** 17 Oct (gift); 200 to send 18 Oct after she confirms receipt. Not marked yet. |
| bonus_1 | ippolitovdenis (1045430016) | 300 | ⏳ **100 sent** 17 Oct (gift); 200 to send 18 Oct after he confirms receipt. Not marked yet. |
| 2026_41 rank 2 | "........" (8237993213) | 50 | ⏳ no public username; bot message sent 17 Oct (message_id 52) asking them to write to @bettyscores. |

- Stars are sent as Telegram digital gifts from the @bettyscores account (there is no 300 ⭐ gift, so 100 + 200). Recipients who convert a gift to Stars get somewhat less than its price (Telegram shows the figure); the owner decides whether to top up.
- @bettyscores balance: 649 ⭐ bought, 200 sent → 449. After 200 + 200 tomorrow: 49, **1 short** of the 50 for "........"; top up before paying them.

## Tooling (commit dfeb97a, worker deployed)

- `bash scripts/betty-admin.sh paid <week|bonus_N> <rank>` — mark a prize paid (`/api/admin/prizes/:week/paid`; the reply now includes the row count).
- `bash scripts/betty-admin.sh notify <tg_id> <file>` — one bot message to one player (new `POST /api/admin/notify`, admin token).

## Next (18 Oct)

1. Check with Mishanna and Denis that the 100 ⭐ arrived; send 200 each.
2. Then mark: `paid 2026_41 1`, `paid bonus_2 1` (Mishanna), `paid bonus_1 1` (Denis).
3. When "........" writes to @bettyscores: top up 1 ⭐, send 50, `paid 2026_41 2`.
4. Still pending: **week 43 re-publish** (`publish 2026_43 --force`) before Sun 18 Oct 15:30 UTC — D1 still has the Pickford card.
5. Sun 18 Oct evening: resolve week 42.
