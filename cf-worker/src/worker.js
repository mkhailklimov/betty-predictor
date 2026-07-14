// Betty Predictor API — Cloudflare Worker + D1

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function uuid() {
  return crypto.randomUUID();
}

// 31 confirmed WC 2026 participants (matches public/teams/Cards/*.png).
const ALLOWED_TEAMS = new Set([
  'ALG', 'ARG', 'AUS', 'BIH', 'BRA', 'CAN', 'CRO', 'CUR', 'CVE', 'CZE',
  'ENG', 'ESP', 'FRA', 'GER', 'JAP', 'KOR', 'MEX', 'MOR', 'NED', 'NOR',
  'PAR', 'POR', 'QAT', 'SAF', 'SCO', 'SEN', 'SWE', 'SWZ', 'TUR', 'USA',
  'UZB',
]);

// Internal/test accounts — excluded from gold marts (Champions/Leaderboard).
// MikeKlimov, bettyscores bot, bet_monitoring, TestUser. See project_betty_user_account.
const INTERNAL_TG_IDS = new Set(['1056798742', '8513208258', '7653593987', 'test_123']);

// Canonical scoring — the ONE place scoring is defined.
//   correct outcome (1/X/2)            → 1 point
//   exact score (implies outcome)      → 3 points TOTAL (not 1+3)
//   otherwise                          → 0
function scoreBet(predOutcome, predHome, predAway, resOutcome, resHome, resAway) {
  const correctOutcome = predOutcome === resOutcome ? 1 : 0;
  const correctScore = correctOutcome && predHome === resHome && predAway === resAway ? 1 : 0;
  const points = correctScore ? 3 : correctOutcome ? 1 : 0;
  return { points, correctOutcome, correctScore };
}

