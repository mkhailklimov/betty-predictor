#!/usr/bin/env python3
"""Write match results into the `Matches` tab of the schedule sheet.

Used for every manual results entry (results ingestion is in no cron — see
docs/WEEKLY-RUNBOOK.md). Saved from the 2026-07-20 tournament close-out, where it
was previously re-typed ad hoc each week.

Run with the gspread venv:
    /home/misha/Ilya/backend/venv/bin/python scripts/fill_match_results.py

Two things that have bitten us and are enforced here:

1. **Sheet row != match number.** Row 1 is the header, so match N is usually at
   row N+1 -- but that only holds while no rows are inserted or reordered. Every
   write below asserts the row's `Match ID` cell first. A silent off-by-one
   corrupts a settled result rather than failing loudly.

2. **USER_ENTERED, never RAW.** The landing page reads this sheet live via the
   gviz CSV endpoint, and gviz infers ONE type per column: text-typed cells in a
   mostly-date column get NULLed, silently hiding a week from the site. See the
   gviz gotcha in docs/WEEKLY-RUNBOOK.md.

Scores follow the 90-MINUTE RULE for knockout matches: record the score at 90'
+ stoppage, NOT the AET or shootout result. A knockout level at 90' is a draw
(`X`) even though someone advanced.
"""

import gspread
from google.oauth2.service_account import Credentials

SHEET_ID = "1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus"
SA_KEY = "/home/misha/Ilya/cf-worker/.betty-sa.json"

# `open_by_key` reads Drive metadata -- spreadsheets-only scope 403s.
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# Column positions in the `Matches` tab (1-indexed, for gspread.cell()).
COL_IS_ACTIVE = 11  # K
COL_MATCH_ID = 12   # L
COL_RESULT = 14     # N -- '1' | 'X' | '2'
COL_SCORE_1 = 15    # O
COL_SCORE_2 = 16    # P

IS_ACTIVE_ENDED = 3

# (sheet_row, expected Match ID, result, home_score, away_score)
# Below: the 2026-07-20 close-out. Match 48 is the Final -- Spain won 1-0 but the
# only goal came at 106', so at 90' it is 0-0, a draw.
PLAN = [
    (48, "47", "2", 4, 6),
    (49, "48", "X", 0, 0),
]


def main():
    creds = Credentials.from_service_account_file(SA_KEY, scopes=SCOPES)
    ws = gspread.authorize(creds).open_by_key(SHEET_ID).worksheet("Matches")

    # Verify every target row BEFORE writing any of them, so a bad plan aborts
    # without leaving the sheet half-updated.
    for row, match_id, *_ in PLAN:
        got = ws.cell(row, COL_MATCH_ID).value
        if str(got).strip() != match_id:
            raise SystemExit(
                f"ABORT: row {row} holds Match ID {got!r}, expected {match_id!r}. "
                "Rows were inserted or reordered -- fix PLAN, do not write."
            )
        print(f"row {row}: Match ID {got} OK")

    for row, match_id, result, s1, s2 in PLAN:
        ws.update(
            f"N{row}:P{row}", [[result, s1, s2]], value_input_option="USER_ENTERED"
        )
        ws.update(
            f"K{row}", [[IS_ACTIVE_ENDED]], value_input_option="USER_ENTERED"
        )
        print(f"row {row} (match {match_id}) <- {result} {s1}-{s2}, Is active=3")

    print("\nVerify:")
    for row, *_ in PLAN:
        print(" ", row, ws.row_values(row)[10:16])

    print(
        "\nSheet only. D1 still needs the same scores -- results do NOT sync "
        "sheet->matches. See docs/TOURNAMENT-CLOSEOUT.md step 3."
    )


if __name__ == "__main__":
    main()
