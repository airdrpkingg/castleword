// api/leaderboard.js — updated for Upstash Redis
import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const dayNum = Math.floor(Date.now() / 86400000);
  const sort = req.query.sort || 'points';

  const topFids = await kv.zrange(`leaderboard:${dayNum}`, 0, 49, { rev: true });

  if (!topFids.length) return res.status(200).json({ players: [], day: dayNum });

  const rawPlayers = await kv.hmget(`players:${dayNum}`, ...topFids.map(String));

  let players = rawPlayers
    .filter(Boolean)
    .map(raw => {
      try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
    })
    .filter(Boolean);

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

  return res.status(200).json({ players, day: dayNum, total: players.length });
}