export default {
  // Cron triggers — dispatch by schedule string:
  //   "0 * * * *"  → hourly match-status update
  //   "0 6 * * 5"  → weekly users D1→Sheets sync
  async scheduled(event, env, ctx) {
    if (event.cron === '0 6 * * 5') {
      // Weekly: refresh marts from latest data, then mirror everything OUT to the sheet.
      ctx.waitUntil((async () => {
        try { await syncAdjustmentsFromSheet(env); } catch (e) { console.error('adj sync failed', e); }
        await rebuildMarts(env);
        await syncUsersToSheet(env);
        await exportMartsToSheet(env);
      })());
      return;
    }
    // Default: hourly match-status update
    const now = new Date();
    const { results: matches } = await env.DB.prepare('SELECT * FROM matches').all();

    for (const match of matches) {
      if (!match.time) continue;

      const kickoff = new Date(match.time.includes('T') ? match.time : match.time.replace(' ', 'T') + 'Z');
      const endEstimate = new Date(kickoff.getTime() + 3 * 60 * 60 * 1000); // ~3h after kickoff

      let newStatus = match.is_active;

      if (now >= endEstimate) {
        newStatus = 3; // Game ended, hide
      } else if (now >= kickoff) {
        newStatus = 2; // Game started, locked
      }
      // 0 and 1 are set manually via admin

      if (newStatus !== match.is_active) {
        await env.DB.prepare(
          'UPDATE matches SET is_active = ?, status = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(
          newStatus,
          newStatus === 2 ? 'live' : newStatus === 3 ? 'finished' : match.status,
          match.id
        ).run();
      }
    }

    // Pull manual adjustments from the sheet, then refresh marts so
    // Champions/Leaderboard reflect newly-finished matches + adjustments.
    ctx.waitUntil((async () => {
      try { await syncAdjustmentsFromSheet(env); } catch (e) { console.error('adj sync failed', e); }
      await rebuildMarts(env);
    })());
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Health
      if (path === '/' || path === '/health') {
        return json({ status: 'healthy', name: 'Betty API', version: '0.2.0' });
      }

      // --- Users ---
      if (method === 'POST' && path === '/api/user/register') {
        const body = await request.json();
        const { username, first_name, last_name } = body;
        // Identity comes from the signed initData, never from the body: a
        // client-supplied tg_id let anyone register (and thus act as) any user.
        // During the rollout window a legacy client may still post its own id.
        const verified = await resolveTgId(request, env);
        const tg_id = verified || (env.ALLOW_LEGACY_AUTH === '1' ? body.tg_id : null);
        if (!tg_id) return json({ detail: 'Unauthorized' }, 401);

        const existing = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(tg_id).first();
        if (existing) return json(existing, 200);

        const id = uuid();
        // Prefer the @handle; fall back to the Telegram first/last name (most
        // users have no @username set), and only then to the User_<tg_id> stub.
        const fullName = [first_name, last_name].map((s) => (s || '').trim()).filter(Boolean).join(' ');
        const displayName = username || fullName || `User_${tg_id}`;
        await env.DB.prepare(
          'INSERT INTO users (id, tg_id, username) VALUES (?, ?, ?)'
        ).bind(id, tg_id, displayName).run();

        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
        return json(user, 201);
      }

      if (method === 'POST' && path === '/api/user/wallet') {
        const body = await request.json();
        const { ton_address } = body;
        if (!ton_address || typeof ton_address !== 'string') {
          return json({ detail: 'ton_address required' }, 400);
        }
        const token = await resolveTgId(request, env);
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 401);
        await env.DB.prepare(
          'UPDATE users SET ton_wallet = ?, ton_consent = 1, updated_at = datetime("now") WHERE id = ?'
        ).bind(ton_address, user.id).run();
        return json({ ok: true });
      }

      if (method === 'GET' && path === '/api/user/me') {
        const token = await resolveTgId(request, env);
        // No anonymous fallback. This used to return `SELECT * FROM users LIMIT 1`
        // — i.e. some arbitrary real user's record, wallet included — to any caller.
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 404);
        return json(user);
      }

      if (method === 'GET' && path.match(/^\/api\/user\/[^/]+$/)) {
        const userId = path.split('/').pop();
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        if (!user) return json({ detail: 'User not found' }, 404);
        return json(user);
      }

      // --- Matches ---
      if (method === 'GET' && path === '/api/matches/active') {
        const { results } = await env.DB.prepare(
          "SELECT * FROM matches WHERE status IN ('upcoming', 'live') ORDER BY date"
        ).all();
        return json(results);
      }

      if (method === 'GET' && path === '/api/matches') {
        const { results } = await env.DB.prepare('SELECT * FROM matches ORDER BY date').all();
        return json(results);
      }

      if (method === 'GET' && path.match(/^\/api\/matches\/[^/]+$/)) {
        const matchId = path.split('/').pop();
        const match = await env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(matchId).first();
        if (!match) return json({ detail: 'Match not found' }, 404);
        return json(match);
      }

      // --- Predictions ---
      if (method === 'POST' && path === '/api/predictions') {
        const body = await request.json();
        const { match_id, prediction_type, predicted_score } = body;

        const token = await resolveTgId(request, env);
        if (!token) return json({ detail: 'Auth required' }, 401);

        let user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        // Self-heal: if the Bearer is a valid Telegram id but registration never
        // landed (cold start / network blip during init), create the row here so
        // the prediction is never silently lost. Mirrors /api/user/register.
        if (!user && /^\d+$/.test(token)) {
          const id = uuid();
          await env.DB.prepare(
            'INSERT OR IGNORE INTO users (id, tg_id, username) VALUES (?, ?, ?)'
          ).bind(id, token, `User_${token}`).run();
          user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        }
        if (!user) return json({ detail: 'User not found' }, 401);

        const match = await env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(match_id).first();
        if (!match) return json({ detail: 'Match not found' }, 404);
        if (match.status === 'finished') return json({ detail: 'Cannot predict on finished match' }, 400);

        // Kickoff lockout: reject if match has started (using UTC time field).
        // match.time may be ISO ("2026-06-12T01:00:00Z") or "YYYY-MM-DD HH:MM:SS";
        // normalize to a valid UTC instant before comparing.
        if (match.time) {
          let t = match.time.includes('T') ? match.time : match.time.replace(' ', 'T');
          if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(t)) t += 'Z';
          const kickoff = new Date(t);
          if (!isNaN(kickoff.getTime()) && new Date() >= kickoff) {
            return json({ detail: 'Betting closed — match has started' }, 403);
          }
        }

        const scoreJson = predicted_score ? JSON.stringify(predicted_score) : null;

        // Upsert: update if exists, insert if new
        const existing = await env.DB.prepare(
          'SELECT * FROM predictions WHERE user_id = ? AND match_id = ?'
        ).bind(user.id, match_id).first();

        if (existing) {
          await env.DB.prepare(
            'UPDATE predictions SET prediction_type = ?, predicted_score = ?, updated_at = datetime("now") WHERE id = ?'
          ).bind(prediction_type, scoreJson, existing.id).run();

          const updated = await env.DB.prepare('SELECT * FROM predictions WHERE id = ?').bind(existing.id).first();
          if (updated && updated.predicted_score) {
            try { updated.predicted_score = JSON.parse(updated.predicted_score); } catch {}
          }
          return json(updated, 200);
        }

        const id = uuid();
        await env.DB.prepare(
          'INSERT INTO predictions (id, user_id, match_id, prediction_type, predicted_score) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, user.id, match_id, prediction_type, scoreJson).run();

        await env.DB.prepare(
          'UPDATE users SET predictions_count = predictions_count + 1, updated_at = datetime("now") WHERE id = ?'
        ).bind(user.id).run();

        const prediction = await env.DB.prepare('SELECT * FROM predictions WHERE id = ?').bind(id).first();
        if (prediction && prediction.predicted_score) {
          try { prediction.predicted_score = JSON.parse(prediction.predicted_score); } catch {}
        }
        return json(prediction, 201);
      }

      if (method === 'GET' && path === '/api/predictions/me') {
        const token = await resolveTgId(request, env);
        // No anonymous LIMIT 1 fallback — that leaked an arbitrary user's
        // predictions to any caller (same bug as the old /api/user/me).
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 401);

        const { results } = await env.DB.prepare(
          'SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(user.id).all();
        return json(parseScores(results));
      }

      if (method === 'GET' && path.match(/^\/api\/predictions\/user\/[^/]+$/)) {
        const userId = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(userId).all();
        return json(parseScores(results));
      }

      if (method === 'GET' && path.match(/^\/api\/predictions\/match\/[^/]+$/)) {
        const matchId = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM predictions WHERE match_id = ?'
        ).bind(matchId).all();
        return json(parseScores(results));
      }

      // --- Leaderboard (all-time, served from gold_leaderboard mart) ---
      if (method === 'GET' && (path === '/api/leaderboard' || path === '/api/leaderboard/overall')) {
        const { results } = await env.DB.prepare(
          'SELECT * FROM gold_leaderboard ORDER BY total_points DESC, username ASC'
        ).all();
        const leaderboard = results.map((l, i) => ({
          rank: i + 1,
          user_id: l.user_id,
          username: l.username,
          points: l.total_points,
          correct_predictions: l.correct_outcomes,
          correct_scores: l.correct_scores,
          weeks_won: l.weeks_won,
          grams: l.weeks_won, // 1 whole Gram prize per week won (integer, no decimals)
          is_premium: l.is_premium === 1,
          fav_team: l.fav_team || null,
        }));
        return json(leaderboard);
      }

      // --- Champions (official weekly results, served from gold_champions mart) ---
      // GET /api/champions          → latest week's results
      // GET /api/champions?week=... → a specific week_id (e.g. 2026_24)
      if (method === 'GET' && path === '/api/champions') {
        const weekParam = url.searchParams.get('week');
        let week = weekParam;
        if (!week) {
          const row = await env.DB.prepare('SELECT MAX(week_id) w FROM gold_champions').first();
          week = row ? row.w : null;
        }
        if (!week) return json({ week_id: null, results: [] });
        const { results } = await env.DB.prepare(
          'SELECT * FROM gold_champions WHERE week_id = ? ORDER BY rank'
        ).bind(week).all();
        return json({
          week_id: week,
          results: results.map(c => ({
            rank: c.rank, user_id: c.user_id, username: c.username, week_id: c.week_id,
            points: c.total_points, correct_predictions: c.correct_outcomes,
            correct_scores: c.correct_scores, matches_predicted: c.matches_predicted, ton_earned: 0,
          })),
        });
      }

      // --- Rewards ---
      if (method === 'GET' && path.match(/^\/api\/rewards\/[^/]+$/)) {
        const userId = path.split('/').pop();
        const { results: rewards } = await env.DB.prepare(
          'SELECT * FROM rewards WHERE user_id = ?'
        ).bind(userId).all();

        let totalPoints = 0, claimedTon = 0, pendingTon = 0;
        for (const r of rewards) {
          totalPoints += r.points || 0;
          if (r.status === 'claimed') claimedTon += r.ton_amount || 0;
          else pendingTon += r.ton_amount || 0;
        }

        return json({ user_id: userId, total_points: totalPoints, claimed_ton: claimedTon, pending_ton: pendingTon, rewards });
      }

      if (method === 'POST' && path === '/api/rewards/claim') {
        const token = await resolveTgId(request, env);
        // No anonymous LIMIT 1 fallback — this claims (mutates) rewards, so it
        // must act only on the authenticated user.
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 401);

        const { results: pending } = await env.DB.prepare(
          "SELECT * FROM rewards WHERE user_id = ? AND status = 'pending'"
        ).bind(user.id).all();

        let totalTon = 0;
        for (const r of pending) {
          totalTon += r.ton_amount || 0;
          await env.DB.prepare(
            "UPDATE rewards SET status = 'claimed', claimed_at = datetime('now') WHERE id = ?"
          ).bind(r.id).run();
        }

        return json({ message: `Claimed ${pending.length} rewards`, total_ton: totalTon });
      }

      // --- Admin: manual trigger of the weekly Users sync ---
      // Call: curl -X POST https://<worker>/api/admin/sync-users \
      //        -H "Authorization: Bearer $ADMIN_TOKEN"
      if (method === 'POST' && path === '/api/admin/sync-users') {
        const token = getToken(request);
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return json({ detail: 'Unauthorized' }, 401);
        }
        const result = await syncUsersToSheet(env);
        return json(result);
      }

      // --- Admin: rebuild silver + gold marts from bronze ---
      // Call: curl -X POST https://<worker>/api/admin/rebuild -H "Authorization: Bearer $ADMIN_TOKEN"
      if (method === 'POST' && path === '/api/admin/rebuild') {
        const token = getToken(request);
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return json({ detail: 'Unauthorized' }, 401);
        }
        return json(await rebuildMarts(env));
      }

      // --- Admin: results — ingest from FIFA to bronze, reconcile to matches ---
      // ?apply=1 writes result changes (else dry). After apply, rebuild marts.
      if (method === 'POST' && (path === '/api/admin/results' || path === '/api/admin/espn')) {
        const token = getToken(request);
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return json({ detail: 'Unauthorized' }, 401);
        }
        const apply = url.searchParams.get('apply') === '1';
        const ingest = await ingestFifaResults(env);
        const reconcile = await reconcileResults(env, { apply });
        const rebuild = apply && reconcile.changed ? await rebuildMarts(env) : null;
        return json({ ingest, reconcile, rebuild });
      }

      // --- Admin: mirror gold marts → sheet (Champions + Leaderboard tabs) ---
      if (method === 'POST' && path === '/api/admin/export-marts') {
        const token = getToken(request);
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return json({ detail: 'Unauthorized' }, 401);
        }
        return json(await exportMartsToSheet(env));
      }

      // --- Admin: sync manual adjustments from sheet → bronze, then rebuild ---
      // ?dry=1 parses + returns without writing. Bearer ADMIN_TOKEN.
      if (method === 'POST' && path === '/api/admin/sync-adjustments') {
        const token = getToken(request);
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return json({ detail: 'Unauthorized' }, 401);
        }
        const dryRun = url.searchParams.get('dry') === '1';
        const sync = await syncAdjustmentsFromSheet(env, { dryRun });
        if (dryRun) return json(sync);
        const rebuild = await rebuildMarts(env);
        return json({ sync, rebuild });
      }

      // --- Telegram ---
      if (method === 'POST' && path === '/api/telegram/web-app-data') {
        const body = await request.json();
        if (!body.init_data) return json({ detail: 'init_data required' }, 400);
        return json({ success: true, message: 'Data received' });
      }

      if (method === 'GET' && path === '/api/telegram/bot-info') {
        return json({ mini_app_url: 'https://betty-tg-app.netlify.app', status: 'active' });
      }

      // POST /api/user/fav-team — Premium-only. Sets users.fav_team to a valid
      // 3-letter team code. The team code must be in the allowed WC participants list.
      if (method === 'POST' && path === '/api/user/fav-team') {
        const token = await resolveTgId(request, env);
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 401);
        if (user.is_premium !== 1) return json({ detail: 'Premium required' }, 403);
        const body = await request.json();
        const code = (body && body.team_code) ? String(body.team_code).toUpperCase() : '';
        if (!ALLOWED_TEAMS.has(code)) return json({ detail: 'Invalid team_code' }, 400);
        await env.DB.prepare(
          'UPDATE users SET fav_team = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(code, user.id).run();
        return json({ ok: true, fav_team: code });
      }

      // --- Payments (Telegram Stars) ---
      // POST /api/payments/create-stars-invoice → returns { invoice_url }
      // Auth: same tg_id Bearer token as other user endpoints.
      if (method === 'POST' && path === '/api/payments/create-stars-invoice') {
        const token = await resolveTgId(request, env);
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 401);
        if (user.is_premium === 1) return json({ detail: 'Already premium' }, 409);
        if (!env.BOT_TOKEN) return json({ detail: 'Payments not configured' }, 503);

        const payload = `premium_${user.tg_id}_${Date.now()}`;
        const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Betty Premium',
            description: 'PRO badge on the leaderboard. One-time purchase, supports the studio.',
            payload,
            currency: 'XTR',
            prices: [{ label: 'Betty Premium', amount: 50 }],
          }),
        });
        const tgJson = await tgRes.json();
        if (!tgJson.ok) return json({ detail: 'Failed to create invoice', tg: tgJson.description }, 502);
        return json({ invoice_url: tgJson.result, payload });
      }

      // POST /tg/webhook → Telegram bot update handler.
      // Validates X-Telegram-Bot-Api-Secret-Token header matches env.WEBHOOK_SECRET.
      // Handles: pre_checkout_query (auto-approve), successful_payment (mark premium).
      if (method === 'POST' && path === '/tg/webhook') {
        const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
        if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
          return json({ detail: 'Forbidden' }, 403);
        }
        const update = await request.json();

        if (update.pre_checkout_query) {
          const q = update.pre_checkout_query;
          await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerPreCheckoutQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pre_checkout_query_id: q.id, ok: true }),
          });
          return json({ ok: true });
        }

        const sp = update.message && update.message.successful_payment;
        if (sp && sp.currency === 'XTR') {
          const tgId = String(update.message.from.id);
          const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(tgId).first();
          if (user) {
            await env.DB.prepare(
              'UPDATE users SET is_premium = 1, updated_at = datetime("now") WHERE id = ?'
            ).bind(user.id).run();
            await env.DB.prepare(
              `INSERT OR IGNORE INTO premium_purchases
                 (user_id, tg_id, stars_amount, telegram_payment_charge_id, invoice_payload)
               VALUES (?, ?, ?, ?, ?)`
            ).bind(user.id, tgId, sp.total_amount, sp.telegram_payment_charge_id, sp.invoice_payload).run();
          }
          return json({ ok: true });
        }

        return json({ ok: true });
      }

      return json({ detail: 'Not found' }, 404);

    } catch (err) {
      return json({ detail: err.message || 'Internal server error' }, 500);
    }
  },
};

