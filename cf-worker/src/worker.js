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

export default {
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
        const { tg_id, first_name, last_name, username } = body;
        if (!tg_id) return json({ detail: 'tg_id required' }, 400);

        const existing = await env.DB.prepare('SELECT * FROM users WHERE tg_id = ?').bind(tg_id).first();
        if (existing) return json(existing, 200);

        const id = uuid();
        const displayName = username || first_name || `User_${tg_id}`;
        await env.DB.prepare(
          'INSERT INTO users (id, tg_id, username) VALUES (?, ?, ?)'
        ).bind(id, tg_id, displayName).run();

        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
        return json(user, 201);
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

      // --- Telegram ---
      if (method === 'POST' && path === '/api/telegram/web-app-data') {
        const body = await request.json();
        if (!body.init_data) return json({ detail: 'init_data required' }, 400);
        return json({ success: true, message: 'Data received' });
      }

      if (method === 'GET' && path === '/api/telegram/bot-info') {
        return json({ mini_app_url: 'https://betty-tg-app.netlify.app', status: 'active' });
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
