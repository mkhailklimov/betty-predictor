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

export default {
  // Cron triggers — dispatch by schedule string:
  //   "0 * * * *"  → hourly match-status update
  //   "0 6 * * 5"  → weekly users D1→Sheets sync
  async scheduled(event, env, ctx) {
    if (event.cron === '0 6 * * 5') {
      ctx.waitUntil(syncUsersToSheet(env));
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
        const { tg_id, username } = body;
        if (!tg_id) return json({ detail: 'tg_id required' }, 400);

        const existing = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(tg_id).first();
        if (existing) return json(existing, 200);

        const id = uuid();
        const displayName = username || `User_${tg_id}`;
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
        const token = getToken(request);
        if (!token) return json({ detail: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) return json({ detail: 'User not found' }, 401);
        await env.DB.prepare(
          'UPDATE users SET ton_wallet = ?, ton_consent = 1, updated_at = datetime("now") WHERE id = ?'
        ).bind(ton_address, user.id).run();
        return json({ ok: true });
      }

      if (method === 'GET' && path === '/api/user/me') {
        const token = getToken(request);
        if (token) {
          const user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
          if (user) return json(user);
        }
        const user = await env.DB.prepare('SELECT * FROM users LIMIT 1').first();
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

        const token = getToken(request);
        let user;
        if (token) {
          user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        }
        if (!user) return json({ detail: 'User not found' }, 401);

        const match = await env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(match_id).first();
        if (!match) return json({ detail: 'Match not found' }, 404);
        if (match.status === 'finished') return json({ detail: 'Cannot predict on finished match' }, 400);

        // Kickoff lockout: reject if match has started (using UTC time field)
        if (match.time) {
          const kickoff = new Date(match.time.replace(' ', 'T') + 'Z');
          if (new Date() >= kickoff) {
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
        const token = getToken(request);
        let user;
        if (token) {
          user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        }
        if (!user) {
          user = await env.DB.prepare('SELECT * FROM users LIMIT 1').first();
        }
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

      // --- Leaderboard ---
      if (method === 'GET' && (path === '/api/leaderboard' || path === '/api/leaderboard/overall')) {
        const { results: users } = await env.DB.prepare('SELECT * FROM users').all();
        const { results: predictions } = await env.DB.prepare('SELECT * FROM predictions').all();
        const { results: matches } = await env.DB.prepare("SELECT * FROM matches WHERE status = 'finished'").all();

        const matchMap = {};
        for (const m of matches) matchMap[m.id] = m;

        const userData = {};
        for (const u of users) {
          userData[u.id] = {
            username: u.username || `User_${u.tg_id}`,
            points: 0,
            correct_predictions: 0,
            correct_scores: 0,
            is_premium: u.is_premium === 1,
            fav_team: u.fav_team || null,
          };
        }

        for (const p of predictions) {
          const match = matchMap[p.match_id];
          if (!match || !userData[p.user_id]) continue;

          const isCorrect1X2 =
            (p.prediction_type === '1' && match.home_score > match.away_score) ||
            (p.prediction_type === '2' && match.away_score > match.home_score) ||
            (p.prediction_type === 'X' && match.home_score === match.away_score);

          if (isCorrect1X2) {
            userData[p.user_id].correct_predictions += 1;
            userData[p.user_id].points += 1;

            if (p.predicted_score) {
              let score = p.predicted_score;
              if (typeof score === 'string') {
                try { score = JSON.parse(score); } catch {}
              }
              if (score.home === match.home_score && score.away === match.away_score) {
                userData[p.user_id].correct_scores += 1;
                userData[p.user_id].points += 3;
              }
            }
          }
        }

        const leaderboard = Object.entries(userData)
          .sort((a, b) => b[1].points - a[1].points)
          .map(([user_id, data], i) => ({
            rank: i + 1,
            user_id,
            username: data.username,
            points: data.points,
            correct_predictions: data.correct_predictions,
            correct_scores: data.correct_scores,
            is_premium: data.is_premium,
            fav_team: data.fav_team,
          }));

        return json(leaderboard);
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
        const token = getToken(request);
        let user;
        if (token) user = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(token).first();
        if (!user) user = await env.DB.prepare('SELECT * FROM users LIMIT 1').first();
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
        const token = getToken(request);
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
        const token = getToken(request);
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

function getToken(request) {
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
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
