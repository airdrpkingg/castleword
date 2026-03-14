async function kvZrange(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["ZRANGE", key, 0, 49, "REV"])
  });
  const d = await r.json();
  return d.result || [];
}
async function kvHmget(key, fields) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["HMGET", key, ...fields])
  });
  const d = await r.json();
  return d.result || [];
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const dayNum = Math.floor(Date.now() / 86400000);
  const sort = (req.query && req.query.sort) || "points";

  const topFids = await kvZrange("leaderboard:" + dayNum);
  if (!topFids.length) return res.status(200).json({ players: [], day: dayNum });

  const raw = await kvHmget("players:" + dayNum, topFids.map(String));
  let players = raw.filter(Boolean).map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);

  if (sort === "tries") {
    players.sort((a, b) => {
      if (!a.tries && !b.tries) return 0;
      if (!a.tries) return 1; if (!b.tries) return -1;
      return a.tries - b.tries;
    });
  } else {
    players.sort((a, b) => (b.points || 0) - (a.points || 0));
  }

  return res.status(200).json({ players, day: dayNum, total: players.length });
};