// Admin routes only: compared against env.ADMIN_TOKEN, which is a real secret.
// Never use this to establish a *user* identity — see resolveTgId below.
function getToken(request) {
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// --- Telegram Mini App authentication ---------------------------------------
// Until 2026-07-14 user identity came from `Authorization: Bearer <tg_id>` — a
// raw, unsigned Telegram id. Anyone could act as anyone by sending their number:
// forge predictions, or repoint a winner's ton_wallet and steal the TON payout.
//
// Identity now comes from Telegram's signed initData (`Authorization: tma <initData>`),
// verified per Telegram's spec:
//   secret_key = HMAC_SHA256(key="WebAppData", msg=BOT_TOKEN)
//   expected   = hex(HMAC_SHA256(key=secret_key, msg=data_check_string))
// The bot token never leaves the worker, so initData cannot be forged client-side.
const INITDATA_MAX_AGE_S = 24 * 60 * 60;

async function hmacSha256(keyBytes, message) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

// Constant-time compare, so a wrong hash can't be brute-forced byte-by-byte.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  let params;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const entries = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const secret = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken);

  // Telegram's newer payloads carry an extra Ed25519 `signature` field, and
  // clients disagree on whether it belongs in the HMAC's data_check_string.
  // Accept either form: both are HMACs keyed by the bot token, so neither is
  // forgeable without it, and tolerating both avoids locking users out.
  const candidates = [
    entries,
    entries.filter(([k]) => k !== 'signature'),
  ].map((e) => e.map(([k, v]) => `${k}=${v}`).join('\n'));

  let ok = false;
  for (const dcs of candidates) {
    const expected = toHex(await hmacSha256(secret, dcs));
    if (timingSafeEqual(expected, hash)) { ok = true; break; }
  }
  if (!ok) return null;

  // Reject replays of an old launch string.
  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > INITDATA_MAX_AGE_S) return null;

  try {
    const user = JSON.parse(params.get('user') || '{}');
    return user && user.id ? String(user.id) : null;
  } catch {
    return null;
  }
}

