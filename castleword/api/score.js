// api/score.js — updated for Upstash Redis
import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fid, username, pfpUrl, tries, points, won } = req.body;
  if (!fid || !username) return res.status(400).json({ error: 'fid and username required' });

  const dayNum = Math.floor(Date.now() / 86400000);
  const scoreKey = `scores:${dayNum}:${fid}`;

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

  await kv.set(scoreKey, JSON.stringify(entry), { ex: 172800 });
  await kv.zadd(`leaderboard:${dayNum}`, { score: points, member: String(fid) });
  await kv.hset(`players:${dayNum}`, { [String(fid)]: JSON.stringify(entry) });

  return res.status(200).json({ ok: true });
}
