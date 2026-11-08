// API for the score app. Static files in /public are served by Workers Assets;
// only /api/* requests reach this code.
//
//   GET /api/state                    -> { settings, history } in one request (used for polling)
//   GET /api/settings | /api/history  -> stored JSON (or null)
//   PUT /api/settings | /api/history  -> replace stored JSON, requires X-App-Pin

const VALIDATORS = {
  settings: (v) => v !== null && typeof v === 'object' && Array.isArray(v.playerNames) && typeof v.scores === 'object',
  history: (v) => Array.isArray(v),
};

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const key = url.pathname.slice('/api/'.length);
    if (key === 'state' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT key, value FROM app_data').all();
      const state = { settings: null, history: null };
      for (const row of results) {
        if (Object.hasOwn(state, row.key)) state[row.key] = JSON.parse(row.value);
      }
      return json(state);
    }
    if (!Object.hasOwn(VALIDATORS, key)) {
      return json({ error: 'Not found' }, 404);
    }

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT value FROM app_data WHERE key = ?').bind(key).first();
      return new Response(row ? row.value : 'null', { headers: JSON_HEADERS });
    }

    if (request.method === 'PUT') {
      if (!env.APP_PIN) {
        return json({ error: 'APP_PIN is not configured on the server' }, 500);
      }
      if (!(await isPinValid(request.headers.get('X-App-Pin'), env.APP_PIN))) {
        return json({ error: 'Invalid PIN' }, 401);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }
      if (!VALIDATORS[key](body)) {
        return json({ error: `Invalid ${key} payload` }, 400);
      }

      await env.DB.prepare(
        `INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(key, JSON.stringify(body), Date.now()).run();

      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, PUT' });
  },
};

// The client sends the PIN URI-encoded so non-ASCII PINs survive the header.
// Both sides are hashed first so timingSafeEqual always gets equal-length input.
async function isPinValid(given, expected) {
  if (!given) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all(
    [given, encodeURIComponent(expected)].map((s) => crypto.subtle.digest('SHA-256', encoder.encode(s)))
  );
  return crypto.subtle.timingSafeEqual(a, b);
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}
