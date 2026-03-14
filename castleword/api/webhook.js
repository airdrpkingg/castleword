async function kvHset(key, field, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["HSET", key, field, value])
  });
}
async function kvHdel(key, field) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["HDEL", key, field])
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { event, notificationDetails } = body;
  const userFid = body.fid || (body.data && body.data.fid);

  if (event === "miniapp_added" || event === "notifications_enabled") {
    if (notificationDetails && notificationDetails.token && userFid) {
      await kvHset("notification_tokens", String(userFid), JSON.stringify({
        token: notificationDetails.token,
        url: notificationDetails.url,
        addedAt: Date.now()
      }));
    }
  } else if (event === "miniapp_removed" || event === "notifications_disabled") {
    if (userFid) await kvHdel("notification_tokens", String(userFid));
  }

  return res.status(200).json({ ok: true });
};
