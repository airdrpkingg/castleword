// api/score.js
// Saves a player's score for today's word.
// Called from the frontend when the game ends.
//
// POST body: { fid, username, pfpUrl, tries, points, won }
// Requires Vercel KV (set KV_REST_API_URL + KV_REST_API_TOKEN in env vars)

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fid, username, pfpUrl, tries, points, won } = req.body;
  if (!fid || !username) return res.status(400).json({ error: 'fid and username required' });

  // Key format: scores:<dayNum>:<fid>
  const dayNum = Math.floor(Date.now() / 86400000);
  const scoreKey = `scores:${dayNum}:${fid}`;

  // Don't overwrite if already submitted today
  const existing = await kv.get(scoreKey);
  if (existing) return res.status(200).json({ ok: true, duplicate: true });

  const entry = {
    fid,
    username,
    pfpUrl: pfpUrl || null,
    tries: won ? tries : null,
    points,
    won,
    submittedAt: Date.now(),
  };

  // Store individual score (expires in 2 days)
  await kv.set(scoreKey, JSON.stringify(entry), { ex: 172800 });

  // Add to sorted set for leaderboard (score = points, 0 if lost)
  await kv.zadd(`leaderboard:${dayNum}`, { score: points, member: String(fid) });

  // Also store the entry data separately for display
  await kv.hset(`players:${dayNum}`, { [String(fid)]: JSON.stringify(entry) });

  return res.status(200).json({ ok: true });
}
