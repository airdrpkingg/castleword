async function kvSet(key, value, ex) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const body = ex ? ["SET", key, value, "EX", ex] : ["SET", key, value];
  await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function kvGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["GET", key])
  });
  const d = await r.json();
  return d.result;
}
async function kvZadd(key, score, member) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["ZADD", key, score, member])
  });
}
async function kvHset(key, field, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["HSET", key, field, value])
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { fid, username, pfpUrl, tries, points, won } = req.body;
  if (!fid || !username) return res.status(400).json({ error: "fid and username required" });

  const dayNum = Math.floor(Date.now() / 86400000);
  const scoreKey = "scores:" + dayNum + ":" + fid;

  const existing = await kvGet(scoreKey);
  if (existing) return res.status(200).json({ ok: true, duplicate: true });

  const entry = JSON.stringify({ fid, username, pfpUrl: pfpUrl || null, tries: won ? tries : null, points, won, submittedAt: Date.now() });

  await kvSet(scoreKey, entry, 172800);
  await kvZadd("leaderboard:" + dayNum, points, String(fid));
  await kvHset("players:" + dayNum, String(fid), entry);

  return res.status(200).json({ ok: true });
};