// The authenticated Telegram id for user-scoped routes, or null.
async function resolveTgId(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('tma ')) return await verifyInitData(auth.slice(4), env.BOT_TOKEN);

  // Rollout only: clients running the pre-fix bundle still send `Bearer <tg_id>`.
  // Flip ALLOW_LEGACY_AUTH to "0" once the signed-initData frontend is live, which
  // closes the impersonation hole for good.
  if (env.ALLOW_LEGACY_AUTH === '1' && auth.startsWith('Bearer ')) {
    const t = auth.slice(7);
    return /^\d+$/.test(t) ? t : null;
  }
  return null;
}

function parseScores(results) {
  return results.map(r => {
    if (r.predicted_score && typeof r.predicted_score === 'string') {
      try { r.predicted_score = JSON.parse(r.predicted_score); } catch {}
    }
    return r;
  });
}

// ---------------------------------------------------------------------------
// Google Sheets sync: users D1 → "Users" tab. Invoked weekly (Fri 06:00 UTC)
// and via POST /api/admin/sync-users. Requires secrets:
//   GOOGLE_SA_JSON         — service-account JSON (entire file contents)
//   SHEETS_SPREADSHEET_ID  — target spreadsheet id
// ---------------------------------------------------------------------------

const USERS_HEADER = [
  'id', 'tg_id', 'username', 'is_premium', 'points', 'predictions_count',
  'tours_played', 'ton_wallet', 'ton_consent', 'ton_earned', 'ton_distributed',
  'created_at', 'updated_at',
];

