// api/webhook.js — updated for Upstash Redis
import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
      }
      break;
    case 'miniapp_removed':
    case 'notifications_disabled':
      if (userFid) await kv.hdel('notification_tokens', String(userFid));
      break;
    case 'notifications_enabled':
      if (notificationDetails?.token && userFid) {
        await kv.hset('notification_tokens', {
          [String(userFid)]: JSON.stringify({
            token: notificationDetails.token,
            url: notificationDetails.url,
            enabledAt: Date.now(),
          }),
        });
      }
      break;
  }

  return res.status(200).json({ ok: true });
}
