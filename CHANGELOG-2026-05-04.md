# 2026-05-04 — @tApps_bot resubmission rejected (again)

User received a second rejection from @tApps_bot:

> "Hello! Unfortunately, still have to decline your submission."

No specific reason provided in the rejection message. User replied asking the moderator for the actual feedback before we make any changes — guessing at the fix burns another submission cycle.

## Status

**Holding all Betty work until moderator replies.** Stars Premium tier is live on dev+prod, Friday cron fixed, DR snapshot in `dr/`. No code or config changes warranted without specific feedback.

## Open items (unchanged from 2026-05-03)

- Audit share surfaces — every public link should route through `t.me/bettyscores_bot`, not raw `app.bettyscores.com`.
- Remove forced `is_premium=1` on test users `islavutin` (500886298) and `MikeKlimov` (1056798742) before public launch.
- WC 2026 launch readiness audit — tournament starts 2026-06-11.
- Verify `MihelKlimm/betty-predictor` repo visibility (private, since `dr/snapshot-2026-05-03.sql` contains tg_ids and usernames).

## Switched focus

User pivoted to Avocado Farm Phase 1 bootstrap — see `avocado_farm/CHANGELOG-2026-05-04.md` for that work.
