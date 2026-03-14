// api/leaderboard.js
// Returns the global leaderboard for today's word.
//
// GET /api/leaderboard          → top 50 by points (default)
// GET /api/leaderboard?sort=tries → sorted by fewest tries
//
// Requires Vercel KV (set KV_REST_API_URL + KV_REST_API_TOKEN in env vars)

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const dayNum = Math.floor(Date.now() / 86400000);
  const sort = req.query.sort || 'points';

  // Get top 50 fids by score (descending)
  const topFids = await kv.zrange(`leaderboard:${dayNum}`, 0, 49, { rev: true });

  if (!topFids.length) return res.status(200).json({ players: [], day: dayNum });

  // Fetch player data
  const rawPlayers = await kv.hmget(`players:${dayNum}`, ...topFids.map(String));

  let players = rawPlayers
    .filter(Boolean)
    .map(raw => {
      try { return JSON.parse(raw); } catch { return null; }
    })
    .filter(Boolean);

  // Sort
  if (sort === 'tries') {
    players.sort((a, b) => {
      if (!a.tries && !b.tries) return 0;
      if (!a.tries) return 1;
      if (!b.tries) return -1;
      return a.tries - b.tries;
    });
  } else {
    players.sort((a, b) => (b.points || 0) - (a.points || 0));
  }

  return res.status(200).json({
    players,
    day: dayNum,
    total: players.length,
  });
}