// Read manual score adjustments from the "Adjustments" tab and load them into
// bronze_adjustments (full replace — the sheet tab is the source of truth).
// Tab columns: Week ID | Username | Points Delta | Reason
// Username is resolved to users.id (case-insensitive). Returns parsed + skipped.
async function syncAdjustmentsFromSheet(env, { dryRun = false } = {}) {
  if (!env.GOOGLE_SA_JSON || !env.SHEETS_SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SA_JSON or SHEETS_SPREADSHEET_ID secret');
  }
  const sa = JSON.parse(env.GOOGLE_SA_JSON);
  const token = await getGoogleAccessToken(sa);
  const sid = env.SHEETS_SPREADSHEET_ID;

  const res = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/Adjustments!A2:D`,
    token, 'GET'
  );
  const rows = res.values || [];

  const { results: users } = await env.DB.prepare('SELECT id, username FROM users').all();
  const byName = {};
  for (const u of users) if (u.username) byName[u.username.toLowerCase()] = u.id;

  const parsed = [];
  const skipped = [];
  for (const r of rows) {
    const week_id = (r[0] || '').trim();
    const username = (r[1] || '').trim();
    const delta = Number(r[2]);
    const reason = (r[3] || '').trim() || null;
    if (!week_id || !username || !Number.isFinite(delta) || delta === 0) {
      if (week_id || username) skipped.push({ week_id, username, why: 'missing/zero fields' });
      continue;
    }
    const user_id = byName[username.toLowerCase()];
    if (!user_id) { skipped.push({ week_id, username, why: 'unknown username' }); continue; }
    parsed.push({ week_id, user_id, username, points_delta: delta, reason });
  }

  if (dryRun) return { ok: true, dry: true, parsed, skipped };

  const stmts = [env.DB.prepare('DELETE FROM bronze_adjustments')];
  for (const a of parsed) stmts.push(env.DB.prepare(
    'INSERT INTO bronze_adjustments (id, week_id, user_id, points_delta, reason) VALUES (?,?,?,?,?)'
  ).bind(uuid(), a.week_id, a.user_id, a.points_delta, a.reason));
  await env.DB.batch(stmts);

  return { ok: true, written: parsed.length, skipped };
}

async function syncUsersToSheet(env) {
  if (!env.GOOGLE_SA_JSON || !env.SHEETS_SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SA_JSON or SHEETS_SPREADSHEET_ID secret');
  }
  const sa = JSON.parse(env.GOOGLE_SA_JSON);
  const { results: users } = await env.DB.prepare('SELECT * FROM users').all();

  const rows = [USERS_HEADER];
  for (const u of users) {
    rows.push(USERS_HEADER.map(k => u[k] == null ? '' : String(u[k])));
  }

  const accessToken = await getGoogleAccessToken(sa);
  const sid = env.SHEETS_SPREADSHEET_ID;

  // Clear the Users tab, then write the full snapshot.
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/Users!A:Z:clear`,
    accessToken, 'POST', {}
  );
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/Users!A1?valueInputOption=RAW`,
    accessToken, 'PUT', { range: 'Users!A1', majorDimension: 'ROWS', values: rows }
  );

  return { ok: true, synced: users.length, at: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Transform: rebuild silver star schema + gold marts from bronze.
// Idempotent, deterministic, full rebuild. Bronze = users/predictions/matches
// (operational tables) + bronze_adjustments.
// ---------------------------------------------------------------------------
async function rebuildMarts(env) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const [{ results: users }, { results: predictions }, { results: matches }, { results: adjustments }] =
    await Promise.all([
      env.DB.prepare('SELECT * FROM users').all(),
      env.DB.prepare('SELECT * FROM predictions').all(),
      env.DB.prepare('SELECT * FROM matches').all(),
      env.DB.prepare('SELECT * FROM bronze_adjustments').all(),
    ]);

  const matchById = {};
  for (const m of matches) matchById[m.id] = m;

  // ---- silver dimensions ----
  const dimUser = users.map(u => ({
    user_id: u.id, tg_id: u.tg_id, username: u.username || `User_${u.tg_id}`,
    is_premium: u.is_premium ? 1 : 0, fav_team: u.fav_team || null,
    is_internal: INTERNAL_TG_IDS.has(String(u.tg_id)) ? 1 : 0,
  }));
  const userById = {};
  for (const d of dimUser) userById[d.user_id] = d;

  const weekIds = [...new Set(matches.map(m => m.week_id).filter(Boolean))];
  const dimWeek = weekIds.map(w => ({ week_id: w, label: 'Week ' + w.split('_')[1], weekstart: null }));

  const teams = [...new Set(matches.flatMap(m => [m.home_team, m.away_team]).filter(Boolean))];
  const dimTeam = teams.map(t => ({ team: t, code: null }));

  // ---- silver facts ----
  const factBet = predictions.map(p => {
    let s = p.predicted_score;
    if (typeof s === 'string') { try { s = JSON.parse(s); } catch { s = {}; } }
    const m = matchById[p.match_id];
    return {
      user_id: p.user_id, match_id: p.match_id, week_id: m ? m.week_id : null,
      pred_outcome: p.prediction_type,
      pred_home: s && s.home != null ? Number(s.home) : null,
      pred_away: s && s.away != null ? Number(s.away) : null,
      updated_at: p.updated_at || p.created_at || null,
    };
  });

  const factResult = matches
    .filter(m => m.home_score != null && m.away_score != null)
    .map(m => ({
      match_id: m.id, week_id: m.week_id, home_team: m.home_team, away_team: m.away_team,
      home_score: m.home_score, away_score: m.away_score,
      outcome: m.result || (m.home_score > m.away_score ? '1' : m.home_score < m.away_score ? '2' : 'X'),
      is_final: m.status === 'finished' || m.is_active === 3 ? 1 : 0,
    }));
  const resultByMatch = {};
  for (const r of factResult) resultByMatch[r.match_id] = r;

  const factScore = [];
  for (const b of factBet) {
    const r = resultByMatch[b.match_id];
    if (!r || !r.is_final) continue;
    const { points, correctOutcome, correctScore } =
      scoreBet(b.pred_outcome, b.pred_home, b.pred_away, r.outcome, r.home_score, r.away_score);
    factScore.push({
      user_id: b.user_id, match_id: b.match_id, week_id: b.week_id,
      points_base: points, is_correct_outcome: correctOutcome, is_correct_score: correctScore,
    });
  }

  // ---- gold: champions (user × week), internal users excluded ----
  const adjByKey = {}; // `${week}|${user}` → delta sum
  for (const a of adjustments) {
    const k = `${a.week_id}|${a.user_id}`;
    adjByKey[k] = (adjByKey[k] || 0) + (Number(a.points_delta) || 0);
  }

  const champAgg = {}; // key week|user
  for (const s of factScore) {
    const u = userById[s.user_id];
    if (!u || u.is_internal) continue;
    const k = `${s.week_id}|${s.user_id}`;
    if (!champAgg[k]) champAgg[k] = {
      week_id: s.week_id, user_id: s.user_id, username: u.username,
      total_points: 0, correct_outcomes: 0, correct_scores: 0, matches_predicted: 0,
      last_bet_at: null,
    };
    const c = champAgg[k];
    c.total_points += s.points_base;
    c.correct_outcomes += s.is_correct_outcome;
    c.correct_scores += s.is_correct_score;
    c.matches_predicted += 1;
  }
  // last_bet_at = MAX(updated_at) per user/week (tiebreak: earliest wins)
  for (const b of factBet) {
    const k = `${b.week_id}|${b.user_id}`;
    if (!champAgg[k] || !b.updated_at) continue;
    if (!champAgg[k].last_bet_at || b.updated_at > champAgg[k].last_bet_at) champAgg[k].last_bet_at = b.updated_at;
  }

  const champions = Object.values(champAgg).map(c => {
    const adj = adjByKey[`${c.week_id}|${c.user_id}`] || 0;
    return { ...c, adjustment_points: adj, total_points: c.total_points + adj };
  });
  // rank within each week
  const byWeek = {};
  for (const c of champions) (byWeek[c.week_id] ||= []).push(c);
  for (const w of Object.keys(byWeek)) {
    byWeek[w].sort((a, b) =>
      b.total_points - a.total_points ||
      String(a.last_bet_at || '9999').localeCompare(String(b.last_bet_at || '9999')));
    byWeek[w].forEach((c, i) => { c.rank = i + 1; });
  }

  // ---- gold: leaderboard (user, all-time) ----
  const lbAgg = {};
  for (const c of champions) {
    const u = userById[c.user_id];
    if (!lbAgg[c.user_id]) lbAgg[c.user_id] = {
      user_id: c.user_id, username: c.username,
      is_premium: u ? u.is_premium : 0, fav_team: u ? u.fav_team : null,
      total_points: 0, correct_outcomes: 0, correct_scores: 0, weeks_played: 0, weeks_won: 0,
    };
    const l = lbAgg[c.user_id];
    l.total_points += c.total_points;
    l.correct_outcomes += c.correct_outcomes;
    l.correct_scores += c.correct_scores;
    l.weeks_played += 1;
    if (c.rank === 1) l.weeks_won += 1;
  }

  // ---- write all layers atomically (delete + insert) ----
  const stmts = [];
  const wipe = t => stmts.push(env.DB.prepare(`DELETE FROM ${t}`));
  ['silver_dim_user', 'silver_dim_week', 'silver_dim_team', 'silver_fact_bet',
   'silver_fact_result', 'silver_fact_score', 'gold_champions', 'gold_leaderboard'].forEach(wipe);

  for (const d of dimUser) stmts.push(env.DB.prepare(
    'INSERT INTO silver_dim_user (user_id,tg_id,username,is_premium,fav_team,is_internal) VALUES (?,?,?,?,?,?)')
    .bind(d.user_id, d.tg_id, d.username, d.is_premium, d.fav_team, d.is_internal));
  for (const d of dimWeek) stmts.push(env.DB.prepare(
    'INSERT INTO silver_dim_week (week_id,label,weekstart) VALUES (?,?,?)').bind(d.week_id, d.label, d.weekstart));
  for (const d of dimTeam) stmts.push(env.DB.prepare(
    'INSERT INTO silver_dim_team (team,code) VALUES (?,?)').bind(d.team, d.code));
  for (const b of factBet) stmts.push(env.DB.prepare(
    'INSERT INTO silver_fact_bet (user_id,match_id,week_id,pred_outcome,pred_home,pred_away,updated_at) VALUES (?,?,?,?,?,?,?)')
    .bind(b.user_id, b.match_id, b.week_id, b.pred_outcome, b.pred_home, b.pred_away, b.updated_at));
  for (const r of factResult) stmts.push(env.DB.prepare(
    'INSERT INTO silver_fact_result (match_id,week_id,home_team,away_team,home_score,away_score,outcome,is_final) VALUES (?,?,?,?,?,?,?,?)')
    .bind(r.match_id, r.week_id, r.home_team, r.away_team, r.home_score, r.away_score, r.outcome, r.is_final));
  for (const s of factScore) stmts.push(env.DB.prepare(
    'INSERT INTO silver_fact_score (user_id,match_id,week_id,points_base,is_correct_outcome,is_correct_score) VALUES (?,?,?,?,?,?)')
    .bind(s.user_id, s.match_id, s.week_id, s.points_base, s.is_correct_outcome, s.is_correct_score));
  for (const c of champions) stmts.push(env.DB.prepare(
    'INSERT INTO gold_champions (week_id,user_id,username,total_points,correct_outcomes,correct_scores,matches_predicted,adjustment_points,last_bet_at,rank,computed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(c.week_id, c.user_id, c.username, c.total_points, c.correct_outcomes, c.correct_scores, c.matches_predicted, c.adjustment_points, c.last_bet_at, c.rank, now));
  for (const l of Object.values(lbAgg)) stmts.push(env.DB.prepare(
    'INSERT INTO gold_leaderboard (user_id,username,is_premium,fav_team,total_points,correct_outcomes,correct_scores,weeks_played,weeks_won,computed_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(l.user_id, l.username, l.is_premium, l.fav_team, l.total_points, l.correct_outcomes, l.correct_scores, l.weeks_played, l.weeks_won, now));

  await env.DB.batch(stmts);
  return { ok: true, at: now, champions: champions.length, leaderboard: Object.keys(lbAgg).length, scored_bets: factScore.length };
}

// Normalize a team name for cross-source matching: strip accents + punctuation,
// lowercase, then alias known divergences (FIFA "Cabo Verde" → our "Cape Verde").
function normTeam(name) {
  const base = String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  const alias = {
    unitedstates: 'usa', korearepublic: 'southkorea', czechrepublic: 'czechia',
    bosniaandherzegovina: 'bosniaherzegovina', caboverde: 'capeverde',
  };
  return alias[base] || base;
}

// FIFA World Cup 2026 (api.fifa.com): competition 17, season 285023.
const FIFA_COMPETITION = '17';
const FIFA_SEASON = '285023';

// Ingest FIFA World Cup results into bronze_match_results (source='fifa').
// One call returns the whole calendar; MatchStatus 0 = played/finished.
async function ingestFifaResults(env) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const url = `https://api.fifa.com/api/v3/calendar/matches?idCompetition=${FIFA_COMPETITION}&idSeason=${FIFA_SEASON}&count=500&language=en`;
  const r = await fetch(url, { headers: { 'User-Agent': 'betty-predictor' } });
  if (!r.ok) throw new Error(`FIFA API ${r.status}`);
  const data = await r.json();
  const games = data.Results || [];

  let landed = 0;
  const stmts = [];
  for (const g of games) {
    const home = ((g.Home || {}).TeamName || [{}])[0].Description;
    const away = ((g.Away || {}).TeamName || [{}])[0].Description;
    if (!home || !away) continue;
    const finished = g.MatchStatus === 0;
    stmts.push(env.DB.prepare(
      'INSERT OR REPLACE INTO bronze_match_results (source,source_id,date_utc,home_team,away_team,home_score,away_score,status,fetched_at) VALUES (?,?,?,?,?,?,?,?,?)'
    ).bind('fifa', String(g.IdMatch), g.Date, home, away,
      g.HomeTeamScore != null ? Number(g.HomeTeamScore) : null,
      g.AwayTeamScore != null ? Number(g.AwayTeamScore) : null,
      finished ? 'finished' : 'scheduled', now));
    landed++;
  }
  if (stmts.length) await env.DB.batch(stmts);
  return { ok: true, source: 'fifa', total: games.length, landed };
}

