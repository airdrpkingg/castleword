// api/webhook.js
// Handles Farcaster miniapp webhook events:
//   - miniapp_added       → user adds CastleWord (save their notification token)
//   - miniapp_removed     → user removes it (delete token)
//   - notifications_disabled / notifications_enabled
//
// Requires Vercel KV for token storage.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { event, notificationDetails, fid } = body;
  const userFid = fid || body.data?.fid;

  switch (event) {
    case 'miniapp_added':
      if (notificationDetails?.token && notificationDetails?.url && userFid) {
        await kv.hset('notification_tokens', {
          [String(userFid)]: JSON.stringify({
            token: notificationDetails.token,
            url: notificationDetails.url,
            addedAt: Date.now(),
          }),
        });
        console.log(`[webhook] User ${userFid} added CastleWord — token saved`);
      }
      break;

    case 'miniapp_removed':
    case 'notifications_disabled':
      if (userFid) {
        await kv.hdel('notification_tokens', String(userFid));
        console.log(`[webhook] User ${userFid} removed — token deleted`);
      }
      break;

    case 'notifications_enabled':
      if (notificationDetails?.token && notificationDetails?.url && userFid) {
        await kv.hset('notification_tokens', {
          [String(userFid)]: JSON.stringify({
            token: notificationDetails.token,
            url: notificationDetails.url,
            enabledAt: Date.now(),
          }),
        });
      }
      break;

    default:
      console.log(`[webhook] Unknown event: ${event}`);
  }

  return res.status(200).json({ ok: true });
}

// ─── Helper: send daily notification to all subscribers ───────────────────
// Call this from a Vercel Cron job at your chosen daily time.
// Add to vercel.json: "crons": [{ "path": "/api/notify", "schedule": "0 9 * * *" }]
export async function sendDailyNotifications() {
  const tokens = await kv.hgetall('notification_tokens');
  if (!tokens) return;

  const entries = Object.values(tokens).map(v => {
    try { return JSON.parse(v); } catch { return null; }
  }).filter(Boolean);

  const dayNum = Math.floor(Date.now() / 86400000);

  const results = await Promise.allSettled(
    entries.map(({ token, url }) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: `castleword-day-${dayNum}`,
          title: '🏰 CastleWord',
          body: "Today's word is ready. Can you get it in one?",
          targetUrl: 'https://castleword.xyz',
          tokens: [token],
        }),
      })
    )
  );

  const ok = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[notify] Sent ${ok}/${entries.length} notifications`);
}
