# CHANGELOG 2026-10-11 — Week 41 results, challenge points in prizes, early week switch

## Week 41 results (production, 17:17 UTC)

Resolved with the new `bash scripts/betty-admin.sh resolve` command; 44 winning
predictions, 76 points in the week.

| Challenge | Result | Answer | Winners |
|---|---|---|---|
| preview-ch-41-01 England vs Croatia, exact score | England 7–0 Croatia | 7:0 (set 7 Oct) | 0 of 14 |
| preview-ch-41-02 Will Raya keep a clean sheet vs Leeds? | Arsenal 2–1 Leeds | No | 7 |
| preview-ch-41-06 Arsenal vs Leeds, exact score | 2–1 | 2:1 | 6 |
| preview-ch-41-05 Will Chelsea beat Bournemouth? | Chelsea 5–1 | Yes | 9 |
| preview-ch-41-03 Who scores first, United / Spurs / nobody? | 1–1 (Mbeumo 73', Solanke 90+2') | Home | 10 |
| preview-ch-41-04 Will Haaland score? | City won 3–0 at Anfield, Haaland 65' | Yes | 12 |

England vs Croatia: the card listed England as home; the stored 7:0 already means
England 7, Croatia 0. Nobody picked 7:0 or 0:7, so the home/away mix-up changed
no one's points.

## Bug: challenge points did not count for weekly prizes

`rebuildMarts` built the weekly champions (`gold_champions`, which `closeWeek`
uses to award 100 / 50 Stars) only from legacy match predictions. Release 2.1
challenge points went only to the all-time leaderboard. Week 41, played entirely
with challenges, would have had **no champions and no prizes** at tonight's close.

Fix (`cf-worker/src/worker.js`, commit `f15f13d`):

- Challenge points are added per week and player to `gold_champions`; the
  tie-break (earlier last pick wins) also uses challenge pick times.
- Guests and internal accounts stay out of the ranking, as before.
- **Illyria30_ad** added to `INTERNAL_TG_IDS` (MikeKlimov and bettyscores were
  already there). Mishanna45 stays eligible.
- The all-time leaderboard is unchanged: on a production snapshot the old and
  new code give identical totals for every player.
- Champions lists sort any unranked row last.

Expected at tonight's close (local run on production data):
**1st Mishanna45 (6 pts, 100 Stars), 2nd "........" (6 pts, last pick later, 50 Stars).**

## Early switch to next week

`/api/challenges/current` now serves the next week as soon as every challenge of
the calendar week has kicked off **and** the next week is published. Scoring and
`closeWeek` still run at Monday 00:00 UTC. Tested: before the last kickoff → this
week; after it with next week published → next week; next week not published →
stays; Monday → next week. Live since 17:30 UTC: the app shows week 42.

## Helper

`scripts/betty-admin.sh resolve <week> <challenge_id>=<answer> ...` (commit
`1e800dc`): validates answers (Yes/No, Over/Under, Home/Away/Nobody, H:A) before
calling `/api/admin/resolve-challenges`; safe to re-run.

## Open

1. **Mon 12 Oct:** check `weekly_prizes` for 2026_41, then send the Stars by hand
   (gift in Telegram) and mark them paid with
   `POST /api/admin/prizes/2026_41/paid?rank=1` (and `rank=2`).
2. The Monday cron will also publish week 43 from the sheet (rows 14–19 passed
   the dry run). Tuesday's form check can still re-publish: nobody can predict
   week 43 before week 42's last kickoff.
3. Week 42 results after 17–18 Oct, before Monday 19 Oct 00:00 UTC.