// Reconcile finished bronze_match_results against our matches by team identity +
// date window. DRY by default: returns proposed changes. apply=true writes them.
async function reconcileResults(env, { apply = false } = {}) {
  const [{ results: feed }, { results: matches }] = await Promise.all([
    env.DB.prepare("SELECT * FROM bronze_match_results WHERE status = 'finished'").all(),
    env.DB.prepare('SELECT * FROM matches').all(),
  ]);

  // index feed games by unordered normalized team-pair
  const feedByPair = {};
  for (const g of feed) {
    const a = normTeam(g.home_team), b = normTeam(g.away_team);
    const key = [a, b].sort().join('|');
    feedByPair[key] = {
      date: g.date_utc, scores: { [a]: g.home_score, [b]: g.away_score },
    };
  }

  const DAY = 86400000;
  const proposals = [];
  for (const m of matches) {
    const h = normTeam(m.home_team), aw = normTeam(m.away_team);
    const g = feedByPair[[h, aw].sort().join('|')];
    if (!g) continue;
    // date sanity: within ±1.5 days (timezone tolerance)
    if (m.match_date_utc && g.date) {
      const dt = Math.abs(new Date(m.match_date_utc).getTime() - new Date(g.date).getTime());
      if (dt > 1.5 * DAY) continue;
    }
    const hs = g.scores[h], as = g.scores[aw];
    if (hs == null || as == null) continue;
    const result = hs > as ? '1' : hs < as ? '2' : 'X';
    const changed = m.home_score !== hs || m.away_score !== as || m.result !== result;
    proposals.push({
      match_id: m.id, teams: `${m.home_team} v ${m.away_team}`,
      current: { home: m.home_score, away: m.away_score, result: m.result },
      proposed: { home: hs, away: as, result }, changed,
    });
  }

  const toApply = proposals.filter(p => p.changed);
  if (apply && toApply.length) {
    const stmts = toApply.map(p => env.DB.prepare(
      "UPDATE matches SET home_score=?, away_score=?, result=?, status='finished', is_active=3, updated_at=datetime('now') WHERE id=?"
    ).bind(p.proposed.home, p.proposed.away, p.proposed.result, p.match_id));
    await env.DB.batch(stmts);
  }
  return { ok: true, apply, matched: proposals.length, changed: toApply.length, proposals };
}

// Mirror gold marts → sheet (one-way, read-only export for monitoring).
// Overwrites the Champions + Leaderboard tabs from gold_* on every run.
// These tabs are SINKS — never read back as a source.
const CHAMP_HEADER = ['Week ID', 'User ID', 'Username', 'Total Points', 'Correct Outcomes',
  'Correct Scores', 'Matches Predicted', 'Adjustment Points', 'Last Bet At', 'Rank', 'Computed At'];
const LB_HEADER = ['User ID', 'Username', 'Total Points', 'Correct Outcomes', 'Correct Scores',
  'Weeks Played', 'Weeks Won', 'Computed At'];

async function exportMartsToSheet(env) {
  if (!env.GOOGLE_SA_JSON || !env.SHEETS_SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SA_JSON or SHEETS_SPREADSHEET_ID secret');
  }
  const sa = JSON.parse(env.GOOGLE_SA_JSON);
  const token = await getGoogleAccessToken(sa);
  const sid = env.SHEETS_SPREADSHEET_ID;

  const { results: champ } = await env.DB.prepare(
    'SELECT * FROM gold_champions ORDER BY week_id DESC, rank').all();
  const { results: lb } = await env.DB.prepare(
    'SELECT * FROM gold_leaderboard ORDER BY total_points DESC, username').all();

  const champRows = [CHAMP_HEADER, ...champ.map(c => [
    c.week_id, c.user_id, c.username, c.total_points, c.correct_outcomes, c.correct_scores,
    c.matches_predicted, c.adjustment_points, c.last_bet_at || '', c.rank, c.computed_at,
  ].map(v => v == null ? '' : String(v)))];
  const lbRows = [LB_HEADER, ...lb.map(l => [
    l.user_id, l.username, l.total_points, l.correct_outcomes, l.correct_scores,
    l.weeks_played, l.weeks_won, l.computed_at,
  ].map(v => v == null ? '' : String(v)))];

  for (const [tab, rows] of [['Champions', champRows], ['Leaderboard', lbRows]]) {
    await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${tab}!A:Z:clear`,
      token, 'POST', {});
    await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${tab}!A1?valueInputOption=RAW`,
      token, 'PUT', { range: `${tab}!A1`, majorDimension: 'ROWS', values: rows });
  }
  return { ok: true, champions: champ.length, leaderboard: lb.length };
}

async function sheetsFetch(url, token, method, body) {
  const r = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Sheets ${method} ${url} → ${r.status} ${await r.text()}`);
  return r.json();
}

// Build a JWT signed with the SA private key (RS256) and exchange it for an
// OAuth access token scoped to Sheets writes. Uses Web Crypto — no deps.
async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const toB64Url = (s) => btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerEnc = toB64Url(JSON.stringify(header));
  const claimEnc = toB64Url(JSON.stringify(claim));
  const signingInput = `${headerEnc}.${claimEnc}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput));
  const sig = toB64Url(String.fromCharCode(...new Uint8Array(sigBuf)));
  const jwt = `${signingInput}.${sig}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!r.ok) throw new Error(`Google token: ${r.status} ${await r.text()}`);
  const { access_token } = await r.json();
  return access_token;
}

function pemToDer(pem) {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
